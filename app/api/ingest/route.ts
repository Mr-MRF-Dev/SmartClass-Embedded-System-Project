import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { macAddress, sensors, powerUsage } = body;

    if (!macAddress) {
      return NextResponse.json(
        { error: 'macAddress is required' },
        { status: 400 }
      );
    }

    const system = await prisma.embeddedSystem.findUnique({
      where: { macAddress },
      include: { sensors: true }
    });

    if (!system) {
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      );
    }

    await prisma.embeddedSystem.update({
      where: { id: system.id },
      data: { lastSeen: new Date() }
    });

    if (sensors && Array.isArray(sensors)) {
      for (const sensorData of sensors) {
        const { id, value } = sensorData;
        
        const sensor = system.sensors.find(s => s.id === id);
        if (sensor) {
          await prisma.sensor.update({
            where: { id: sensor.id },
            data: { currentValue: value }
          });

          await prisma.sensorReading.create({
            data: {
              sensorId: sensor.id,
              value
            }
          });
        }
      }
    }

    if (powerUsage) {
      await prisma.powerUsage.create({
        data: {
          embeddedSystemId: system.id,
          voltage: powerUsage.voltage,
          current: powerUsage.current,
          power: powerUsage.power,
          energy: powerUsage.energy
        }
      });
    }

    return NextResponse.json({ success: true, systemId: system.id });
  } catch (error) {
    console.error('Error ingesting data:', error);
    return NextResponse.json(
      { error: 'Failed to ingest data' },
      { status: 500 }
    );
  }
}
