import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import "dotenv/config";
import "./googleauth";
import "./githubauth";
import cors from "cors";
import { authenticateUser } from "./middleware/authenticateUser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { users } from "@shared/schema";
import githubRoutes from "./routes/api/github";
import slackRoutes from "./routes/api/slack";
import dockerhub from "./routes/api/dockerhub";
import kubernetes from "./routes/api/kubernetes";
import gcpRoutes from "./routes/api/gcp";
import aws from "./routes/api/aws";
import helmRoutes from "./routes/api/helm";
import infraCostsRoute from "./routes/api/infra-costs";
import RegisterRoutes from "./routes/api/register";

const app = express();
app.set("trust proxy", 1);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS setup
app.use(
  cors({
    origin: "https://dev-board-psi.vercel.app/",
    credentials: true,
  })
);

// Session config
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set in your .env file");
}
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// ⬇ Register route for form signup (before auth check)
app.use("/auth", RegisterRoutes);

// ✅ Auth middleware
app.use(authenticateUser);

// ✅ API routes
app.use("/api/github", githubRoutes);
app.use("/api/slack", slackRoutes);
app.use("/api/dockerhub", dockerhub);
app.use("/api/gcp", gcpRoutes);
app.use("/api/helm", helmRoutes);
app.use("/api/kubernetes", kubernetes);
app.use("/api/aws", aws);
app.use("/api/infra-costs", infraCostsRoute);

// 🧠 API logger
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJson: any;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    capturedJson = body;
    return originalJson.apply(res, [body, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJson) line += ` :: ${JSON.stringify(capturedJson)}`;
      if (line.length > 80) line = line.slice(0, 79) + "…";
      log(line);
    }
  });

  next();
});

// ✅ Redirect URLs
const clientURL =
  process.env.NODE_ENV === "production"
    ? "https://dev-board-psi.vercel.app/"
    : "";

// 🔐 Google OAuth
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `https://dev-board-psi.vercel.app/login`,
  }),
  async (req: any, res) => {
    const email = req.user.emails?.[0]?.value;
    const avatar = req.user.photos?.[0]?.value;

    await db
      .insert(users)
      .values({
        id: req.user.id,
        provider: "google",
        name: req.user.displayName,
        email,
        avatar,
      })
      .onConflictDoNothing();

    res.redirect(`https://dev-board-psi.vercel.app/overview`);
  }
);

// 🔐 GitHub OAuth
app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: `https://dev-board-psi.vercel.app/login`,
  }),
  async (req: any, res) => {
    const email = req.user.emails?.[0]?.value;
    const avatar = req.user.photos?.[0]?.value;

    await db
      .insert(users)
      .values({
        id: req.user.id,
        provider: "github",
        name: req.user.displayName,
        email,
        avatar,
      })
      .onConflictDoNothing();

    res.redirect(`https://dev-board-psi.vercel.app/overview`);
  }
);

// 🧍 Authenticated User Info
app.get("/api/auth/user", async (req: any, res) => {
  if (!req.isAuthenticated())
    return res.status(401).json({ message: "Unauthorized" });

  const user = req.user;
  const email = user.emails?.[0]?.value || user.email;
  const avatar = user.photos?.[0]?.value;
  const name = user.displayName || user.name || "User";

  if (!email) return res.status(400).json({ message: "No email found" });

  await db
    .insert(users)
    .values({
      id: user.id,
      provider: user.provider || "unknown",
      name,
      email,
      avatar,
    })
    .onConflictDoNothing();

  return res.json({ id: user.id, name, email, avatar });
});

// 🚪 Logout
app.get("/api/logout", (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.redirect(`${clientURL}/login`);
  });
});

// 🧨 Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  console.error("💥 Express Error:", err.message);
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

// 🚀 Launch server
(async () => {
  await registerRoutes(app);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen(port, () => {
    log(`✅ Server running on http://localhost:${port}`);
  });
})();
