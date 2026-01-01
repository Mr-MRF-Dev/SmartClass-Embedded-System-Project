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

async function createSensor(data: any) {
  const response = await fetch(`${API_BASE}/sensors`, {
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
  });
  console.log(`✓ Created: ${system1.name}`);

  const system2 = await createSystem({
    name: "Classroom B - Main Controller",
    location: "Building A, Floor 2",
    classroom: "Room 202",
    description: "Main environmental control system for Classroom B",
    ipAddress: "192.168.1.102",
    macAddress: "AA:BB:CC:DD:EE:02",
  });
  console.log(`✓ Created: ${system2.name}`);

  const system3 = await createSystem({
    name: "Lab - Environmental Monitor",
    location: "Building B, Floor 1",
    classroom: "Computer Lab 1",
    description: "Environmental monitoring for computer lab",
    ipAddress: "192.168.1.103",
    macAddress: "AA:BB:CC:DD:EE:03",
  });
  console.log(`✓ Created: ${system3.name}\n`);

  // Create sensors for system 1
  console.log("🌡️  Creating sensors...");

  await createSensor({
    name: "Room Temperature",
    type: "temperature",
    unit: "°C",
    embeddedSystemId: system1.id,
    minValue: 15,
    maxValue: 30,
    threshold: 28,
  });
  console.log(`✓ Temperature sensor for ${system1.name}`);

  await createSensor({
    name: "Room Humidity",
    type: "humidity",
    unit: "%",
    embeddedSystemId: system1.id,
    minValue: 30,
    maxValue: 70,
    threshold: 65,
  });
  console.log(`✓ Humidity sensor for ${system1.name}`);

  await createSensor({
    name: "Light Level",
    type: "light",
    unit: "lux",
    embeddedSystemId: system1.id,
    minValue: 0,
    maxValue: 1000,
    threshold: 800,
  });
  console.log(`✓ Light sensor for ${system1.name}`);

  // Create sensors for system 2
  await createSensor({
    name: "Room Temperature",
    type: "temperature",
    unit: "°C",
    embeddedSystemId: system2.id,
    minValue: 15,
    maxValue: 30,
    threshold: 28,
  });
  console.log(`✓ Temperature sensor for ${system2.name}`);

  await createSensor({
    name: "Room Humidity",
    type: "humidity",
    unit: "%",
    embeddedSystemId: system2.id,
    minValue: 30,
    maxValue: 70,
    threshold: 65,
  });
  console.log(`✓ Humidity sensor for ${system2.name}`);

  // Create sensors for system 3
  await createSensor({
    name: "Lab Temperature",
    type: "temperature",
    unit: "°C",
    embeddedSystemId: system3.id,
    minValue: 18,
    maxValue: 26,
    threshold: 25,
  });
  console.log(`✓ Temperature sensor for ${system3.name}`);

  await createSensor({
    name: "Lab Humidity",
    type: "humidity",
    unit: "%",
    embeddedSystemId: system3.id,
    minValue: 35,
    maxValue: 55,
    threshold: 50,
  });
  console.log(`✓ Humidity sensor for ${system3.name}`);

  await createSensor({
    name: "Power Monitor",
    type: "power",
    unit: "W",
    embeddedSystemId: system3.id,
    minValue: 0,
    maxValue: 5000,
    threshold: 4500,
  });
  console.log(`✓ Power sensor for ${system3.name}\n`);

  // Send sample sensor data
  console.log("📊 Sending sample sensor readings...");

  await ingestData({
    macAddress: "AA:BB:CC:DD:EE:01",
    sensors: [
      { id: "hum-1", value: 45.3 },
      { id: "light-1", value: 650 },
    ],
    power: {
      voltage: 220.5,
      current: 2.3,
      power: 507.15,
      energy: 12.5,
    },
  });
  console.log("✓ Data ingested for Classroom A");

  await ingestData({
    macAddress: "AA:BB:CC:DD:EE:02",
    sensors: [
      { id: "temp-2", value: 23.1 },
      { id: "hum-2", value: 48.7 },
    ],
    power: {
      voltage: 220.2,
      current: 1.8,
      power: 396.36,
      energy: 9.8,
    },
  });
  console.log("✓ Data ingested for Classroom B");

  await ingestData({
    macAddress: "AA:BB:CC:DD:EE:03",
    sensors: [
      { id: "temp-3", value: 21.8 },
      { id: "hum-3", value: 42.5 },
      { id: "power-3", value: 3250 },
    ],
    power: {
      voltage: 220.8,
      current: 14.7,
      power: 3245.76,
      energy: 78.5,
    },
  });
  console.log("✓ Data ingested for Lab\n");

  console.log("✅ Data seeding completed successfully!");
  console.log("🌐 Visit http://localhost:3000 to view the dashboard");
}

// Run the seed script
seedData().catch((error) => {
  console.error("❌ Error seeding data:", error);
  process.exit(1);
});
