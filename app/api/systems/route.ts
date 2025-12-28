import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all embedded systems
export async function GET() {
  try {
    const systems = await prisma.embeddedSystem.findMany({
      include: {
        sensors: true,
        _count: {
          select: { sensors: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(systems);
  } catch (error) {
    console.error('Error fetching systems:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch systems',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// POST create new embedded system
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, location, classroom, description, status, ipAddress, macAddress } = body;

    if (!name || !location) {
      return NextResponse.json(
        { error: 'Name and location are required' },
        { status: 400 }
      );
    }

    const system = await prisma.embeddedSystem.create({
      data: {
        name,
        location,
        classroom,
        description,
        status: status || 'active',
        ipAddress,
        macAddress,
        lastSeen: new Date()
      }
    });

    return NextResponse.json(system, { status: 201 });
  } catch (error) {
    console.error('Error creating system:', error);
    return NextResponse.json(
      { error: 'Failed to create system' },
      { status: 500 }
    );
  }
}
