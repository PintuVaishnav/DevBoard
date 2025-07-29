# DevBoard - Developer Operations Dashboard

## Overview

DevBoard is a comprehensive Developer Operations Dashboard built with a modern full-stack architecture. It provides developers and DevOps engineers with a unified interface to manage and monitor CI/CD pipelines, application health, infrastructure costs, feature flags, and more.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with React plugin
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with Zod schema validation
- **Authentication**: GoogleAuth And GithubAuth
- **Session Management**: Express sessions with PostgreSQL store

### Project Structure
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript schemas and types
- `migrations/` - Database migration files

## Key Components

### Authentication System
- **Provider**: Google And Github
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Role-Based Access**: Admin, Developer, and Viewer roles
- **Middleware**: Authentication middleware for protected routes

### Database Schema
- **Users**: Profile information, access roles, and session activity tracking.
- **Pipelines**: CI/CD pipeline statuses, build metadata, and failure/success insights.
- **Helm**: Monitor Helm charts, releases, and service deployments in connected clusters.
- **Health Metrics**: View real-time application performance and system health indicators.
- **Infrastructure Costs**: Track and visualize infrastructure spending (GCP for now, AWS soon).
- **API Tokens**: Manage secure integration tokens for external APIs and services.
- **Kubernetes**: Monitor cluster resources, pods, namespaces, and deployment health.
- **GitHub Repos**: View and manage all repositories connected to your GitHub account.
- **Docker Hub**: Display all linked Docker images, tags, and pull stats from your Docker Hub.


### API Design
- **RESTful endpoints** for all resources
- **Zod validation** for request/response schemas
- **Error handling** with proper HTTP status codes
- **Query optimization** with Drizzle ORM

### Frontend Components
- **Dashboard Layout**: Responsive sidebar navigation
- **Data Visualization**: Charts using Recharts library
- **Real-time Updates**: TanStack Query for data fetching
- **Theme Support**: Dark/light mode toggle
- **Mobile Responsive**: Tailwind CSS responsive design

## Data Flow

### Authentication Flow
1. User initiates login via Google Auth And Github Auth
2. OpenID Connect authentication with Google or Github
3. Session creation with PostgreSQL storage
4. JWT token validation on protected routes

### Data Fetching Pattern
1. React components use TanStack Query hooks
2. Query functions make HTTP requests to Express API
3. Express routes validate requests with Zod schemas
4. Drizzle ORM queries PostgreSQL database
5. Results cached and synchronized across components

### Real-time Updates
- TanStack Query provides automatic background refetching
- Optimistic updates for better user experience
- Error boundaries for graceful error handling

## External Dependencies

### Core Technologies
- **React**: Frontend framework
- **Express**: Backend server
- **PostgreSQL**: Primary database
- **Drizzle ORM**: Database toolkit
- **Tailwind CSS**: Styling framework
- **Vite**: Build tool and development server

### Third-party Integrations
- **Google Auth**: Authentication provider
- **Neon**: Serverless PostgreSQL hosting
- **Radix UI**: Headless UI components
- **TanStack Query**: Server state management
- **Recharts**: Data visualization library

### Development Tools
- **TypeScript**: Type safety across the stack
- **Zod**: Runtime type validation
- **ESLint**: Code linting
- **PostCSS**: CSS processing with Tailwind

## Deployment Strategy

### Development Environment
- **VS Code**: Primary development platform
- **Vite Dev Server**: Hot module replacement for frontend
- **tsx**: TypeScript execution for backend
- **Database**: Neon serverless PostgreSQL

### Production Build
- **Frontend**: Vite build with static asset optimization
- **Backend**: esbuild bundling for Node.js deployment
- **Database**: Drizzle migrations for schema management
- **Assets**: Served from dist/public directory

### Environment Configuration

DATABASE_URL=postgresql://<username>:<password>@<host>/<dbname>?sslmode=require&channel_binding=require

REPLIT_DOMAINS=localhost:5000

GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>

SESSION_SECRET=<your_session_secret>

NEXTAUTH_URL=http://localhost:3000

GITHUB_CLIENT_ID=<your_github_client_id>
GITHUB_CLIENT_SECRET=<your_github_client_secret>

DOCKER_USERNAME=<your_dockerhub_username>
DOCKER_TOKEN=<your_dockerhub_access_token>


The application is designed to be scalable and maintainable, with clear separation of concerns between frontend and backend, comprehensive type safety, and modern development practices throughout the stack.
