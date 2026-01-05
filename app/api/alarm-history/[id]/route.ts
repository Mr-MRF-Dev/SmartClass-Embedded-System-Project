import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const alarmHistory = await prisma.alarm.findMany({
      where: {
        embeddedSystemId: id,
      },
      orderBy: {
        triggeredAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json(alarmHistory);
  } catch (error) {
    console.error("Error fetching alarm history:", error);
    return NextResponse.json(
      { error: "Failed to fetch alarm history" },
      { status: 500 },
    );
  }
}
