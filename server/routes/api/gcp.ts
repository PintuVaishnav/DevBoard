import { Router } from "express";
import { db } from "../../db";
import { tokens } from "@shared/schema/tokens";
import { eq, and } from "drizzle-orm";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";

const router = Router();

async function getGcpToken(userId: string) {
  const result = await db
    .select()
    .from(tokens)
    .where(and(eq(tokens.userId, userId), eq(tokens.service, "gcp")))
    .limit(1);
  return result[0]?.tokenValue;
}

router.get("/resources", async (req, res) => {
  const userId = req.user?.id || "dev-user";

  try {
    const keyJson = await getGcpToken(userId);
    if (!keyJson) return res.status(401).json({ error: "No GCP token found" });

    const key = JSON.parse(keyJson);
    const auth = new GoogleAuth({
      credentials: key,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await auth.getClient();

    const cloudResourceManager = google.cloudresourcemanager('v1');
    const projectListResp = await cloudResourceManager.projects.list({ auth: client });
    const projects = projectListResp.data.projects || [];

    const allResources = [];

    for (const project of projects) {
      const projectId = project.projectId;
      const projectName = project.name || projectId;
      if (!projectId) continue;

      const compute = google.compute({ version: "v1", auth: client });
      const container = google.container({ version: "v1", auth: client });
      const storage = google.storage({ version: "v1", auth: client });

      const [vmData, clusterData, bucketData] = await Promise.all([
        compute.instances.aggregatedList({ project: projectId }),
        container.projects.locations.clusters.list({ parent: `projects/${projectId}/locations/-` }),
        storage.buckets.list({ project: projectId }),
      ]);

      const vms = Object.values(vmData.data.items || {}).flatMap((z: any) =>
        z.instances?.map((vm: any) => ({
          name: vm.name,
          type: "VM",
          status: vm.status,
          zone: vm.zone?.split("/").pop() || "unknown",
          createdAt: vm.creationTimestamp,
          projectId,
          projectName,
        })) || []
      );

      const clusters = (clusterData.data.clusters || []).map((c: any) => ({
        name: c.name,
        type: "GKE Cluster",
        status: c.status,
        zone: c.location || c.zone || "unknown",
        createdAt: c.createTime,
        projectId,
        projectName,
      }));

      const buckets = (bucketData.data.items || []).map((b: any) => ({
        name: b.name,
        type: "Bucket",
        status: "ACTIVE",
        zone: b.location || "global",
        createdAt: b.timeCreated,
        projectId,
        projectName,
      }));

      allResources.push(...vms, ...clusters, ...buckets);
    }

    console.log(`✅ All Projects Scanned. Total: ${allResources.length} resources`);
    res.json(allResources);
  } catch (err: any) {
    console.error("❌ GCP Fetch Error:", err.message || err);
    res.status(500).json({ error: "Failed to fetch GCP resources", details: err.message });
  }
});

export default router;
