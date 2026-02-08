import { NextResponse } from "next/server";

export async function GET() {
  const isEnabled = !!process.env.OLLAMA_HOST;

  return NextResponse.json({
    enabled: isEnabled,
    host: isEnabled ? process.env.OLLAMA_HOST : null,
    model: isEnabled ? process.env.OLLAMA_MODEL || "llama3.2" : null,
  });
}
