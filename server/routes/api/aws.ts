import { Router } from 'express';
// import { fromIni } from '@aws-sdk/credential-providers';
// import { EKSClient, ListClustersCommand } from '@aws-sdk/client-eks';
// import { EC2Client, DescribeInstancesCommand } from '@aws-sdk/client-ec2';
// import { ECSClient, ListClustersCommand as ListEcsClusters, ListTasksCommand } from '@aws-sdk/client-ecs';

const router = Router();

router.get('/resources', async (_req, res) => {
  // ✅ Return 2 fake demo AWS resources
  const demoResources = [
    {
      name: 'demo-eks-cluster',
      type: 'EKS Cluster',
      status: 'ACTIVE',
      zone: 'us-east-1a',
      createdAt: new Date().toISOString(),
      projectName: 'aws-demo-project'
    },
    {
      name: 'i-0demoec2node',
      type: 'EC2 (EKS Node)',
      status: 'running',
      zone: 'us-east-1a',
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      projectName: 'aws-demo-project'
    }
  ];

  res.json(demoResources);

  // 🔓 Uncomment below when you have real AWS credentials

  /*
  try {
    const region = process.env.AWS_REGION || 'us-east-1';
    const creds = fromIni({ profile: process.env.AWS_PROFILE });

    const eks = new EKSClient({ region, credentials: creds });
    const ec2 = new EC2Client({ region, credentials: creds });
    const ecs = new ECSClient({ region, credentials: creds });

    const eksResp = await eks.send(new ListClustersCommand({}));
    const clusterNames = eksResp.clusters || [];

    const resources: any[] = [];

    for (const name of clusterNames) {
      resources.push({ name, type: 'EKS Cluster', status: 'UNKNOWN', zone: '-', createdAt: '-' });

      const ec2Resp = await ec2.send(new DescribeInstancesCommand({
        Filters: [{ Name: 'tag:aws:eks:cluster-name', Values: [name] }]
      }));

      ec2Resp.Reservations?.flatMap(r => r.Instances || []).forEach(i => {
        resources.push({
          name: i.InstanceId,
          type: 'EC2 (EKS Node)',
          status: i.State?.Name,
          zone: i.Placement?.AvailabilityZone,
          createdAt: i.LaunchTime?.toISOString(),
        });
      });
    }

    const ecsClusters = await ecs.send(new ListEcsClusters({}));
    for (const arn of ecsClusters.clusterArns || []) {
      resources.push({ name: arn, type: 'ECS Cluster', status: '-', zone: '-', createdAt: '-' });

      const tasksResp = await ecs.send(new ListTasksCommand({ cluster: arn }));
      (tasksResp.taskArns || []).forEach(t => {
        resources.push({ name: t, type: 'ECS Task', status: 'RUNNING', zone: '-', createdAt: '-' });
      });
    }

    res.json(resources);
  } catch (err: any) {
    console.error('❌ AWS Fetch Error:', err);
    res.status(500).json({ error: 'Failed to fetch AWS resources', message: err.message });
  }
  */
});

export default router;
