import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deviceId, powerUsage } = body;

    if (!deviceId) {
      return NextResponse.json(
        { error: "deviceId is required" },
        { status: 400 },
      );
    }

    const system = await prisma.embeddedSystem.findUnique({
      where: { deviceId },
    });

    if (!system) {
      return NextResponse.json({ error: "System not found" }, { status: 404 });
    }

    await prisma.embeddedSystem.update({
      where: { id: system.id },
      data: { lastSeen: new Date() },
    });

    if (powerUsage) {
      await prisma.powerUsage.create({
        data: {
          embeddedSystemId: system.id,
          voltage: powerUsage.voltage,
          current: powerUsage.current,
          power: powerUsage.power,
          energy: powerUsage.energy,
        },
      });
    }

    return NextResponse.json({ success: true, systemId: system.id });
  } catch (error) {
    console.error("Error ingesting data:", error);
    return NextResponse.json(
      { error: "Failed to ingest data" },
      { status: 500 },
    );
  }
}
