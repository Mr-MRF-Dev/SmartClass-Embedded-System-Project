import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Manual Gregorian to Jalali (Persian) calendar conversion
function gregorianToJalali(gy: number, gm: number, gd: number) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;

  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];

  jy += 33 * Math.floor(days / 12053);
  days %= 12053;

  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  const jm =
    days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);

  return { year: jy, month: jm, day: jd };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Expect JSON format: { "values": [deviceId, temp, humidity, light, presence, current_consumption] }
    if (
      !body.values ||
      !Array.isArray(body.values) ||
      body.values.length !== 6
    ) {
      return NextResponse.json(
        {
          error:
            'Expected JSON format: { "values": [deviceId, temp, humidity, light, presence, current_consumption] }',
        },
        { status: 400 },
      );
    }

    const [deviceId, temp, humidity, light, presence, currentConsumption] =
      body.values;

    // Validate deviceId
    if (!deviceId || typeof deviceId !== "string") {
      return NextResponse.json(
        { error: "First element must be a valid deviceId string" },
        { status: 400 },
      );
    }

    // Find the embedded system by deviceId
    const system = await prisma.embeddedSystem.findUnique({
      where: { deviceId },
    });

    if (!system) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    if (system.status !== "active") {
      return NextResponse.json(
        {
          error: `Device is ${system.status}. Data ingestion is only allowed for active devices.`,
        },
        { status: 403 },
      );
    }

    const timestamp = new Date();

    // Check if all sensor values are 0 (critical situation)
    const isCritical =
      (temp === 0 || temp === null) &&
      (humidity === 0 || humidity === null) &&
      (light === 0 || light === null) &&
      (presence === 0 || presence === null) &&
      (currentConsumption === 0 || currentConsumption === null);

    // Check if there's an active alarm
    const activeAlarm = await prisma.alarm.findFirst({
      where: {
        embeddedSystemId: system.id,
        resolvedAt: null,
      },
    });

    // If alarm just triggered, create alarm record
    if (isCritical && !activeAlarm) {
      await prisma.alarm.create({
        data: {
          embeddedSystemId: system.id,
          triggeredAt: timestamp,
        },
      });
    }

    // If alarm just resolved, update the active alarm
    if (!isCritical && activeAlarm) {
      await prisma.alarm.update({
        where: { id: activeAlarm.id },
        data: { resolvedAt: timestamp },
      });
    }

    // Update last seen timestamp
    await prisma.embeddedSystem.update({
      where: { id: system.id },
      data: {
        lastSeen: timestamp,
      },
    });

    // Store all sensor readings
    await prisma.deviceReading.create({
      data: {
        embeddedSystemId: system.id,
        temperature: temp !== null && temp !== undefined ? temp : null,
        humidity: humidity !== null && humidity !== undefined ? humidity : null,
        light: light !== null && light !== undefined ? light : null,
        presence: presence !== null && presence !== undefined ? presence : null,
        currentConsumption:
          currentConsumption !== null && currentConsumption !== undefined
            ? currentConsumption
            : null,
        timestamp,
      },
    });

    // Store power consumption data
    if (currentConsumption !== null && currentConsumption !== undefined) {
      await prisma.powerUsage.create({
        data: {
          embeddedSystemId: system.id,
          current: currentConsumption,
          power: currentConsumption * 220, // Assuming 220V, calculate power
          timestamp,
        },
      });
    }

    // Check if there's an active heating schedule
    const now = new Date();

    // Convert to Jalali (Persian) calendar manually
    const jalaliDate = gregorianToJalali(
      now.getFullYear(),
      now.getMonth() + 1,
      now.getDate(),
    );
    const currentMonth = jalaliDate.month; // Jalali month (1-12)
    const currentDay = now.getDay(); // 0=Sunday, 6=Saturday
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    // Find active schedules for this device and month
    const activeSchedules = await prisma.heatingSchedule.findMany({
      where: {
        embeddedSystemId: system.id,
        month: currentMonth,
        enabled: true,
      },
    });

    // Check if any schedule is currently running or starting soon (with dynamic pre-heat calculation)
    let activeSchedule = null;
    for (const schedule of activeSchedules) {
      // Check if current day is in the schedule's weekdays
      const scheduledDays = schedule.weekdays.split(",").map(Number);
      if (!scheduledDays.includes(currentDay)) {
        continue; // Skip this schedule if today is not included
      }

      const startTime = schedule.startTime;
      const endTime = schedule.endTime;

      // Calculate required pre-heat time based on temperature difference
      const currentTemp = temp !== null && temp !== undefined ? temp : 20; // Default to 20°C if no reading
      const targetTemp = schedule.targetTemperature;
      const tempDifference = targetTemp - currentTemp;

      // Calculate pre-heat time: assume heating rate of ~2°C per 10 minutes
      // Minimum 5 minutes, maximum 30 minutes
      let preHeatMinutes = 5; // Default minimum
      if (tempDifference > 0) {
        preHeatMinutes = Math.min(
          Math.max(Math.ceil(tempDifference * 5), 5),
          30,
        );
      }

      // Calculate the time when device should start (pre-heat time before schedule start)
      const preHeatTime = new Date(now.getTime() + preHeatMinutes * 60 * 1000);
      const preHeatTimeStr = `${preHeatTime.getHours().toString().padStart(2, "0")}:${preHeatTime.getMinutes().toString().padStart(2, "0")}`;

      // Check if current time is within the schedule or if schedule starts within pre-heat window
      if (
        (currentTime >= startTime && currentTime <= endTime) ||
        (preHeatTimeStr >= startTime && currentTime < startTime)
      ) {
        activeSchedule = schedule;
        break;
      }
    }

    // Prepare response based on schedule
    if (activeSchedule) {
      // Schedule is active or starting soon - device should turn on
      const responseBody = {
        target_temp: activeSchedule.targetTemperature,
        target_luminance: light !== null && light !== undefined ? light : 0, // Use current light reading
        status: 418,
      };

      return NextResponse.json(responseBody, { status: 200 });
    } else {
      // No active schedule - device should stay off or ignore
      const responseBody = {
        status: 204,
      };

      return NextResponse.json(responseBody, { status: 200 });
    }
  } catch (error) {
    console.error("Error processing device sensor data:", error);
    return NextResponse.json(
      {
        error: "Failed to process device sensor data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
