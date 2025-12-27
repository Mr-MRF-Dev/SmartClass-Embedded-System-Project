import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sensors = await prisma.sensor.findMany({
      include: {
        embeddedSystem: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(sensors);
  } catch (error) {
    console.error('Error fetching sensors:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch sensors',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, unit, embeddedSystemId, status } = body;

    if (!name || !type || !embeddedSystemId) {
      return NextResponse.json(
        { error: 'Name, type, and embeddedSystemId are required' },
        { status: 400 }
      );
    }

    const sensor = await prisma.sensor.create({
      data: {
        name,
        type,
        unit,
        embeddedSystemId,
        status: status || 'online'
      },
      include: {
        embeddedSystem: true
      }
    });

    return NextResponse.json(sensor, { status: 201 });
  } catch (error) {
    console.error('Error creating sensor:', error);
    return NextResponse.json(
      { error: 'Failed to create sensor' },
      { status: 500 }
    );
  }
}
