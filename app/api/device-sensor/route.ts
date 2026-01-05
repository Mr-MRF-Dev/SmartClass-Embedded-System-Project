import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Expect JSON format: { "values": [deviceId, temp, humidity, light, presence, current_consumption] }
    if (
      !body.values ||
      !Array.isArray(body.values) ||
      body.values.length !== 6
    ) {
      return NextResponse.json(
        {
          error:
            'Expected JSON format: { "values": [deviceId, temp, humidity, light, presence, current_consumption] }',
        },
        { status: 400 },
      );
    }

    const [deviceId, temp, humidity, light, presence, currentConsumption] =
      body.values;

    // Validate deviceId
    if (!deviceId || typeof deviceId !== "string") {
      return NextResponse.json(
        { error: "First element must be a valid deviceId string" },
        { status: 400 },
      );
    }

    // Find the embedded system by deviceId
    const system = await prisma.embeddedSystem.findUnique({
      where: { deviceId },
    });

    if (!system) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const timestamp = new Date();

    // Check if all sensor values are 0 (critical situation)
    const isCritical =
      (temp === 0 || temp === null) &&
      (humidity === 0 || humidity === null) &&
      (light === 0 || light === null) &&
      (presence === 0 || presence === null) &&
      (currentConsumption === 0 || currentConsumption === null);

    // Track alarm state changes
    const wasAlarmActive = system.alarmActive || false;

    // If alarm just triggered, create alarm history record
    if (isCritical && !wasAlarmActive) {
      await prisma.alarmHistory.create({
        data: {
          embeddedSystemId: system.id,
          triggeredAt: timestamp,
        },
      });
    }

    // If alarm just resolved, update the latest unresolved alarm history
    if (!isCritical && wasAlarmActive) {
      const latestUnresolvedAlarm = await prisma.alarmHistory.findFirst({
        where: {
          embeddedSystemId: system.id,
          resolvedAt: null,
        },
        orderBy: {
          triggeredAt: "desc",
        },
      });

      if (latestUnresolvedAlarm) {
        await prisma.alarmHistory.update({
          where: { id: latestUnresolvedAlarm.id },
          data: { resolvedAt: timestamp },
        });
      }
    }

    // Update last seen timestamp and alarm status
    await prisma.embeddedSystem.update({
      where: { id: system.id },
      data: {
        lastSeen: timestamp,
        alarmActive: isCritical,
        alarmTriggeredAt: isCritical
          ? timestamp
          : (system.alarmTriggeredAt ?? null),
      },
    });

    // Store all sensor readings
    await prisma.deviceReading.create({
      data: {
        embeddedSystemId: system.id,
        temperature: temp !== null && temp !== undefined ? temp : null,
        humidity: humidity !== null && humidity !== undefined ? humidity : null,
        light: light !== null && light !== undefined ? light : null,
        presence: presence !== null && presence !== undefined ? presence : null,
        currentConsumption:
          currentConsumption !== null && currentConsumption !== undefined
            ? currentConsumption
            : null,
        timestamp,
      },
    });

    // Store power consumption data
    if (currentConsumption !== null && currentConsumption !== undefined) {
      await prisma.powerUsage.create({
        data: {
          embeddedSystemId: system.id,
          current: currentConsumption,
          power: currentConsumption * 220, // Assuming 220V, calculate power
          timestamp,
        },
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error processing device sensor data:", error);
    return NextResponse.json(
      {
        error: "Failed to process device sensor data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
