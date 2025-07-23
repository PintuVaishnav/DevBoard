import { Router } from "express";
import { db } from "../../db";
import { tokens } from "@shared/schema/tokens";
import { eq, and } from "drizzle-orm";
import { sendSlackNotification } from "server/utils/slack.ts";
const router = Router();

// 🔹 Helper: Get GitHub token by user ID
async function getGitHubToken(userId: string) {
  const result = await db
    .select()
    .from(tokens)
    .where(and(eq(tokens.userId, userId), eq(tokens.service, "github")))
    .limit(1);
  return result[0]?.tokenValue;
}

// 🔹 Shared GitHub fetch helper
const githubFetch = async (url: string, token: string) => {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "DevBoard",
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
};

// 🔹 GET /api/github/repos
router.get("/repos", async (req, res) => {
  const userId = req.user?.id || "dev-user";
  console.log("📥 [GET] /api/github/repos :: User ID:", userId);

  try {
    const token = await getGitHubToken(userId);
    if (!token) return res.status(401).json({ error: "GitHub token not found" });

    const repos = await githubFetch("https://api.github.com/user/repos?per_page=100", token);

    const enrichedRepos = await Promise.all(
      repos.map(async (repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description,
        language: repo.language,
        visibility: repo.private ? "private" : "public",
        fork: repo.fork,
        pushed_at: repo.pushed_at,
        has_workflows: repo.topics?.includes("actions") || false,
      }))
    );

    res.json(enrichedRepos);
  } catch (error) {
    console.error("❌ Error fetching GitHub repos:", error);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

// 🔹 GET /api/github/actions
router.get("/actions", async (req, res) => {
  const userId = req.user?.id || "dev-user";
  console.log("📥 [GET] /api/github/actions :: User ID:", userId);

  try {
    const token = await getGitHubToken(userId);
    if (!token) return res.status(401).json({ error: "GitHub token not found" });

    const repos = await githubFetch("https://api.github.com/user/repos?per_page=100", token);

    const actions = await Promise.all(
      repos.map(async (repo: any) => {
        try {
          const workflows = await githubFetch(
            `https://api.github.com/repos/${repo.full_name}/actions/runs?per_page=1`,
            token
          );

          if (!workflows.workflow_runs?.length) return null;

          const run = workflows.workflow_runs[0];
            if (run.conclusion === "failure") {
  await fetch("http://localhost:5000/api/slack/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `❌ GitHub Action Failed\n• Repo: ${repo.name}\n• Branch: ${run.head_branch}\n• Status: ${run.status}`,
    }),
  });
}
          return {
            repo: repo.name,
            branch: run.head_branch,
            status: run.status,
            conclusion: run.conclusion,
            duration: Math.floor(
              (new Date(run.updated_at).getTime() - new Date(run.created_at).getTime()) / 1000
            ),
            commitMessage: run.head_commit?.message || "No commit message",
            html_url: run.html_url,
            created_at: run.created_at,
          };
        

        } catch (err) {
          console.warn(`⚠️ No workflows found for ${repo.name}`);
          return null;
        }
      })
    );

    const validActions = actions.filter(Boolean);
    res.json(validActions);
  } catch (err) {
    console.error("💥 Error in /actions route:", err);
    res.status(500).json({ error: "Failed to fetch GitHub Actions" });
  }
});

export default router;
