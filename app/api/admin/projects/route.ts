import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { isAdminUser, getAllSubmissions, updateSubmissionStatus } from "@/lib/airtable";

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
    const submissions = await getAllSubmissions();
    return NextResponse.json(submissions);
  } catch (err) {
    console.error("Failed to fetch submissions:", err);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { recordId, status } = await request.json();
    if (!recordId || !["Approved", "Rejected", "Pending"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    await updateSubmissionStatus(recordId, status);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update submission:", err);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}
