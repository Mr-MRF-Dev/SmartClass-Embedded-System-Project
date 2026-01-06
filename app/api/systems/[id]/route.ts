import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET single system
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const system = await prisma.embeddedSystem.findUnique({
      where: { id },
      include: {
        powerUsage: {
          take: 10,
          orderBy: { timestamp: "desc" },
        },
        commands: {
          take: 10,
          orderBy: { sentAt: "desc" },
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
    });

    if (!system) {
      return NextResponse.json({ error: "System not found" }, { status: 404 });
    }

    // Add alarmActive flag based on active alarms
    const systemWithAlarmStatus = {
      ...system,
      alarmActive: system.alarms.length > 0,
      alarmTriggeredAt: system.alarms[0]?.triggeredAt || null,
    };

    return NextResponse.json(systemWithAlarmStatus);
  } catch (error) {
    console.error("Error fetching system:", error);
    return NextResponse.json(
      { error: "Failed to fetch system" },
      { status: 500 },
    );
  }
}

// PUT update system
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, location, description, status } = body;

    const system = await prisma.embeddedSystem.update({
      where: { id },
      data: {
        name,
        location,
        description,
        status,
      },
    });

    return NextResponse.json(system);
  } catch (error) {
    console.error("Error updating system:", error);
    return NextResponse.json(
      { error: "Failed to update system" },
      { status: 500 },
    );
  }
}

// PATCH update system (partial update)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, location, classroom, description, status, ipAddress } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (classroom !== undefined) updateData.classroom = classroom;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (ipAddress !== undefined) updateData.ipAddress = ipAddress;

    const system = await prisma.embeddedSystem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(system);
  } catch (error) {
    console.error("Error updating system:", error);
    return NextResponse.json(
      { error: "Failed to update system" },
      { status: 500 },
    );
  }
}

// DELETE system
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.embeddedSystem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting system:", error);
    return NextResponse.json(
      { error: "Failed to delete system" },
      { status: 500 },
    );
  }
}
