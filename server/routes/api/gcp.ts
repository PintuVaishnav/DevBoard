import { Router } from "express";
import { db } from "../../db";
import { tokens } from "@shared/schema/tokens";
import { eq, and } from "drizzle-orm";
import { google } from "googleapis"; 
import { GoogleAuth } from "google-auth-library";
const router = Router();

// 🔐 Get GCP token from DB
async function getGcpToken(userId: string) {
  const result = await db.select().from(tokens).where(
    and(eq(tokens.userId, userId), eq(tokens.service, "gcp"))
  ).limit(1);
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

    const compute = google.compute({ version: "v1", auth: client });
    const container = google.container({ version: "v1", auth: client });
    const storage = google.storage({ version: "v1", auth: client });

    const projectId = key.project_id;

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
        zone: vm.zone?.split("/").pop(),
        createdAt: vm.creationTimestamp,
      })) || []
    );

    const clusters = (clusterData.data.clusters || []).map((c: any) => ({
      name: c.name,
      type: "GKE Cluster",
      status: c.status,
      zone: c.location,
      createdAt: c.createTime,
    }));

    const buckets = (bucketData.data.items || []).map((b: any) => ({
      name: b.name,
      type: "Bucket",
      status: "ACTIVE",
      zone: b.location,
      createdAt: b.timeCreated,
    }));

    const allResources = [...vms, ...clusters, ...buckets];
    res.json(allResources);
  } catch (err) {
    console.error("GCP error:", err);
    res.status(500).json({ error: "Failed to fetch GCP resources" });
  }
});

export default router;