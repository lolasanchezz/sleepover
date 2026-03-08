import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getCalendarEvents } from "@/lib/airtable";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const events = await getCalendarEvents();
    return NextResponse.json(events);
  } catch (err) {
    console.error("Failed to fetch calendar events:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
