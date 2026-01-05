// Script to seed fake data for SmartClass project using Prisma
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function seedData() {
  console.log("🌱 Starting database seeding...\n");

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log("🧹 Clearing existing data...");
    await prisma.command.deleteMany();
    await prisma.deviceReading.deleteMany();
    await prisma.powerUsage.deleteMany();
    await prisma.heatingSchedule.deleteMany();
    await prisma.embeddedSystem.deleteMany();
    await prisma.user.deleteMany();
    console.log("✓ Database cleared\n");

    // Create user testing data
    console.log("👤 Creating user...");
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error("ADMIN_PASSWORD not set");
    }
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      throw new Error("ADMIN_EMAIL not set");
    }

    const user = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin User",
        role: "admin",
      },
    });
    console.log(`✓ Created user: ${user.email}\n`);

    // Create embedded systems
    console.log("📦 Creating embedded systems...");

    const system1 = await prisma.embeddedSystem.create({
      data: {
        name: "Classroom A - Main Controller",
        location: "Building A, Floor 2",
        classroom: "Room 201",
        description: "Main environmental control system for Classroom A",
        status: "active",
        ipAddress: "192.168.1.101",
        macAddress: "AA:BB:CC:DD:EE:01",
        deviceId: "device-A-001",
      },
    });
    console.log(`✓ Created: ${system1.name}`);

    const system2 = await prisma.embeddedSystem.create({
      data: {
        name: "Classroom B - Main Controller",
        location: "Building A, Floor 2",
        classroom: "Room 202",
        description: "Main environmental control system for Classroom B",
        status: "active",
        ipAddress: "192.168.1.102",
        macAddress: "AA:BB:CC:DD:EE:02",
        deviceId: "device-B-002",
      },
    });
    console.log(`✓ Created: ${system2.name}`);

    const system3 = await prisma.embeddedSystem.create({
      data: {
        name: "Lab - Environmental Monitor",
        location: "Building B, Floor 1",
        classroom: "Computer Lab 1",
        description: "Environmental monitoring for computer lab",
        status: "active",
        ipAddress: "192.168.1.103",
        macAddress: "AA:BB:CC:DD:EE:03",
        deviceId: "device-LAB-003",
      },
    });
    console.log(`✓ Created: ${system3.name}\n`);

    // Seed power usage data
    console.log("📊 Seeding power usage data...");

    await prisma.powerUsage.create({
      data: {
        embeddedSystemId: system1.id,
        voltage: 220.5,
        current: 2.3,
        power: 507.15,
        energy: 12.5,
      },
    });
    console.log("✓ Power data created for Classroom A");

    await prisma.powerUsage.create({
      data: {
        embeddedSystemId: system2.id,
        voltage: 220.2,
        current: 1.8,
        power: 396.36,
        energy: 9.8,
      },
    });
    console.log("✓ Power data created for Classroom B");

    await prisma.powerUsage.create({
      data: {
        embeddedSystemId: system3.id,
        voltage: 220.8,
        current: 14.7,
        power: 3245.76,
        energy: 78.5,
      },
    });
    console.log("✓ Power data created for Lab\n");

    // Seed device readings
    console.log("📈 Seeding device readings...");

    await prisma.deviceReading.create({
      data: {
        embeddedSystemId: system1.id,
        temperature: 22.5,
        humidity: 45.0,
        light: 500.0,
        presence: 1.0,
        currentConsumption: 2.3,
      },
    });
    console.log("✓ Device readings created for Classroom A");

    await prisma.deviceReading.create({
      data: {
        embeddedSystemId: system2.id,
        temperature: 23.1,
        humidity: 48.5,
        light: 520.0,
        presence: 1.0,
        currentConsumption: 1.8,
      },
    });
    console.log("✓ Device readings created for Classroom B");

    await prisma.deviceReading.create({
      data: {
        embeddedSystemId: system3.id,
        temperature: 20.8,
        humidity: 40.2,
        light: 300.0,
        presence: 0.8,
        currentConsumption: 14.7,
      },
    });
    console.log("✓ Device readings created for Lab\n");

    // Seed heating schedules
    console.log("🌡️ Seeding heating schedules...");

    await prisma.heatingSchedule.create({
      data: {
        embeddedSystemId: system1.id,
        season: "winter",
        month: 10,
        startTime: "06:00",
        endTime: "22:00",
        targetTemperature: 22.0,
        enabled: true,
      },
    });

    await prisma.heatingSchedule.create({
      data: {
        embeddedSystemId: system1.id,
        season: "summer",
        month: 4,
        startTime: "08:00",
        endTime: "20:00",
        targetTemperature: 24.0,
        enabled: true,
      },
    });
    console.log("✓ Heating schedules created for Classroom A");

    await prisma.heatingSchedule.create({
      data: {
        embeddedSystemId: system2.id,
        season: "winter",
        month: 11,
        startTime: "06:00",
        endTime: "22:00",
        targetTemperature: 21.5,
        enabled: true,
      },
    });

    await prisma.heatingSchedule.create({
      data: {
        embeddedSystemId: system2.id,
        season: "summer",
        month: 5,
        startTime: "08:00",
        endTime: "20:00",
        targetTemperature: 23.5,
        enabled: true,
      },
    });
    console.log("✓ Heating schedules created for Classroom B");

    await prisma.heatingSchedule.create({
      data: {
        embeddedSystemId: system3.id,
        season: "winter",
        month: 12,
        startTime: "07:00",
        endTime: "18:00",
        targetTemperature: 20.0,
        enabled: true,
      },
    });

    await prisma.heatingSchedule.create({
      data: {
        embeddedSystemId: system3.id,
        season: "spring",
        month: 1,
        startTime: "07:00",
        endTime: "18:00",
        targetTemperature: 21.0,
        enabled: true,
      },
    });
    console.log("✓ Heating schedules created for Lab\n");

    // Seed commands
    console.log("⚙️ Seeding commands...");

    await prisma.command.create({
      data: {
        embeddedSystemId: system1.id,
        type: "temperature_set",
        payload: { targetTemp: 22.0 },
        status: "completed",
        executedAt: new Date(),
        response: { success: true, message: "Temperature set successfully" },
      },
    });

    await prisma.command.create({
      data: {
        embeddedSystemId: system1.id,
        type: "fan_control",
        payload: { speed: "medium" },
        status: "pending",
      },
    });
    console.log("✓ Commands created for Classroom A");

    await prisma.command.create({
      data: {
        embeddedSystemId: system2.id,
        type: "light_control",
        payload: { brightness: 80 },
        status: "completed",
        executedAt: new Date(),
        response: { success: true, message: "Brightness adjusted" },
      },
    });
    console.log("✓ Commands created for Classroom B");

    await prisma.command.create({
      data: {
        embeddedSystemId: system3.id,
        type: "shutdown",
        payload: { reason: "maintenance" },
        status: "pending",
      },
    });
    console.log("✓ Commands created for Lab\n");

    console.log("✅ Database seeding completed successfully!");
    console.log("📊 Summary:");
    console.log("  • 1 User");
    console.log("  • 3 Embedded Systems");
    console.log("  • 3 Power Usage Records");
    console.log("  • 3 Device Readings");
    console.log("  • 6 Heating Schedules");
    console.log("  • 4 Commands");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed script
seedData();
