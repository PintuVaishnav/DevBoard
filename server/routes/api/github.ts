import { Router } from "express";
import { db } from "../../db";
import { tokens } from "@shared/schema/tokens";
import { eq, and } from "drizzle-orm";

const router = Router();

// 🔹 Helper to get token by user
async function getGitHubToken(userId: string) {
  const result = await db
    .select()
    .from(tokens)
    .where(and(eq(tokens.userId, userId), eq(tokens.service, "github")))
    .limit(1);

  console.log("🔎 Token DB query result:", result);
  return result[0]?.tokenValue;
}

// 🔹 GET /api/github/repos
router.get("/repos", async (req, res) => {
  const userId = req.user?.id || "dev-user"; // consistent fallback
  console.log("📥 [GET] /api/github/repos :: User ID:", userId);

  try {
    const token = await getGitHubToken(userId);
    if (!token) {
      console.warn("❌ No GitHub token found for user:", userId);
      return res.status(401).json({ error: "GitHub token not found" });
    }

    console.log("✅ GitHub token found. Fetching repos...");

    const response = await fetch("https://api.github.com/user/repos?per_page=100", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ GitHub API error:", data);
      return res.status(response.status).json({ error: data });
    }

    console.log(`📁 Success: ${data.length} repositories fetched`);
    res.json(data);
  } catch (error) {
    console.error("💥 Unexpected error in /repos route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🔹 GET /api/github/actions
router.get("/actions", async (req, res) => {
  const userId = req.user?.id || "dev-user";
  console.log("📥 [GET] /api/github/actions :: User ID:", userId);

  try {
    const token = await getGitHubToken(userId);
    if (!token) {
      console.warn("❌ No GitHub token found for user:", userId);
      return res.status(401).json({ error: "GitHub token not found" });
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "DevBoard",
    };

    // Step 1: Fetch all repos
    const reposRes = await fetch("https://api.github.com/user/repos?per_page=100", { headers });
    const repos = await reposRes.json();

    if (!reposRes.ok) {
      console.error("❌ Error fetching GitHub repos:", repos);
      return res.status(reposRes.status).json({ error: repos });
    }

    // Step 2: Fetch workflows for each repo
    const allRuns = await Promise.all(
      repos.map(async (repo: any) => {
        try {
          const workflowRes = await fetch(
            `https://api.github.com/repos/${repo.full_name}/actions/runs?per_page=1`,
            { headers }
          );
          const workflowData = await workflowRes.json();

          return workflowData.workflow_runs?.map((run: any) => ({
            repo: repo.name,
            branch: run.head_branch,
            status: run.status,
            conclusion: run.conclusion,
            duration: Math.floor(
              (new Date(run.updated_at).getTime() - new Date(run.created_at).getTime()) / 1000
            ),
            commitMessage: run.head_commit?.message,
            html_url: run.html_url,
          }));
        } catch (err) {
          console.warn(`⚠️ Failed to fetch workflows for repo: ${repo.name}`, err);
          return [];
        }
      })
    );

    const flattened = allRuns.flat().filter(Boolean);
    console.log(`✅ ${flattened.length} GitHub Actions fetched`);
    res.json(flattened);
  } catch (err) {
    console.error("💥 Error in /actions route:", err);
    res.status(500).json({ error: "Failed to fetch GitHub Actions" });
  }
});

export default router;
