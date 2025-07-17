import { db } from "./db";
import { 
  pipelines, 
  featureFlags, 
  healthMetrics, 
  infraCosts, 
  releaseNotes,
  users
} from "@shared/schema";

export async function seedDatabase() {
  try {
    // Create sample pipelines
    await db.insert(pipelines).values([
      {
        name: "frontend-build",
        status: "success",
        branch: "main",
        duration: 222,
        userId: "demo-user-id",
        repository: "company/frontend",
        commitHash: "abc123def456",
        commitMessage: "feat: add new dashboard components",
        logs: "Build completed successfully",
      },
      {
        name: "backend-deploy",
        status: "running", 
        branch: "feature/auth",
        duration: 83,
        userId: "demo-user-id",
        repository: "company/backend",
        commitHash: "def456ghi789",
        commitMessage: "fix: update authentication middleware",
        logs: "Deployment in progress...",
      },
      {
        name: "mobile-app-build",
        status: "failed",
        branch: "develop",
        duration: 450,
        userId: "demo-user-id",
        repository: "company/mobile",
        commitHash: "ghi789jkl012",
        commitMessage: "chore: update dependencies",
        logs: "Build failed: compilation error in src/components/Header.tsx",
      }
    ]).onConflictDoNothing();

    // Create sample feature flags
    await db.insert(featureFlags).values([
      {
        name: "new-dashboard",
        description: "Enable the new dashboard interface",
        enabled: true,
        rolloutPercentage: 25,
        environment: "production",
        userId: "demo-user-id",
      },
      {
        name: "beta-features",
        description: "Access to beta features and experimental functionality",
        enabled: false,
        rolloutPercentage: 0,
        environment: "staging",
        userId: "demo-user-id",
      },
      {
        name: "dark-mode",
        description: "Enable dark mode theme toggle",
        enabled: true,
        rolloutPercentage: 100,
        environment: "production", 
        userId: "demo-user-id",
      }
    ]).onConflictDoNothing();

    // Create sample health metrics
    const now = new Date();
    const healthMetricsData = [];
    
    // Generate metrics for the last 24 hours
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      healthMetricsData.push(
        {
          metricType: "cpu",
          value: (Math.random() * 30 + 50).toFixed(2), // 50-80%
          timestamp,
          service: "main",
        },
        {
          metricType: "memory", 
          value: (Math.random() * 20 + 60).toFixed(2), // 60-80%
          timestamp,
          service: "main",
        },
        {
          metricType: "disk",
          value: (Math.random() * 10 + 40).toFixed(2), // 40-50%
          timestamp,
          service: "main",
        }
      );
    }
    
    await db.insert(healthMetrics).values(healthMetricsData).onConflictDoNothing();

    // Create sample infrastructure costs
    const costData = [];
    const services = ["EC2", "S3", "RDS", "Lambda", "CloudFront"];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      services.forEach(service => {
        costData.push({
          service: service.toLowerCase(),
          cost: (Math.random() * 50 + 10).toFixed(2),
          currency: "USD",
          period: "daily",
          date,
          region: "us-east-1",
        });
      });
    }
    
    await db.insert(infraCosts).values(costData).onConflictDoNothing();

    // Create sample release notes
    await db.insert(releaseNotes).values([
      {
        version: "v2.1.0",
        title: "Major Dashboard Updates",
        content: "## New Features\n\n- Enhanced pipeline monitoring\n- Real-time health metrics\n- Improved feature flag management\n\n## Bug Fixes\n\n- Fixed authentication timeout issues\n- Resolved chart rendering problems\n- Updated API error handling",
        type: "release",
        userId: "demo-user-id",
      },
      {
        version: "v2.0.5",
        title: "Security Hotfix",
        content: "## Security Updates\n\n- Patched authentication vulnerability\n- Updated dependencies with security fixes\n- Enhanced API rate limiting",
        type: "hotfix", 
        userId: "demo-user-id",
      },
      {
        version: "v2.0.4",
        title: "Feature Flag Enhancements",
        content: "## New Features\n\n- Added percentage rollout controls\n- Environment-specific flag management\n- Improved flag analytics\n\n## Improvements\n\n- Better UI for flag configuration\n- Enhanced error reporting",
        type: "feature",
        userId: "demo-user-id",
      }
    ]).onConflictDoNothing();

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}
