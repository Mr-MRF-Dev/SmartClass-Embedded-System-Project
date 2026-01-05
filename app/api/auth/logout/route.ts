import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "Logout successful",
  });

  // Clear session cookie
  response.cookies.delete("session");

  return response;
}
