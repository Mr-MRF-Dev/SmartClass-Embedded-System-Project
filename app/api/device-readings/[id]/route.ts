import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get query parameters for time range
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const hours = parseInt(searchParams.get("hours") || "24");

    // Calculate the time threshold
    const timeThreshold = new Date();
    timeThreshold.setHours(timeThreshold.getHours() - hours);

    const readings = await prisma.deviceReading.findMany({
      where: {
        embeddedSystemId: id,
        timestamp: {
          gte: timeThreshold,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
      take: limit,
    });

    return NextResponse.json(readings);
  } catch (error) {
    console.error("Error fetching device readings:", error);
    return NextResponse.json(
      { error: "Failed to fetch device readings" },
      { status: 500 },
    );
  }
}
