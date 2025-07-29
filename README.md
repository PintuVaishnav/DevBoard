# DevBoard — Your Developer Dashboard for Productivity, Projects & Progress 🧠📊

A personal DevOps dashboard designed to simplify, centralize, and streamline your entire development workflow. **DevBoard** gives you real-time visibility into Docker, Kubernetes, Helm,CI/CD Pipelines, GCP infrastructure usage, Costs and More — all from a single unified platform.

![Preview Image](https://raw.githubusercontent.com/PintuVaishanv/post-images/refs/heads/main/5c58188f-c380-42e4-ac1a-29a2dd3d741a.png)


## 🎯 Goal of this project

The mission behind **DevBoard** is to build a minimal yet powerful workspace for developers and DevOps engineers. Here’s what this project aims to achieve:

1. **Boost Developer Productivity & Focus**  
   DevBoard is designed to reduce tab chaos and context switching. Whether you're managing a tech stack, tracking deployments, or planning your next feature — everything lives here.

2. **Centralize Project & DevOps Monitoring**  
   From Docker containers and K8s pods to Helm services and CI/CD pipelines, DevBoard acts as your personal command center. It also integrates with GCP and will soon support AWS.

3. **Visualize Your Infra & Cost**  
   Track cloud usage and GCP infrastructure costs in real time. Understand what's running, where, and how much it costs — saving hours of manual digging.

---

## 🔧 Why DevBoard? Real-World DevOps Problem — Solved.

In real-time production environments, DevOps engineers often juggle multiple tools like:

- 🐳 Docker  
- ☸️ Kubernetes  
- ⎈ Helm
- 🔄CI/CD Pipelines  
- 💻 Services & Deployments  
- ☁️ GCP Infra Monitoring  
- 💸 Billing Dashboards  

Switching between different tabs and tools becomes overwhelming.

### ✨ **DevBoard changes that.**

It’s a unified platform where:

- ✅ **All DevOps tools** (Docker, K8s, Helm, Services, Deployments,Pipelines) can be monitored from one place.  
- ✅ **GCP infrastructure** usage and cost data is visualized.  
- ✅ Future support for **AWS billing and infra** is coming soon.  
- ✅ It **saves time** and increases productivity for DevOps engineers.  
- ✅ Acts as a **real-time control center** for your workflow.  

> 💡 Whether you're checking pod status, infra cost, or deployment state — DevBoard keeps you focused on what matters.

---

## Setting up the project locally

### 🔐 Google OAuth Setup (Required)
To use Google Login:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new OAuth 2.0 credentials.
3. Set the redirect URI to `http://localhost:3000/auth/google`
`http://localhost:5000/auth/google`

### 🐙 GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name:** DevBoard (or any name you prefer)
   - **Homepage URL:** `http://localhost:5000`
   - **Authorization callback URL:**
     ```
     http://localhost:5000/auth/github
     ```
4. Click **Register Application**
5. Copy the **Client ID** and **Client Secret**


### Setting up the Backend

1. **Fork and Clone the Repository**

   ```bash
   git clone https://github.com/PintuVaishnav/DevBoard.git
   ```

2. **Navigate to the Backend Directory**

   ```bash
   cd server
   ```

3. **Install Required Dependencies**

   ```bash
   npm i
   ```

4. **Set up your Neon Database**

   - Create a free database on [https://neon.tech](https://neon.tech)
   - Copy your connection string (e.g., `postgresql://user:password@host/dbname`)
   - Update the `.env` file with your Neon DB connection string:
     ```env
     DATABASE_URL=your_neon_connection_string_here
     ```
   - Make sure your backend is configured to use PostgreSQL.
<br>

5. **Configure Environment Variables**

   - A `.env(demo)` file is provided in the root folder.
   - Copy it and rename it to `.env`, then fill in your own credentials.
   <br>

   ```bash
   cp .env\(demo\) .env
   ```

6. **Start the Backend Server**

   ```bash
   npm run dev
   ```

 > You should see the following on your terminal output on successful setup.
   >
   > ```bash
   > [Express] Server is running on port 5000 
  >```

### Setting up the Frontend



2. **Install Dependencies from root folder**

   ```bash
   npm i
   ```

3. **Configure Environment Variables**

   - A `.env(demo)` file is provided in the root folder.
   - Copy it and rename it to `.env`, then fill in your own credentials.
   <br>

   ```bash
   cp .env\(demo\) .env
   ```

4. **Launch the Development Server**

   ```bash
   npx vite --config vite.config.ts
   ```
> You should see the following on your terminal output on successful setup.
   >
   > ```bash
   >VITE v5.4.19  ready in 356 ms
   > [Local]: http://localhost:5173/ 
  >```

  ## 🌟 Want to Collaborate or Improve DevBoard Together?

If you find DevBoard useful — whether it's the monitoring dashboard, deployment tracking, or cloud cost insights — I’d love to hear from you! This platform is meant to evolve through contributions, feedback, and ideas from fellow developers and DevOps engineers like you.

## 💖 Support & Stay Connected

If you believe in the vision behind DevBoard, you can support the journey by:

- ⭐ Starring the GitHub repo  
- 💬 Sharing your feedback, ideas, or suggestions via issues or discussions  
- 🤝 Reaching out for collaborations, feature requests, or integration ideas  

Your feedback and support help shape DevBoard into a powerful, open-source DevOps tool for everyone.

> 🚀 **Let’s build, automate, and scale together in the ever-evolving world of DevOps!**
