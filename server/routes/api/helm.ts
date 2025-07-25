import { Router } from "express";
import { exec } from "child_process";
import { promisify } from "util";

const router = Router();
const execAsync = promisify(exec);

router.get("/releases", async (_req, res) => {
  try {
    const { stdout } = await execAsync(`helm list --all-namespaces --output json`);
    const releases = JSON.parse(stdout).map((r: any) => ({
      name: r.name,
      namespace: r.namespace,
      chart: r.chart,
      status: r.status,
      updated: r.updated,
    }));
    res.json(releases);
  } catch (err) {
    console.error("❌ Helm fetch error:", err);
    res.status(500).json({ error: "Failed to fetch Helm releases" });
  }
});

export default router;
