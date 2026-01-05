import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all systems with active alarms
    const systemsWithAlarms = await prisma.embeddedSystem.findMany({
      where: {
        alarmActive: true,
      },
      select: {
        id: true,
        name: true,
        deviceId: true,
        location: true,
        alarmTriggeredAt: true,
      },
      orderBy: {
        alarmTriggeredAt: "desc",
      },
    });

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
