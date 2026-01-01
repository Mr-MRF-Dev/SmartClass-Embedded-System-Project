import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get("deviceId");

  if (!deviceId) {
    return NextResponse.json(
      { error: "deviceId is required" },
      { status: 400 },
    );
  }

  try {
    const commands = await prisma.command.findMany({
      where: {
        embeddedSystem: {
          deviceId,
        },
        status: "pending",
      },
      orderBy: {
        sentAt: "asc",
      },
    });

    const commandIds = commands.map((c) => c.id);

    if (commandIds.length > 0) {
      await prisma.command.updateMany({
        where: {
          id: { in: commandIds },
        },
        data: {
          status: "sent",
        },
      });
    }

    return NextResponse.json(commands);
  } catch (error) {
    console.error("Error fetching commands:", error);
    return NextResponse.json(
      { error: "Failed to fetch commands" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { embeddedSystemId, type, payload } = body;

    if (!embeddedSystemId || !type || !payload) {
      return NextResponse.json(
        { error: "embeddedSystemId, type, and payload are required" },
        { status: 400 },
      );
    }

    const command = await prisma.command.create({
      data: {
        embeddedSystemId,
        type,
        payload,
      },
    });

    return NextResponse.json(command, { status: 201 });
  } catch (error) {
    console.error("Error creating command:", error);
    return NextResponse.json(
      { error: "Failed to create command" },
      { status: 500 },
    );
  }
}
