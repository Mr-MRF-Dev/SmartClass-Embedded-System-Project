import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      type,
      unit,
      currentValue,
      status,
      threshold,
      minValue,
      maxValue,
    } = body;

    const sensor = await prisma.sensor.update({
      where: { id },
      data: {
        name,
        type,
        unit,
        currentValue,
        status,
        threshold,
        minValue,
        maxValue,
      },
      include: {
        embeddedSystem: true,
      },
    });

    return NextResponse.json(sensor);
  } catch (error) {
    console.error("Error updating sensor:", error);
    return NextResponse.json(
      { error: "Failed to update sensor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.sensor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sensor:", error);
    return NextResponse.json(
      { error: "Failed to delete sensor" },
      { status: 500 },
    );
  }
}
