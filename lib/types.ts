// Type definitions for the database models
import { EmbeddedSystem, PowerUsage, Command } from "@/generated/prisma/client";

export type SystemWithRelations = EmbeddedSystem & {
  powerUsage: PowerUsage[];
  commands: Command[];
};

export type CreateSystemInput = {
  name: string;
  location: string;
  description?: string;
  status?: string;
};

export type UpdateSystemInput = Partial<CreateSystemInput>;

// Schedule interface for AI-generated and manual schedules
export interface Schedule {
  season: string;
  month: number | null;
  weekdays: string;
  startTime: string;
  endTime: string;
  targetTemperature: number;
  targetLuminance: number;
  enabled: boolean;
}
