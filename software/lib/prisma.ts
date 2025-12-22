import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Prisma Client singleton pattern for Next.js with Prisma 7
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  
  console.log('Creating Prisma Client...');
  console.log('DATABASE_URL exists:', !!connectionString);
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    console.log('Prisma Client created successfully with adapter');
    
    return new PrismaClient({ 
      adapter,
      log: ['error', 'warn', 'query']
    });
  } catch (error) {
    console.error('Failed to create Prisma Client:', error);
    throw error;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
