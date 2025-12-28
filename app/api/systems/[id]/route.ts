import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single system
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const system = await prisma.embeddedSystem.findUnique({
      where: { id: params.id },
      include: { 
        sensors: true,
        powerUsage: {
          take: 10,
          orderBy: { timestamp: 'desc' }
        },
        commands: {
          take: 10,
          orderBy: { sentAt: 'desc' }
        }
      }
    });

    if (!system) {
      return NextResponse.json(
        { error: 'System not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(system);
  } catch (error) {
    console.error('Error fetching system:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system' },
      { status: 500 }
    );
  }
}

// PUT update system
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, location, description, status } = body;

    const system = await prisma.embeddedSystem.update({
      where: { id: params.id },
      data: {
        name,
        location,
        description,
        status
      }
    });

    return NextResponse.json(system);
  } catch (error) {
    console.error('Error updating system:', error);
    return NextResponse.json(
      { error: 'Failed to update system' },
      { status: 500 }
    );
  }
}

// DELETE system
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.embeddedSystem.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting system:', error);
    return NextResponse.json(
      { error: 'Failed to delete system' },
      { status: 500 }
    );
  }
}
