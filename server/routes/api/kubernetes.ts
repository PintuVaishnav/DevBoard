import { Router } from 'express';
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';
import { db } from '../../db';
import { tokens } from '@shared/schema/tokens';
import { eq, and } from 'drizzle-orm';
import * as k8s from '@kubernetes/client-node';

const router = Router();

async function getGcpToken(userId: string) {
  const result = await db
    .select()
    .from(tokens)
    .where(and(eq(tokens.userId, userId), eq(tokens.service, 'gcp')))
    .limit(1);
  return result[0]?.tokenValue;
}

router.get('/overview', async (req, res) => {
  const userId = req.user?.id || 'dev-user';

  try {
    const keyJson = await getGcpToken(userId);
    if (!keyJson) return res.status(401).json({ error: 'No GCP token found' });

    const key = JSON.parse(keyJson);
    const auth = new GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();
    const accessToken = typeof token === 'string' ? token : token?.token;

    if (!accessToken) throw new Error('No access token received');
    console.log('✅ Access Token:', accessToken);

    const container = google.container({ version: 'v1', auth: client });
    const projectId = key.project_id;

    const clusterList = await container.projects.locations.clusters.list({
      parent: `projects/${projectId}/locations/-`,
    });

    const clusters = clusterList.data.clusters || [];
    if (!clusters.length)
      return res.json({ clusters: [], pods: [], services: [], deployments: [], nodes: [], projectId });

    const cluster = clusters[0];
    console.log('✅ Cluster endpoint:', cluster.endpoint);

    const clusterInfo = {
      name: cluster.name,
      type: 'Cluster',
      namespace: '—',
      status: cluster.status,
      projectId,
      createdAt: cluster.createTime,
    };

    const kc = new k8s.KubeConfig();
    kc.loadFromOptions({
      clusters: [
        {
          name: cluster.name!,
          server: `https://${cluster.endpoint}`,
          skipTLSVerify: true,
        },
      ],
      users: [
        {
          name: 'gcp-user',
          token: accessToken!,
        },
      ],
      contexts: [
        {
          name: 'gcp-context',
          user: 'gcp-user',
          cluster: cluster.name!,
        },
      ],
      currentContext: 'gcp-context',
    });

    const coreApi = kc.makeApiClient(k8s.CoreV1Api);
    const appsApi = kc.makeApiClient(k8s.AppsV1Api);

    try {
      const testPods = await coreApi.listPodForAllNamespaces();
      console.log('✅ Test Pods Length:', testPods.items.length);
    } catch (err) {
      console.error('❌ Test Kubernetes API Error:', err);
    }

    const [podsRes, servicesRes, nodesRes, deploymentsRes] = await Promise.allSettled([
      coreApi.listPodForAllNamespaces(),
      coreApi.listServiceForAllNamespaces(),
      coreApi.listNode(),
      appsApi.listDeploymentForAllNamespaces(),
    ]);

    function mapItems(res: PromiseSettledResult<any>, label: string) {
      if (res.status !== 'fulfilled') {
        console.error(`❌ ${label} fetch failed:`, res.reason ?? '');
        return [];
      }

      if (!res.value || !Array.isArray(res.value.items)) {
        console.error(`❌ ${label} items not array; Response:\n`, JSON.stringify(res.value, null, 2));
        return [];
      }

      return res.value.items;
    }

    const pods = mapItems(podsRes, 'Pods').map(p => ({
      name: p.metadata?.name,
      type: 'Pod',
      namespace: p.metadata?.namespace,
      status: p.status?.phase,
      projectId,
      createdAt: p.metadata?.creationTimestamp,
    }));

    const services = mapItems(servicesRes, 'Services').map(s => ({
      name: s.metadata?.name,
      type: 'Service',
      namespace: s.metadata?.namespace,
      status: s.spec?.type,
      projectId,
      createdAt: s.metadata?.creationTimestamp,
    }));

    const deployments = mapItems(deploymentsRes, 'Deployments').map(d => ({
      name: d.metadata?.name,
      type: 'Deployment',
      namespace: d.metadata?.namespace,
      status: d.status?.replicas ? `${d.status.replicas} replicas` : 'No replicas',
      projectId,
      createdAt: d.metadata?.creationTimestamp,
    }));

    const nodes = mapItems(nodesRes, 'Nodes').map(n => ({
      name: n.metadata?.name,
      type: 'Node',
      namespace: '—',
      status: n.status?.conditions?.find(c => c.type === 'Ready')?.status,
      projectId,
      createdAt: n.metadata?.creationTimestamp,
    }));

    res.json({
      clusters: [clusterInfo],
      pods,
      services,
      deployments,
      nodes,
      projectId,
    });
  } catch (err: any) {
    console.error('❌ Kubernetes Fetch Error:', err?.message ?? err);
    res.status(500).json({ error: 'Failed to fetch Kubernetes data', message: err?.message ?? String(err) });
  }
});

export default router;
