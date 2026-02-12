# 🌡️ SmartClass Embedded System Project

![home page](images/homepage.png)

A web-app dashboard for monitoring and managing classroom embedded systems with real-time sensor data, power usage tracking, and remote control capabilities.

This software is the full-stack web application for the SmartClass Embedded System Project. It is built using Next.js, Prisma, TypeScript, and modern UI components. The app provides a user interface for interacting with the SmartClass system, which may include features such as class management, device control, and real-time data visualization.

## 🛠️ Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Prisma 7** - ORM with PostgreSQL
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Tabler Icons** - Icon library
- **Bun** - Fast package manager & runtime

## 📥 Getting Started

To set up the development environment for the SmartClass Embedded System Project, follow these steps:

1. **Start the Development Database (Postgres):**

   The project uses a local Postgres database for development, managed via Docker Compose. Make sure you have [Docker](https://www.docker.com/products/docker-desktop/) installed.

   ```bash
   docker compose up --build -d
   ```

   This will start a Postgres 18 database on port 5432 with default credentials (see `docker-compose.yml`).

   to stop docker compose use:

   ```bash
   docker compose down
   ```

2. **Configure Environment Variables:**

   Copy `.env.example` to `.env` file:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure the following:

   **Database Configuration:**

   ```text
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smartclassdb?schema=public"
   ```

   [AI Assistant Configuration (Optional):](#-setting-up-ai-assistant)

   ```text
   OLLAMA_HOST="http://localhost:11434"
   OLLAMA_MODEL="llama3.2"
   ```

   > **Note:** If you're using the Docker Compose setup, the default `DATABASE_URL` should work without changes.
   > ّ

3. **Install Dependencies:**

   ```bash
   bun install
   ```

4. **Setup database:**

   ```bash
   bun run db:push
   bun run db:generate
   ```

   or using all-in-one database reset command:

   ```bash
   bun run db:reset
   ```

5. **Run the Development Server:**

   ```bash
   bun dev
   ```

   The app will be available at `http://localhost:3000`.

6. **Build for Production:**

   ```bash
   bun run build
   bun start
   ```

## 🤖 Setting Up AI Assistant

To enable the AI Schedule Assistant feature, you need to install and configure Ollama:

1. **Install Ollama:**

   Download and install Ollama from [https://ollama.ai](https://ollama.ai)

2. **Pull the AI Model:**

   After installing Ollama, pull the required model:

   ```bash
   ollama pull llama3.2
   ```

3. **Configure Environment Variables:**

   Add the following to your `.env` file:

   ```text
   OLLAMA_HOST="http://localhost:11434"
   OLLAMA_MODEL="llama3.2"
   ```

4. **Verify Ollama is Running:**

   Make sure Ollama service is running. You can test it by visiting:

   ```url
   http://localhost:11434
   ```

> **Note:** The AI Assistant is optional. If not configured, the application will work without AI-powered schedule generation features.

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

### 🤖 AI Schedule Assistant

- **Intelligent Schedule Planning**: Use AI to automatically generate optimized temperature and lighting schedules
- **Powered by Ollama**: Runs locally using Ollama LLM (no cloud dependency)
- **Flexible Planning**: Create schedules for a month, season, or entire year
- **Energy Optimization**: AI considers energy efficiency and student comfort
- **Customizable**: Add your specific preferences and requirements
- **Persian Calendar Support**: Full support for Persian months and seasons

## 📜 Scripts

- `bun run dev` - Development server
- `bun run build` - Production build
- `bun run start` - Production server
- `bun run db:push` - Push schema to database
- `bun run db:reset` - force reset database and push schema
- `bun run db:studio` - Open Prisma Studio
- `bun run db:generate` - Generate Prisma Client

## 📁 Project Structure

- `app/` - Main application pages, layouts, and global styles
- `components/` - Reusable React components
- `components/ui/` - UI primitives (buttons, cards, dialogs, etc.)
- `lib/` - Utility functions
- `public/` - Static assets
- `*.config.*` - Configuration files

## 🤝 Contributing

We welcome any contributions you may have. If you're interested in helping out, fork the repository and create an [Issue](https://github.com/Mr-MRF-Dev/SmartClass-Embedded-System-Project/issues) or [PR](https://github.com/Mr-MRF-Dev/SmartClass-Embedded-System-Project/pulls).

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](/LICENSE) file for details.
