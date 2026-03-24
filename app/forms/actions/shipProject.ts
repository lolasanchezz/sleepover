"use server"

import { getProjectById, shipProjectTable, updateProjectHours, getUserFromId } from "@/lib/airtable"
import { getMultipleProjectHours, parseHackatimeProjects } from "@/lib/hackatime";
import { getSession } from "@/lib/session";
import { triggerPyramidSync } from "@/lib/pyramidSync";
import { getUserInfo, getPrimaryAddress } from "@/lib/auth";

export async function shipProject(formData: FormData, projectId: string) {
  const session = await getSession()

  if (!session.isLoggedIn || !session.userId) {
    throw new Error("Unauthorized");
  }

  const userId = session.userId

  if (!projectId) {
    throw new Error("Project ID is required")
  }

  const project = await getProjectById(projectId)
  if (!project) {
    throw new Error("Project not found")
  }

  if (project.userid !== userId) {
    throw new Error("Not authorized to ship this project")
  }

  if (!project.desc?.trim()) {
    throw new Error("Project description is required before shipping")
  }

  // Update project hours in Airtable with fresh data from Hackatime before shipping
  // (only if not a GWC project with manual hours)
  if (project.hackatime_name) {
    const userRecord = await getUserFromId(userId);
    const slackId = userRecord?.slack_id || "";

    if (slackId) {
      try {
        const hackatimeProjects = parseHackatimeProjects(project.hackatime_name);
        const freshHours = await getMultipleProjectHours(slackId, hackatimeProjects);
        await updateProjectHours(projectId, freshHours);
      } catch (error) {
        console.error(`Error updating hours before shipping:`, error);
        // Continue with shipping even if hours update fails
      }
    }
  }
  // If hackatime_name is empty, this is a GWC project - use the manual hours already stored

  // Get user info and primary address
  const accessToken = session.accessToken;
  if (!accessToken) {
    throw new Error("No access token available")
  }

  const [userInfo, primaryAddress] = await Promise.all([
    getUserInfo(accessToken),
    getPrimaryAddress(accessToken)
  ]);

  const identity = userInfo.identity || userInfo;

  const birthdateValue = formData.get("birthdate");
  const birthdate = birthdateValue ? String(birthdateValue) : identity.birthday || "";

  const info = {
    playable_url: String(formData.get("playable") ?? ""),
    code_url: String(formData.get("code") ?? ""),
    screenshot: formData.get("screenshot") as File,
    github: String(formData.get("github") ?? ""),
    firstName: String(formData.get("firstName") ?? identity.first_name ?? ""),
    lastName: String(formData.get("lastName") ?? identity.first_name ?? ""),
    email: identity.email || session.email || "",
    birthdate: birthdate,
    address1: primaryAddress?.line_1 || "",
    address2: primaryAddress?.line_2 || "",
    city: primaryAddress?.city || "",
    state: primaryAddress?.state || "",
    zip: primaryAddress?.postal_code || "",
    country: primaryAddress?.country || "",
    ysws: formData.get("ysws") === "true",
    challenge: formData.get("challenge") === "true",
    isForSnoozefest: formData.get("isForSnoozefest") === "true"
  }

  // Input validation
  if (info.playable_url.length > 2048) {
    throw new Error("Playable URL too long (max 2048 characters)")
  }
  if (info.code_url.length > 2048) {
    throw new Error("Code URL too long (max 2048 characters)")
  }
  if (info.github.length > 100) {
    throw new Error("GitHub username too long (max 100 characters)")
  }
  if (info.firstName.length > 100 || info.lastName.length > 100) {
    throw new Error("Name fields too long (max 100 characters)")
  }

  await shipProjectTable(projectId, info)

  // Trigger pyramid sync in background (non-blocking)
  triggerPyramidSync(userId)

  return { success: true }
}