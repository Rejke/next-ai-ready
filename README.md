# 🚀 Next.js AI-Ready Template

A modern Next.js template combining **Feature-Sliced Design (FSD)** architecture with **AI-assisted development** workflows. Built with the latest technologies and best practices for scalable, maintainable applications.

## ✨ Features

### 🏗️ Architecture & Design
- **[Feature-Sliced Design (FSD)](https://feature-sliced.design/)** - Scalable frontend architecture
- **BMAD Framework** - Business Methodology for Agile Development with AI agents
- **Type-safe** - Full TypeScript support with strict mode
- **Modern tooling** - Biome for fast linting and formatting

### 🎨 UI & Styling
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality React components
- **Tailwind CSS v4** - Latest version with CSS custom properties
- **Dark mode** - Built-in theme system with CSS variables
- **Animations** - tw-animate-css for smooth transitions

### 🤖 AI Development Support
- **AI Agent Configurations** - Pre-configured roles (PO, PM, Architect, Developer, QA, UX, BA, SM)
- **Workflow Templates** - Greenfield and brownfield project workflows
- **IDE Integration** - Claude Code and Cursor support

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/next-ai-ready.git
   cd next-ai-ready
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start PostgreSQL with Docker**
   ```bash
   bun run docker:up
   # or docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   bun run db:push
   # Optional: Seed database with test data
   bun run db:seed
   ```

6. **Start development server**
   ```bash
   bun run dev
   # or npm run dev
   ```

7. **Open [http://localhost:3000](http://localhost:3000)** to see your app

## 📁 Project Structure

```
src/
├── app/          # Application layer (providers, layouts)
├── entities/     # Business entities
├── features/     # User features
├── pages/        # Next.js pages (routing)
├── shared/       # Shared code (UI, utilities, types)
├── views/        # Page components
└── widgets/      # Complex UI components

.claude/          # Claude Code AI configurations
.cursor/          # Cursor IDE configurations
bmad/            # BMAD framework documentation
```

### FSD Architecture Layers

- **Shared** (`@/shared`) - Reusable utilities, UI components, types
- **Entities** (`@/entities`) - Business logic and domain models  
- **Features** (`@/features`) - User-facing features
- **Widgets** (`@/widgets`) - Composite components
- **Views** (`@/views`) - Page-level components
- **App** (`@/app`) - Global configuration

## 🛠️ Available Scripts

```bash
# Development
bun run dev          # Start development server with Turbopack
bun run build        # Create production build
bun run start        # Start production server

# Code Quality
bun run lint         # Run Biome linter
bun run format       # Format code with Biome

# Database
bun run db:generate  # Generate database migrations
bun run db:migrate   # Run database migrations
bun run db:push      # Push schema changes to database
bun run db:studio    # Open Drizzle Studio (database GUI)
bun run db:seed      # Seed database with test data

# Docker
bun run docker:up    # Start PostgreSQL container
bun run docker:down  # Stop PostgreSQL container
bun run docker:reset # Reset database (delete all data)
```

## 🎯 Key Technologies

- **[Next.js 15.4](https://nextjs.org/)** - React framework with Pages Router
- **[React 19.1](https://react.dev/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter
- **[shadcn/ui](https://ui.shadcn.com/)** - Component library
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI primitives
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database ORM
- **[Better Auth](https://www.better-auth.com/)** - Modern authentication library
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Docker](https://www.docker.com/)** - Containerization

## 🤖 AI Development Workflow

This template includes the BMAD framework for AI-assisted development:

### Available AI Agents
- **Product Owner** - Requirements and prioritization
- **Project Manager** - Planning and coordination
- **Architect** - Technical design decisions
- **Developer** - Implementation guidance
- **QA Engineer** - Testing strategies
- **UX Expert** - User experience design
- **Business Analyst** - Business logic and flows
- **Scrum Master** - Agile process management

### Workflow Types
- **Greenfield** - New project workflows
- **Brownfield** - Existing project enhancement
- **Fullstack** - Complete application development
- **UI-only** - Frontend-focused development
- **Service** - Backend service development

## 🔐 Authentication

The template includes Better Auth with the following features:

- **Email/Password authentication** - Built-in sign up and sign in
- **OAuth providers** - GitHub and Google (configurable)
- **Session management** - Secure session handling
- **Database integration** - Using Drizzle ORM with PostgreSQL

### Using Authentication Components

```tsx
import { SignInForm, SignUpForm } from "@/features/auth"
import { useAuth } from "@/app/providers/auth-provider"

// In your component
const { session, loading } = useAuth()

if (session) {
  // User is authenticated
}
```

## 🎨 UI Components

The template includes pre-configured shadcn/ui components:

```tsx
import { Button } from "@/shared/ui/button"

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

## 📝 Adding New Components

### FSD Component Structure

```bash
# For a new feature
src/features/your-feature/
├── ui/           # UI components
├── model/        # Business logic
├── lib/          # Utilities
└── index.ts      # Public API

# For a shared component
src/shared/ui/your-component/
├── your-component.tsx
├── your-component.test.tsx
└── index.ts
```

### Using shadcn/ui

```bash
# Add a new component
npx shadcn-ui@latest add dialog

# Components are added to src/shared/ui/
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/next_ai_ready
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=next_ai_ready

# Auth (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-secret-key-here-min-32-characters-long
BETTER_AUTH_URL=http://localhost:3000

# OAuth Providers (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Public
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 Deployment

The easiest way to deploy your Next.js app is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/next-ai-ready)

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.