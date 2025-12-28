// Type definitions for the database models
import {
  EmbeddedSystem,
  Sensor,
  SensorReading,
  PowerUsage,
  Command,
} from "@prisma/client";

export type SystemWithSensors = EmbeddedSystem & {
  sensors: Sensor[];
};

export type SensorWithSystem = Sensor & {
  embeddedSystem: EmbeddedSystem;
  readings?: SensorReading[];
};

export type SystemWithRelations = EmbeddedSystem & {
  sensors: Sensor[];
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

export type CreateDeviceInput = {
  name: string;
  type: string;
  unit?: string;
  currentValue?: number;
  minThreshold?: number;
  maxThreshold?: number;
  status?: string;
  embeddedSystemId: string;
};

export type UpdateDeviceInput = Partial<CreateDeviceInput>;
