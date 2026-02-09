import { NextResponse } from "next/server";
import { Ollama } from "ollama";
import { Schedule } from "@/lib/types";

// Initialize Ollama client with timeout configuration
const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || "http://localhost:11434",
  fetch: (url, options) =>
    fetch(url, {
      ...options,
      signal: AbortSignal.timeout(120000), // 2 minute timeout
    }),
});

export async function POST(request: Request) {
  try {
    // Check if Ollama is configured
    if (!process.env.OLLAMA_HOST) {
      return NextResponse.json(
        {
          error: "AI assistant is not configured",
          details: "OLLAMA_HOST environment variable is not set",
        },
        { status: 503 },
      );
    }

    const body = await request.json();
    const {
      systemId,
      classroom,
      location,
      duration, // 'month', 'year', 'custom'
      preferences,
      existingSchedules,
    } = body;

    // Validate required fields
    if (!systemId || !duration) {
      return NextResponse.json(
        { error: "System ID and duration are required" },
        { status: 400 },
      );
    }

    // Build the prompt for the AI
    const prompt = buildSchedulePlannerPrompt({
      classroom,
      location,
      duration,
      preferences,
      existingSchedules,
    });

    // Call Ollama API
    const response = await ollama.chat({
      model: process.env.OLLAMA_MODEL || "llama3.2",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant specialized in creating optimal temperature and lighting schedules for classrooms. 
Your task is to create schedules that maximize energy efficiency while ensuring student comfort.
You must respond ONLY with valid JSON format containing an array of schedule objects.
Each schedule object must have: season (spring/summer/fall/winter), month (1-12), weekdays (comma-separated string like "0,1,2,3,4"), startTime (HH:mm format), endTime (HH:mm format), targetTemperature (number in Celsius), targetLuminance (0-100), enabled (boolean).

Persian month mapping:
- فروردین=1 (spring), اردیبهشت=2 (spring), خرداد=3 (spring)
- تیر=4 (summer), مرداد=5 (summer), شهریور=6 (summer)
- مهر=7 (fall), آبان=8 (fall), آذر=9 (fall)
- دی=10 (winter), بهمن=11 (winter), اسفند=12 (winter)

Weekdays: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday

Consider:
- Spring/Fall: moderate temperatures (18-22°C)
- Summer: cooler settings (20-24°C)
- Winter: warmer settings (22-26°C)
- Working hours for classrooms: typically 8:00-18:00 on weekdays
- Lower temperatures during non-school hours to save energy
- Higher luminance during daytime (70-90), lower at night (20-40)`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: false,
      format: "json",
    });

    // Parse the AI response
    let schedules;
    try {
      const content = response.message.content;
      schedules = JSON.parse(content);

      // Ensure schedules is an array
      if (!Array.isArray(schedules)) {
        if (schedules.schedules && Array.isArray(schedules.schedules)) {
          schedules = schedules.schedules;
        } else {
          throw new Error("Response is not an array of schedules");
        }
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return NextResponse.json(
        {
          error: "Failed to parse AI response",
          details: response.message.content,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      schedules,
      metadata: {
        model: process.env.OLLAMA_MODEL || "llama3.2",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error in AI schedule planner:", error);

    // Check if it's a timeout error
    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json(
        {
          error:
            "AI request timed out. The model may be taking too long to respond.",
          details:
            "Try using a faster model or ensure Ollama is running properly.",
        },
        { status: 504 },
      );
    }

    // Check if it's an Ollama connection error
    if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      return NextResponse.json(
        {
          error:
            "Cannot connect to Ollama. Make sure Ollama is running on localhost:11434",
          details: error.message,
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate schedule plan",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

function buildSchedulePlannerPrompt({
  classroom,
  location,
  duration,
  preferences,
  existingSchedules,
}: {
  classroom?: string;
  location?: string;
  duration: string;
  preferences?: string;
  existingSchedules?: Schedule[];
}): string {
  let prompt = `Create a comprehensive temperature and lighting schedule for a classroom.\n\n`;

  if (classroom) {
    prompt += `Classroom: ${classroom}\n`;
  }
  if (location) {
    prompt += `Location: ${location}\n`;
  }

  prompt += `\nSchedule Duration: ${duration}\n`;

  if (duration === "month") {
    prompt += `Create schedules for the current month with different settings for weekdays and weekends.\n`;
  } else if (duration === "year") {
    prompt += `Create a complete annual schedule covering all 12 months (Persian calendar), with different settings for each season.\n`;
    prompt += `- Spring (فروردین, اردیبهشت, خرداد): months 1-3\n`;
    prompt += `- Summer (تیر, مرداد, شهریور): months 4-6\n`;
    prompt += `- Fall (مهر, آبان, آذر): months 7-9\n`;
    prompt += `- Winter (دی, بهمن, اسفند): months 10-12\n`;
  } else if (duration === "season") {
    prompt += `Create schedules for the current season with optimized settings.\n`;
  }

  if (preferences) {
    prompt += `\nUser Preferences: ${preferences}\n`;
  }

  if (existingSchedules && existingSchedules.length > 0) {
    prompt += `\nExisting Schedules (for reference):\n`;
    prompt += JSON.stringify(existingSchedules, null, 2);
    prompt += `\nYou can modify or improve these schedules.\n`;
  }

  prompt += `\nProvide the schedules as a JSON array. Each schedule should include:
- season: string (spring/summer/fall/winter)
- month: number (1-12)
- weekdays: string (e.g., "0,1,2,3,4" for weekdays, "5,6" for weekends)
- startTime: string (HH:mm format)
- endTime: string (HH:mm format)
- targetTemperature: number (in Celsius, realistic for classroom comfort)
- targetLuminance: number (0-100, percentage)
- enabled: boolean (true)

Create practical schedules that:
1. Save energy during non-school hours
2. Maintain comfortable temperatures during school hours (8:00-18:00)
3. Adjust for seasonal variations
4. Consider different settings for weekdays vs weekends
5. Optimize lighting based on time of day

Respond ONLY with the JSON array, no additional text.`;

  return prompt;
}
