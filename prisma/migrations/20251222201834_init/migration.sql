-- CreateTable
CREATE TABLE "embedded_systems" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "classroom" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ipAddress" TEXT,
    "macAddress" TEXT,
    "lastSeen" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "embedded_systems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unit" TEXT,
    "currentValue" DOUBLE PRECISION,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "threshold" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'online',
    "embeddedSystemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor_readings" (
    "id" TEXT NOT NULL,
    "sensorId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "power_usage" (
    "id" TEXT NOT NULL,
    "embeddedSystemId" TEXT NOT NULL,
    "voltage" DOUBLE PRECISION,
    "current" DOUBLE PRECISION,
    "power" DOUBLE PRECISION NOT NULL,
    "energy" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "power_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commands" (
    "id" TEXT NOT NULL,
    "embeddedSystemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedAt" TIMESTAMP(3),
    "response" JSONB,

    CONSTRAINT "commands_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "embedded_systems_macAddress_key" ON "embedded_systems"("macAddress");

-- CreateIndex
CREATE INDEX "sensors_embeddedSystemId_idx" ON "sensors"("embeddedSystemId");

-- CreateIndex
CREATE INDEX "sensors_type_idx" ON "sensors"("type");

-- CreateIndex
CREATE INDEX "sensor_readings_sensorId_timestamp_idx" ON "sensor_readings"("sensorId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "power_usage_embeddedSystemId_timestamp_idx" ON "power_usage"("embeddedSystemId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "commands_embeddedSystemId_status_idx" ON "commands"("embeddedSystemId", "status");

-- CreateIndex
CREATE INDEX "commands_sentAt_idx" ON "commands"("sentAt" DESC);

-- AddForeignKey
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_embeddedSystemId_fkey" FOREIGN KEY ("embeddedSystemId") REFERENCES "embedded_systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "sensors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "power_usage" ADD CONSTRAINT "power_usage_embeddedSystemId_fkey" FOREIGN KEY ("embeddedSystemId") REFERENCES "embedded_systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commands" ADD CONSTRAINT "commands_embeddedSystemId_fkey" FOREIGN KEY ("embeddedSystemId") REFERENCES "embedded_systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
