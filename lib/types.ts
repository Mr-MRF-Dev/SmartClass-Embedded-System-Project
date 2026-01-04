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
