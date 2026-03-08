import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { isAdminUser, getCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/lib/airtable";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) return null;
  const admin = await isAdminUser(user.userId);
  if (!admin) return null;
  return user;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const events = await getCalendarEvents();
    return NextResponse.json(events);
  } catch (err) {
    console.error("Failed to fetch calendar events:", err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

const VALID_TYPES = ["huddle", "challenge", "social", "deadline"] as const;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateEventFields(fields: {
  title?: string;
  date?: string;
  description?: string;
  type?: string;
  joinUrl?: string | null;
  requireAll?: boolean;
}): string | null {
  const { title, date, description, type, joinUrl, requireAll } = fields;
  if (requireAll) {
    if (!title?.trim()) return "Title is required";
    if (!date) return "Date is required";
    if (!description?.trim()) return "Description is required";
    if (!type || !VALID_TYPES.includes(type as typeof VALID_TYPES[number])) return "Invalid type";
  }
  if (title !== undefined && (typeof title !== "string" || title.trim().length > 200)) return "Title must be under 200 characters";
  if (date !== undefined && !DATE_RE.test(date)) return "Date must be YYYY-MM-DD";
  if (description !== undefined && (typeof description !== "string" || description.length > 2000)) return "Description must be under 2000 characters";
  if (type !== undefined && type && !VALID_TYPES.includes(type as typeof VALID_TYPES[number])) return "Invalid type";
  if (joinUrl) {
    try { const u = new URL(joinUrl); if (!["http:", "https:"].includes(u.protocol)) return "Join URL must be http or https"; }
    catch { return "Invalid join URL"; }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { title, date, time, description, type, joinUrl } = body;

    const err = validateEventFields({ title, date, description, type, joinUrl, requireAll: true });
    if (err) return NextResponse.json({ error: err }, { status: 400 });

    const event = await createCalendarEvent({ title: title.trim(), date, time: time || undefined, description: description.trim(), type, joinUrl: joinUrl || undefined });
    return NextResponse.json(event);
  } catch (err) {
    console.error("Failed to create calendar event");
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { eventId, title, date, time, description, type, joinUrl } = body;
    if (!eventId || typeof eventId !== "string") return NextResponse.json({ error: "Missing eventId" }, { status: 400 });

    const err = validateEventFields({ title, date, description, type, joinUrl });
    if (err) return NextResponse.json({ error: err }, { status: 400 });

    const event = await updateCalendarEvent(eventId, {
      title: title !== undefined ? title.trim() : undefined,
      date,
      time: time || null,
      description: description !== undefined ? description.trim() : undefined,
      type,
      joinUrl: joinUrl || null,
    });
    return NextResponse.json(event);
  } catch (err) {
    console.error("Failed to update calendar event");
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { eventId } = await request.json();
    if (!eventId) return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    await deleteCalendarEvent(eventId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete calendar event:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
