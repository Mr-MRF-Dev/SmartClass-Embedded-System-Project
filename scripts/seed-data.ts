// Script to seed fake data for SmartClass project
const API_BASE = "http://localhost:3000/api";

async function createSystem(data: any) {
  const response = await fetch(`${API_BASE}/systems`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function ingestData(data: any) {
  const response = await fetch(`${API_BASE}/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

async function seedData() {
  console.log("🌱 Starting data seeding...\n");

  // Create embedded systems
  console.log("📦 Creating embedded systems...");

  const system1 = await createSystem({
    name: "Classroom A - Main Controller",
    location: "Building A, Floor 2",
    classroom: "Room 201",
    description: "Main environmental control system for Classroom A",
    ipAddress: "192.168.1.101",
    macAddress: "AA:BB:CC:DD:EE:01",
    deviceId: "device-A-001",
  });
  console.log(`✓ Created: ${system1.name}`);

  const system2 = await createSystem({
    name: "Classroom B - Main Controller",
    location: "Building A, Floor 2",
    classroom: "Room 202",
    description: "Main environmental control system for Classroom B",
    ipAddress: "192.168.1.102",
    macAddress: "AA:BB:CC:DD:EE:02",
    deviceId: "device-B-002",
  });
  console.log(`✓ Created: ${system2.name}`);

  const system3 = await createSystem({
    name: "Lab - Environmental Monitor",
    location: "Building B, Floor 1",
    classroom: "Computer Lab 1",
    description: "Environmental monitoring for computer lab",
    ipAddress: "192.168.1.103",
    macAddress: "AA:BB:CC:DD:EE:03",
    deviceId: "device-LAB-003",
  });
  console.log(`✓ Created: ${system3.name}\n`);

  // Send sample power usage data
  console.log("📊 Sending sample power usage data...");

  await ingestData({
    deviceId: "device-A-001",
    powerUsage: {
      voltage: 220.5,
      current: 2.3,
      power: 507.15,
      energy: 12.5,
    },
  });
  console.log("✓ Power data ingested for Classroom A");

  await ingestData({
    deviceId: "device-B-002",
    powerUsage: {
      voltage: 220.2,
      current: 1.8,
      power: 396.36,
      energy: 9.8,
    },
  });
  console.log("✓ Power data ingested for Classroom B");

  await ingestData({
    deviceId: "device-LAB-003",
    powerUsage: {
      voltage: 220.8,
      current: 14.7,
      power: 3245.76,
      energy: 78.5,
    },
  });
  console.log("✓ Power data ingested for Lab\n");

  console.log("✅ Data seeding completed successfully!");
  console.log("🌐 Visit http://localhost:3000 to view the dashboard");
}

// Run the seed script
seedData().catch((error) => {
  console.error("❌ Error seeding data:", error);
  process.exit(1);
});
