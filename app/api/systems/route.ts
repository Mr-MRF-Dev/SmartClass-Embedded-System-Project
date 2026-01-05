import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all embedded systems
export async function GET() {
  try {
    const systems = await prisma.embeddedSystem.findMany({
      include: {
        _count: {
          select: { heatingSchedules: true },
        },
        alarms: {
          where: {
            resolvedAt: null,
          },
          take: 1,
          orderBy: {
            triggeredAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Add alarmActive flag based on active alarms
    const systemsWithAlarmStatus = systems.map((system) => ({
      ...system,
      alarmActive: system.alarms.length > 0,
      alarmTriggeredAt: system.alarms[0]?.triggeredAt || null,
    }));

    return NextResponse.json(systemsWithAlarmStatus);
  } catch (error) {
    console.error("Error fetching systems:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Failed to fetch systems",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

// POST create new embedded system
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, location, classroom, description, status, deviceId } = body;

    if (!name || !location || !deviceId) {
      return NextResponse.json(
        { error: "Name, location, and deviceId are required" },
        { status: 400 },
      );
    }

    const system = await prisma.embeddedSystem.create({
      data: {
        name,
        location,
        classroom,
        description,
        status: status || "active",
        deviceId,
        lastSeen: new Date(),
      },
    });

    return NextResponse.json(system, { status: 201 });
  } catch (error) {
    console.error("Error creating system:", error);
    return NextResponse.json(
      { error: "Failed to create system" },
      { status: 500 },
    );
  }
}
