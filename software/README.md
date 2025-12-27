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

2. **Configure database:**
   Edit `.env` and set your PostgreSQL connection:

   ```text
   DATABASE_URL="postgresql://user:password@localhost:5432/smartclass_db"
   ```

3. **Setup database:**

   ```bash
   bun run db:push
   bun run db:generate
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
