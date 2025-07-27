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
import infraCostsRoute from './routes/api/infra-costs';
import RegisterRoutes from './routes/api/register';

const app = express();
app.set("trust proxy", 1);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS setup
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// Session config
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set in your .env file");
}
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// ⬇ Register route for form signup (before authenticateUser)
app.use('/auth', RegisterRoutes);

// ✅ Auth middleware
app.use(authenticateUser);

// ✅ Core API routes
app.use("/api/github", githubRoutes);
console.log("✅ Mounted /api/github routes");

app.use("/api/slack", slackRoutes);
console.log("✅ Mounted /api/slack routes");

app.use("/api/dockerhub", dockerhub);
console.log("✅ Mounted /api/dockerhub routes");

app.use("/api/gcp", gcpRoutes);
console.log("✅ Mounted /api/gcp routes");

app.use("/api/helm", helmRoutes);
console.log("✅ Mounted /api/helm routes");

app.use("/api/kubernetes", kubernetes);
console.log("✅ Mounted /api/kubernetes routes");

app.use("/api/aws", aws);
console.log("✅ Mounted /api/aws routes");

app.use('/api/infra-costs', infraCostsRoute);
console.log("✅ Mounted /api/infra-costs routes");

// 🧠 API Logger
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

// 🔐 Google OAuth
app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

app.get("/auth/google/callback", passport.authenticate("google", {
  failureRedirect: "http://localhost:5173/login"
}), async (req: any, res) => {
  const email = req.user.emails?.[0]?.value;
  const avatar = req.user.photos?.[0]?.value;

  await db.insert(users).values({
    id: req.user.id,
    provider: "google",
    name: req.user.displayName,
    email,
    avatar
  }).onConflictDoNothing();

  console.log("✅ Google login successful:", email);
  res.redirect("http://localhost:5173/overview");
});

// 🔐 GitHub OAuth
app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get("/auth/github/callback", passport.authenticate("github", {
  failureRedirect: "http://localhost:5173/login"
}), async (req: any, res) => {
  const email = req.user.emails?.[0]?.value;
  const avatar = req.user.photos?.[0]?.value;

  await db.insert(users).values({
    id: req.user.id,
    provider: "github",
    name: req.user.displayName,
    email,
    avatar
  }).onConflictDoNothing();

  console.log("✅ GitHub login successful:", email);
  res.redirect("http://localhost:5173/overview");
});

// 🧍 Authenticated User Info
app.get("/api/auth/user", async (req: any, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });

  const user = req.user;
  const email = user.emails?.[0]?.value || user.email;
  const avatar = user.photos?.[0]?.value;
  const name = user.displayName || user.name || "User";

  if (!email) return res.status(400).json({ message: "No email found" });

  await db.insert(users).values({
    id: user.id,
    provider: user.provider || "unknown",
    name,
    email,
    avatar,
  }).onConflictDoNothing();

  return res.json({ id: user.id, name, email, avatar });
});

// 🚪 Logout
app.get("/api/logout", (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.redirect("/login");
  });
});

// 🧨 Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  console.error("💥 Express Error:", err.message);
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

// 🚀 Final Mount + Dev/Prod switch
(async () => {
  await registerRoutes(app); // /api/tokens etc.

  if (app.get("env") === "development") {
    await setupVite(app);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen(port, () => {
    log(`✅ Server running on http://localhost:${port}`);
  });
})();
