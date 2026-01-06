import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all heating schedules for a system
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const schedules = await prisma.heatingSchedule.findMany({
      where: {
        embeddedSystemId: id,
      },
      orderBy: [{ season: "asc" }, { month: "asc" }],
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 },
    );
  }
}

// POST create or update heating schedule
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      season,
      month,
      weekdays,
      startTime,
      endTime,
      targetTemperature,
      enabled,
    } = body;

    if (
      !season ||
      !month ||
      !startTime ||
      !endTime ||
      targetTemperature === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Season, month, startTime, endTime, and targetTemperature are required",
        },
        { status: 400 },
      );
    }

    // Check if schedule already exists with the same configuration
    const existing = await prisma.heatingSchedule.findFirst({
      where: {
        embeddedSystemId: id,
        season,
        month: month,
        weekdays: weekdays || "0,1,2,3,4,5,6",
        startTime,
        endTime,
      },
    });

    let schedule;
    if (existing) {
      // Update existing schedule (only temperature and enabled status)
      schedule = await prisma.heatingSchedule.update({
        where: { id: existing.id },
        data: {
          targetTemperature,
          enabled: enabled !== undefined ? enabled : true,
        },
      });
    } else {
      // Create new schedule
      schedule = await prisma.heatingSchedule.create({
        data: {
          embeddedSystemId: id,
          season,
          month: month,
          weekdays: weekdays || "0,1,2,3,4,5,6",
          startTime,
          endTime,
          targetTemperature,
          enabled: enabled !== undefined ? enabled : true,
        },
      });
    }

    // Send command to device
    await prisma.command.create({
      data: {
        embeddedSystemId: id,
        type: "heating_schedule_update",
        payload: {
          season,
          month,
          weekdays,
          startTime,
          endTime,
          targetTemperature,
          enabled,
        },
        status: "pending",
      },
    });

    return NextResponse.json(schedule, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("Error creating/updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to create/update schedule" },
      { status: 500 },
    );
  }
}

// DELETE a heating schedule
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("scheduleId");

    if (!scheduleId) {
      return NextResponse.json(
        { error: "scheduleId is required" },
        { status: 400 },
      );
    }

    await prisma.heatingSchedule.delete({
      where: { id: scheduleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 },
    );
  }
}
