# SmartClass Embedded System Project

A Next.js dashboard for monitoring and managing classroom embedded systems with real-time sensor data, power usage tracking, and remote control capabilities.

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Prisma 7** - ORM with PostgreSQL
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Tabler Icons** - Icon library
- **Bun** - Fast package manager & runtime

## Quick Start

1. **Install dependencies:**

   ```bash
   bun install
   ```

   and create docker compose file (postgres and pgAdmin4):

   ```bash
   docker compose up --build -d
   ```

2. **Configure database:**

   copy `.env.example` to `.env` file.
   Edit `.env` and set your PostgreSQL connection (if you using the docker compose, don't change DATABASE_URL):

   ```text
   DATABASE_URL="postgresql://user:password@localhost:5432/smartclass_db"
   ```

3. **Setup database:**

   ```bash
   bun run db:push
   bun run db:generate
   ```

   or using all-in-one database reset command:

   ```bash
   bun run db:reset
   ```

4. **Start development server:**

   ```bash
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Features

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

### Sensors

- Multiple sensor types (temperature, humidity, light, power)
- Real-time readings with history
- Threshold monitoring
- Status tracking (online/offline/error)

### Data Ingestion API

- Embedded devices send data via REST API
- POST to `/api/ingest` with sensor readings
- Automatic timestamp and tracking

### Remote Commands

- Send commands to embedded systems
- GET `/api/commands?macAddress=XX:XX:XX:XX:XX:XX`
- POST `/api/commands` to create commands

## API Endpoints

### For Dashboard

- `GET /api/systems` - List all systems
- `POST /api/systems` - Create system
- `GET /api/sensors` - List all sensors
- `POST /api/sensors` - Create sensor

### For Embedded Devices

- `POST /api/ingest` - Send sensor data
- `GET /api/commands` - Retrieve pending commands

## Database Schema

- **EmbeddedSystem** - Classroom monitoring hardware
- **Sensor** - Temperature, humidity, etc.
- **SensorReading** - Historical sensor data
- **PowerUsage** - Power consumption tracking
- **Command** - Remote control commands

## Scripts

- `bun run dev` - Development server
- `bun run build` - Production build
- `bun run start` - Production server
- `bun run db:push` - Push schema to database
- `bun run db:studio` - Open Prisma Studio
- `bun run db:generate` - Generate Prisma Client

## Project Overview

This software is the frontend web application for the SmartClass Embedded System Project. It is built using Next.js (React), TypeScript, and modern UI components. The app provides a user interface for interacting with the SmartClass system, which may include features such as class management, device control, and real-time data visualization.

## How It Works

- **Frontend Framework:** The app uses Next.js for server-side rendering and routing, providing fast and SEO-friendly pages.
- **Component-Based:** UI is built with reusable React components located in the `components/` directory, including a set of UI primitives in `components/ui/`.
- **Styling:** Global styles are defined in `app/globals.css`. Component-level styles may be included within each component.
- **Configuration:** Project configuration files include `tsconfig.json` (TypeScript), `next.config.ts` (Next.js), and `eslint.config.mjs` (linting).
- **Utilities:** Common utility functions are in `lib/utils.ts`.
- **Public Assets:** Static files (images, icons, etc.) are in the `public/` directory.

## Getting Started

To set up the development environment for the SmartClass Embedded System Project, follow these steps:

1. **Start the Development Database (Postgres):**

   The project uses a local Postgres database for development, managed via Docker Compose. Make sure you have [Docker](https://www.docker.com/products/docker-desktop/) installed.

   ```bash
   docker compose up -d
   ```

   This will start a Postgres 18 database on port 5432 with default credentials (see `docker-compose.yml`).

2. **Install Dependencies:**

   ```bash
   bun i
   ```

3. **Run the Development Server:**

   ```bash
   bun dev
   ```

   The app will be available at `http://localhost:3000`.

4. **Build for Production:**

   ```bash
   bun run build
   bun start
   ```

## Project Structure

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
