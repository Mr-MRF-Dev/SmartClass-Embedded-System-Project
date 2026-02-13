# 🌡️ SmartClass Embedded System Project

![GitHub repo size](https://img.shields.io/github/repo-size/mr-mrf-dev/SmartClass-Embedded-System-Project)
[![GitHub package.json nextjs version](https://img.shields.io/github/package-json/dependency-version/mr-mrf-dev/SmartClass-Embedded-System-Project/next)](https://nextjs.org/)
[![GitHub package.json react version](https://img.shields.io/github/package-json/dependency-version/mr-mrf-dev/SmartClass-Embedded-System-Project/dev/react)](https://reactjs.org/)
[![GitHub License](https://img.shields.io/github/license/mr-mrf-dev/SmartClass-Embedded-System-Project)](/LICENSE)

![home page](images/homepage.png)

A web-app dashboard for monitoring and managing classroom embedded systems with real-time sensor data, power usage tracking, and remote control capabilities.

This software is the full-stack web application for the SmartClass Embedded System Project. It is built using Next.js, Prisma, TypeScript, and modern UI components. The app provides a user interface for interacting with the SmartClass system, which may include features such as class management, device control, and real-time data visualization.

> **⚠️ Warning:** This project is designed for development and educational purposes only. It is **NOT recommended for production use** without proper security hardening, authentication improvements, and deployment configurations.

## ✨ Features

### Dashboard

- Real-time monitoring of embedded systems
- Sensor data visualization
- Power usage tracking
- System status indicators

### Embedded Systems

- Register and manage classroom devices
- Track location and classroom assignment
- Monitor connection status (last seen)
- MAC address and IP tracking

### AI Schedule Assistant

- **Intelligent Schedule Planning**: Use AI to automatically generate optimized temperature and lighting schedules
- **Powered by Ollama**: Runs locally using Ollama LLM (no cloud dependency)
- **Flexible Planning**: Create schedules for a month, season, or entire year
- **Energy Optimization**: AI considers energy efficiency and student comfort
- **Customizable**: Add your specific preferences and requirements
- **Persian Calendar Support**: Full support for Persian months and seasons

## 🛠️ Tech Stack

- **Next.js 16** - React framework
- **Prisma 7** - ORM with PostgreSQL
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Tabler Icons** - Icon library
- **TypeScript** - Type safety
- **Bun** - Fast package manager & runtime

## 📁 Project Structure

- `app/` - Main application pages, layouts, and global styles
- `components/` - Reusable React components
- `components/ui/` - UI primitives (buttons, cards, dialogs, etc.)
- `lib/` - Utility functions
- `public/` - Static assets
- `*.config.*` - Configuration files

## 📥 Getting Started

### 🐳 Quick Start with Docker

The easiest way to get started is using Docker Compose, which sets up everything you need:

```bash
# Optional: Copy .env.local.example to .env to customize settings
cp .env.local.example .env.local

# Start all services
docker compose up -d
```

**Customizable settings in `.env.local` file:**

- `ADMIN_EMAIL` - Default admin email (default: <admin@smartclass.com>)
- `ADMIN_PASSWORD` - Default admin password (default: secure@Password123)
- `OLLAMA_MODEL` - AI model to use (default: llama3.2)

This will automatically:

- Start PostgreSQL database
- Start pgAdmin (database management UI)
- Start Ollama (AI assistant)
- Start the Next.js application
- Set up the database schema

**Access your services:**

- **Web Application**: <http://localhost:3000>
- **pgAdmin**: <http://localhost:5050> (<admin@smartclass.com> / admin)
- **Ollama API**: <http://localhost:11434>

### 🛠️ Manual Setup (Without Docker)

If you prefer not to use Docker, follow these steps to set up the project manually:

#### Prerequisites

- [Bun](https://bun.sh/) installed on your system
- [PostgreSQL 14+](https://www.postgresql.org/download/) database server running
- [Ollama](https://ollama.ai) (optional, for AI features)

#### Installation Steps

1. **Configure Environment Variables:**

   Copy the example environment file and customize it:

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and set the following required variables:

   ```text
   # Database connection string
   DATABASE_URL="postgresql://username:password@localhost:5432/smartclassdb?schema=public"

   # Admin credentials (for first login)
   ADMIN_EMAIL="admin@smartclass.com"
   ADMIN_PASSWORD="secure@Password123"

   # AI Assistant Configuration (optional)
   OLLAMA_HOST="http://localhost:11434"
   OLLAMA_MODEL="llama3.2"
   ```

2. **Install Dependencies:**

   ```bash
   bun install
   ```

3. **Set Up the Database:**

   Initialize the database schema and seed data:

   ```bash
   # Push schema to database
   bun run db:push

   # Generate Prisma client
   bun run db:generate
   ```

   Or use the all-in-one reset command:

   ```bash
   bun run db:reset
   ```

4. **Start the Development Server:**

   ```bash
   bun dev
   ```

   The application will be available at <http://localhost:3000>

5. **Set Up AI Assistant (Optional):**

   If you want to use the AI Schedule Planning feature:
   - Install Ollama from [https://ollama.ai](https://ollama.ai)
   - Pull the AI model:

     ```bash
     ollama pull llama3.2
     ```

   - Verify Ollama is running by visiting <http://localhost:11434>

   > **Note:** AI features are optional. The application will work without them.

## 📜 Scripts

### NPM/Bun Scripts

- `bun run dev` - Development server
- `bun run build` - Production build
- `bun run start` - Production server
- `bun run db:push` - Push schema to database
- `bun run db:reset` - force reset database and push schema
- `bun run db:studio` - Open Prisma Studio
- `bun run db:generate` - Generate Prisma Client

### Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down

# Restart a service
docker compose restart nextjs
```

## 🤝 Contributing

We welcome any contributions you may have. If you're interested in helping out, please fork the repository and create an [Issue](https://github.com/Mr-MRF-Dev/SmartClass-Embedded-System-Project/issues) or [PR](https://github.com/Mr-MRF-Dev/SmartClass-Embedded-System-Project/pulls). We'll be happy to review your contributions.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](/LICENSE) file for details.
