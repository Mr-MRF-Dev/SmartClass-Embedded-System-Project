import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, type, unit, currentValue, status, threshold, minValue, maxValue } = body;

    const sensor = await prisma.sensor.update({
      where: { id: params.id },
      data: {
        name,
        type,
        unit,
        currentValue,
        status,
        threshold,
        minValue,
        maxValue
      },
      include: {
        embeddedSystem: true
      }
    });

    return NextResponse.json(sensor);
  } catch (error) {
    console.error('Error updating sensor:', error);
    return NextResponse.json(
      { error: 'Failed to update sensor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.sensor.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sensor:', error);
    return NextResponse.json(
      { error: 'Failed to delete sensor' },
      { status: 500 }
    );
  }
}
