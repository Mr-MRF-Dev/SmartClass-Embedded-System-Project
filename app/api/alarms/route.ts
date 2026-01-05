import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all active alarms
    const activeAlarms = await prisma.alarm.findMany({
      where: {
        resolvedAt: null,
      },
      include: {
        embeddedSystem: {
          select: {
            id: true,
            name: true,
            deviceId: true,
            location: true,
          },
        },
      },
      orderBy: {
        triggeredAt: "desc",
      },
    });

    const systemsWithAlarms = activeAlarms.map((alarm) => ({
      id: alarm.embeddedSystem.id,
      name: alarm.embeddedSystem.name,
      deviceId: alarm.embeddedSystem.deviceId,
      location: alarm.embeddedSystem.location,
      alarmTriggeredAt: alarm.triggeredAt.toISOString(),
    }));

    return NextResponse.json({
      hasAlarms: systemsWithAlarms.length > 0,
      alarms: systemsWithAlarms,
      count: systemsWithAlarms.length,
    });
  } catch (error) {
    console.error("Error fetching alarms:", error);
    return NextResponse.json(
      { error: "Failed to fetch alarms" },
      { status: 500 },
    );
  }
}
