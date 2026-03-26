import Airtable from "airtable";
import { getUserInfo } from "./auth";
import { projectReviewMessage } from "./bot";

function getBase() {
  if (!process.env.AIRTABLE_API_KEY) {
    throw new Error("AIRTABLE_API_KEY is required");
  }
  if (!process.env.AIRTABLE_BASE_ID) {
    throw new Error("AIRTABLE_BASE_ID is required");
  }
  return new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );
}

function getUsersTable() {
  return getBase()(process.env.AIRTABLE_TABLE_NAME || "Users");
}

export async function getUserFromId(userid: string) {
  const safeId = escapeFormulaString(userid);
  const records = await getUsersTable().select({
    filterByFormula: `{id} = '${safeId}'`,
    maxRecords: 1,
  })
  .firstPage();
  
  const user = records[0];
  if (!user) return null;
  
  const getField = (field: unknown): string => {
    if (Array.isArray(field)) return String(field[0] || "");
    return String(field || "");
  };

  return {
    recordId: user.id,
    id: user.get("id") as string,
    email: user.get("email") as string,
    name: user.get("name") as string | undefined,
    slack_id: user.get("slack_id") as string | undefined,
    slack_display_name: user.get("slack_display_name") as string | undefined,
    slack_avatar_url: user.get("slack_avatar_url") as string | undefined,
    verification_status: user.get("verification_status") as string | undefined,
    firstName: getField(user.get("First Name")),
    lastName: getField(user.get("Last Name")),
  };
}

export async function getAllUsers() {
  const users = await getUsersTable()
    .select({
      view: "Grid view"
    })
    .all();

  return users.map((user) => ({
    id: user.get("id") as string,
    slack_id: user.get("slack_id") as string,
  }));
}

function getFulfillmentTable() {
  return getBase()("FULFILLMENT");
}


export function getProjectsTable() {
  return getBase()("projects");
}

export function getProductsTable() {
  return getBase()("shop");
}

export function getShopTable() {
  return getBase()("user_shop_info");
}

export function getDevlogsTable() {
  return getBase()("devlogs");
}

export function getPyramidTable() {
  return getBase()("pyramid");
}

//YSWS database
function getReviewTable() {
  return getBase()("YSWS Project Submission");
}

export async function getSingularProject(userid: string, name: string) {
  const safeUserId = escapeFormulaString(userid);
  const safeName = escapeFormulaString(name);
  const records = await getProjectsTable()
    .select({
      filterByFormula: `AND({userid} = '${safeUserId}', {name} = '${safeName}')`,
      view: "Grid view",
    })
    .firstPage();

  const project = records[0];
  if (!project) return null;
  
  return {
    id: project.id,
    name: project.get("name") as string,
    desc: project.get("desc") as string,
    hours: project.get("hours") as number,
    status: project.get("status") as string,
    hackatime_name: project.get("hackatime_name") as string,
    userid: project.get("userid") as string,
  };
}

export async function getProjectById(projectId: string) {
  const record = await getProjectsTable().find(projectId);
  return {
    id: record.id,
    name: record.get("name") as string,
    desc: record.get("desc") as string,
    hours: record.get("hours") as number,
    hackatime_name: record.get("hackatime_name") as string,
    userid: record.get("userid") as string,
  };
}

export async function updateProjectHours(projectid: string, hours: number) {
  return await getProjectsTable().update([
    {
      "id": projectid,
      "fields": {
        "hours": hours
      }
    }])
}

export async function updateProjectName(projectid: string, name: string) {
  if (typeof name !== "string" || name.length > 200) {
    throw new Error("Invalid name: must be a string under 200 characters");
  }
  const record = await getProjectsTable().update([
    {
      "id": projectid,
      "fields": {
        "name": name
      }
    }])
  return record[0];
}

export async function updateProjectDesc(projectid: string, desc: string) {
  if (typeof desc !== "string" || desc.length > 5000) {
    throw new Error("Invalid description: must be a string under 5000 characters");
  }
  const record = await getProjectsTable().update([
    {
      "id": projectid,
      "fields": {
        "desc": desc
      }
    }])
  return record[0];
}

export async function updateProjectHackatime(projectid: string, hackatime_name: string) {
  const record = await getProjectsTable().update([
    {
      "id": projectid,
      "fields": {
        "hackatime_name": hackatime_name
      }
    }])
  return record[0];
}

export async function getUsersProjects(userid: string) {
  const safeId = escapeFormulaString(userid);
  const records = await getProjectsTable()
  .select({
    filterByFormula: `{userid} = '${safeId}'`,
    view: "Grid view"
}).all()

  const projects = records.map((r) => ({
    id: r.id,
    name: r.get("name") as string,
    desc: r.get("description") as string,
    hours: r.get("hours") as Number,
    status: r.get("status") as string,
    hackatime_name: r.get("hackatime_name") as string,
  }));

  return projects || [];
}

export interface UserRecord {
  id: string;
  email: string;
  name?: string;
  slack_id?: string;
  slack_display_name?: string;
  slack_avatar_url?: string;
  verification_status?: string;
  utm_source?: string;
  referral_code?: string;
  created_at: string;
}

function escapeFormulaString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export async function findUserByEmail(email: string) {
  const safeEmail = escapeFormulaString(email);
  const records = await getUsersTable()
    .select({
      filterByFormula: `{email} = '${safeEmail}'`,
      maxRecords: 1,
    })
    .firstPage();

  const user = records[0];
  if (!user) return null;
  
  return {
    recordId: user.id,
    id: user.get("id") as string,
    email: user.get("email") as string,
    name: user.get("name") as string | undefined,
    slack_id: user.get("slack_id") as string | undefined,
    slack_display_name: user.get("slack_display_name") as string | undefined,
    slack_avatar_url: user.get("slack_avatar_url") as string | undefined,
    verification_status: user.get("verification_status") as string | undefined,
    referral_code: user.get("referral_code") as string | undefined,
  };
}

export async function createUser(user: Omit<UserRecord, "created_at">) {
  const fields: Record<string, string> = {
    id: user.id,
    email: user.email,
    name: user.name || "",
    slack_id: user.slack_id || "",
    slack_display_name: user.slack_display_name || "",
    slack_avatar_url: user.slack_avatar_url || "",
    verification_status: user.verification_status || "",
    utm_source: user.utm_source || "",
    referral_code: user.referral_code || "",
    created_at: new Date().toISOString(),
  };

  const record = await getUsersTable().create(fields);
  return {
    recordId: record.id,
    id: record.get("id") as string,
    email: record.get("email") as string,
  };
}

export async function updateUser(
  recordId: string,
  updates: Partial<UserRecord>
) {
  const record = await getUsersTable().update(recordId, updates);
  return {
    recordId: record.id,
    id: record.get("id") as string,
    email: record.get("email") as string,
  };
}

export async function updateUserPronouns(userId: string, pronouns: string) {
  const safeId = escapeFormulaString(userId);
  const records = await getUsersTable()
    .select({
      filterByFormula: `{id} = '${safeId}'`,
      maxRecords: 1,
    })
    .firstPage();

  if (!records.length) {
    throw new Error("User not found");
  }

  const record = records[0];
  await getUsersTable().update([
      {
        id: record.id,
        fields: {
          pronouns: pronouns
        },
      },
    ]);

  return { success: true };
}

export async function getShopItems() {
  const records = await getProductsTable()
    .select({
      view: "Grid view",
    })
    .all();

  return records.map((r) => ({
    id: r.id,
    name: r.get("item_friendly_name") as string,
    description: r.get("description") as string,
    price: r.get("price") as number,
    image: r.get("image") as string | undefined,
    availability: r.get("availability") as string | undefined,
  }));
}

export async function getCurrency(userid: string) {
  const safeId = escapeFormulaString(userid);
  const records = await getShopTable()
    .select({
      filterByFormula: `{id} = '${safeId}'`,
      maxRecords: 1,
    })
    .firstPage();

    return records[0]?.get("currency") ?? 0
}

const locks = new Map<string, Promise<void>>();

async function withPurchaseLock<T>(userid: string, fn: () => Promise<T>): Promise<T> {
  const key = `purchase:${userid}`;
  
  while (locks.has(key)) {
    await locks.get(key);
  }
  
  let resolve: () => void;
  const lockPromise = new Promise<void>((r) => { resolve = r; });
  locks.set(key, lockPromise);
  
  try {
    return await fn();
  } finally {
    locks.delete(key);
    resolve!();
  }
}

const SINGLE = ["rec4wZN4c2OdkWMnc"]; // Sticker sheet

export async function addProduct(userid: string, product: string, formData: FormData, address?: string, ) {
  return withPurchaseLock(userid, async () => {
    const safeUserId = escapeFormulaString(userid);

    if (!/^rec[a-zA-Z0-9]{14}$/.test(product)) {
      throw new Error("Product not found");
    }

    const [records, product_record] = await Promise.all([
      getShopTable()
        .select({
          filterByFormula: `{id} = '${safeUserId}'`,
          maxRecords: 1,
        })
        .firstPage(),
      getProductsTable().find(product).catch(() => null),
    ]);

    if (!product_record) {
      throw new Error("Product not found");
    }

    if (!records.length) {
      throw new Error("User not found");
    }

    const record = records[0];
    const price = Number(product_record.get("price"));

    if (isNaN(price) || price < 0) {
      throw new Error("Invalid product price");
    }

    const currentOrdered = (record.get("ordered") as string[]) ?? [];
    const currentCurrency = (record.get("currency") as number) ?? 0;

    if (SINGLE.includes(product) && currentOrdered.includes(product)) {
      throw new Error("You have already purchased this!");
    }

    const quantity = Math.max(1, Number(formData.get("quantity")) || 1);
    const totalPrice = price * quantity;

    if (currentCurrency < totalPrice) {
      throw new Error("Insufficient balance");
    }

    // Airtable linked-record fields reject duplicate record IDs in the same cell.
    // Keep `ordered` unique while still allowing repeat purchases via fulfillment rows.
    // fixes the travel grant bug!
    const updatedOrdered = [...new Set([...currentOrdered, product])];
    const updatedCurrency = currentCurrency - totalPrice;

    const freshRecord = await getShopTable().find(record.id);
    const freshCurrency = (freshRecord.get("currency") as number) ?? 0;
    const freshOrdered = (freshRecord.get("ordered") as string[]) ?? [];

    if (freshCurrency !== currentCurrency || freshOrdered.length !== currentOrdered.length) {
      throw new Error("Woah you are going too fast! Please try again.");
    }

    await getShopTable().update([
      {
        id: record.id,
        fields: {
          ordered: updatedOrdered,
          currency: updatedCurrency,
        },
      },
    ]);

    addFulfillment(userid, product, quantity, address);

    return "success";
  });
}

export async function hasUserOrderedProduct(userid: string, product: string): Promise<boolean> {
  const safeUserId = escapeFormulaString(userid);
  
  const records = await getShopTable()
    .select({
      filterByFormula: `{id} = '${safeUserId}'`,
      maxRecords: 1,
    })
    .firstPage();

  if (!records.length) return false;

  const currentOrdered = (records[0].get("ordered") as string[]) ?? [];
  return currentOrdered.includes(product);
}

export async function addFulfillment(userid: string, product: string, quantity: number, address?: string) {
  const safeUserId = escapeFormulaString(userid);
  const user = await getUsersTable().select({
    filterByFormula: `{id} = '${safeUserId}'`,
    maxRecords: 1,
  })
  .firstPage();

  const date = new Date().toISOString().slice(0, 10);

  const fields: Record<string, any> = {
    user: [user[0].getId()],
    product: [product],
    date: date,
    status: "Unfulfilled",
    quantity: quantity
  };

  if (address) {
    fields.Address = address;
  }

  const records = await getFulfillmentTable().create([
    {
      fields,
    },
  ]);

  return records[0];
}

export async function getUserOrders(userid: string) {
  const safeUserId = escapeFormulaString(userid);
  const users = await getUsersTable().select({
    filterByFormula: `{id} = '${safeUserId}'`,
    maxRecords: 1,
  })
  .firstPage();

  if (!users.length) return [];

  const user = users[0];
  const userRecordId = user.getId();

  // Fetch all records and filter manually since Airtable formulas don't work well with linked record arrays
  const allRecords = await getFulfillmentTable()
    .select({
      sort: [{ field: "date", direction: "desc" }],
    })
    .all();

  // Filter records where the user field array contains the userRecordId
  const records = allRecords.filter(r => {
    const userField = r.get("user") as string[];
    if (Array.isArray(userField)) {
      return userField.includes(userRecordId);
    }
    return userField === userRecordId;
  });

  const ordersWithDetails = await Promise.all(
    records.map(async (r) => {
      const productIds = r.get("product") as string[];
      const productId = productIds?.[0];

      let productDetails = null;
      if (productId) {
        try {
          const productRecord = await getProductsTable().find(productId);
          productDetails = {
            name: productRecord.get("item_friendly_name") as string,
            price: productRecord.get("price") as number,
            image: productRecord.get("image") as string | undefined,
          };
        } catch (err) {
          console.error("Failed to fetch product details:", err);
        }
      }

      // Get address from Fulfillment record, or empty string if not present
      const address = String(r.get("Address") || "");

      return {
        id: r.id,
        date: r.get("date") as string,
        status: r.get("status") as string,
        product: productDetails,
        productId: productId,
        address,
      };
    })
  );

  return ordersWithDetails;
}

export async function createDevlogEntry(projectId: string, date: string, text: string) {
  if (typeof text !== "string" || text.length > 10000) {
    throw new Error("Invalid text: must be a string under 10000 characters");
  }
  const fields = {
    project: [projectId],
    date: date,
    text: text,
  };

  const record = await getDevlogsTable().create(fields);
  return record;
}

export async function updateDevlogEntry(devlogId: string, text: string) {
  if (typeof text !== "string" || text.length > 10000) {
    throw new Error("Invalid text: must be a string under 10000 characters");
  }
  const record = await getDevlogsTable().update(devlogId, {
    text: text,
  });
  return record;
}

export async function getProjectDevlogs(projectId: string) {
  const records = await getDevlogsTable()
    .select({
      sort: [{ field: "date", direction: "desc" }],
    })
    .all();

  // Filter manually in JavaScript
  const filtered = records.filter(r => {
    const projField = r.get("project");
    if (Array.isArray(projField)) {
      return projField.includes(projectId);
    }
    return projField === projectId;
  });

  return filtered.map((r) => ({
    id: r.id,
    date: r.get("date") as string,
    text: r.get("text") as string,
  }));
}

export async function shipProjectTable(projectid: string, info: any) {
  
  getProjectsTable().update([
    {
      "id": projectid,
      "fields": {
        "status": "Shipped"
      }
    }])

    const safeProjectId = escapeFormulaString(projectid);
    const record = await getProjectsTable()
    .select({
      filterByFormula: `{id} = '${safeProjectId}'`,
      maxRecords: 1,
    })
    .firstPage();
    
    const project = record[0]

    const userid = await project.get("userid")
    var user;

    if (userid) {
      const safeUserId = escapeFormulaString(String(userid));
      user = (await getUsersTable()
      .select({
        filterByFormula: `{id} = '${safeUserId}'`,
        maxRecords: 1,
      })
      .firstPage())[0]
    }

    if (user) {
      //fields
    const fields: Record<any, any> = {
      "First Name": info.firstName || String(user.get("First Name")),
      "Last Name": info.lastName || String(user.get("Last Name")),
      "Email": info.email || user.get("email"),
      "Description": project.get("desc"),
      "GitHub Username": info.github,
      "Address (Line 1)": info.address1,
      "Address (Line 2)": info.address2,
      "City": info.city,
      "State / Province": info.state,
      "Country": info.country,
      "ZIP / Postal Code": info.zip,
      "Birthday": new Date(info.birthdate),
      "Playable URL": info.playable_url,
      "Code URL": info.code_url,
      "userid": user.get("id"),
      "displayname": user.get("slack_display_name"),
      "Project": project.get("name"),
      "YSWS": info.ysws,
      "Challenge": info.challenge,
      "hours": project.get("hours"),
      "isForSnoozefest": info.isForSnoozefest
    };
  
    const review = await getReviewTable().create(fields);

    if (info.screenshot instanceof File) {
      await uploadAttachment({
        baseId: process.env.AIRTABLE_BASE_ID!,
        recordId: review.getId(),       // IMPORTANT
        fieldNameOrId: "Screenshot",        // exact field name
        file: info.screenshot,
      })
    }

    //send dm
    projectReviewMessage(user.get("email"), "Congrats on shipping your project for Sleepover! Your project will be reviewed soon, and any status updates will be sent here.")
    
    return {
      id: review.id,
      project: review.get("Project") as string,
      status: "Pending",
    };
    }
}

export async function getProgressHours(userid: string) {
  const safeId = escapeFormulaString(userid);
  const user = await getShopTable().select({
    filterByFormula: `{id} = '${safeId}'`,
    maxRecords: 1,
  })
  .firstPage();

  return user[0]?.get("hours_shipped") ?? 0
}

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

async function uploadAttachment({
  baseId,
  recordId,
  fieldNameOrId, // "screenshot" or "fldXXXXXXXX"
  file,
}: {
  baseId: string
  recordId: string
  fieldNameOrId: string
  file: File
}) {
  // Validate file size
  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("File exceeds maximum size of 5MB")
  }

  // Validate file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.")
  }

  // Convert File -> base64
  const arrayBuffer = await file.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")

  const url = `https://content.airtable.com/v0/${baseId}/${recordId}/${fieldNameOrId}/uploadAttachment`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contentType: file.type || "application/octet-stream",
      filename: file.name || "upload",
      file: base64,
    }),
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Airtable upload failed (${res.status}): ${text}`)
  }
  return JSON.parse(text)
}

//CACHING STUFF

import { unstable_cache } from "next/cache";

export const getProjectsCached = unstable_cache(
  async (userId: string) => getUsersProjects(userId),
  ["projects-by-user"],
  { revalidate: 60, tags: ["projects"] }
);

export const getUserHoursCached = unstable_cache(
  async (userId: string) => getProgressHours(userId),
  ["user-hours-by-user"],
  { revalidate: 60, tags: ["user-hours"] }
);

export async function getGallery() {
  const records = await getReviewTable()
    .select({
      filterByFormula: `{Status} = 'Approved'`,
    })
    .all();

  return records.map((r) => ({
    id: r.id,
    project: r.get("Project") as string,
    description: r.get("Description") as string,
    displayname: r.get("displayname") as string,
    playableUrl: r.get("Playable URL") as string,
    codeUrl: r.get("Code URL") as string,
    screenshot: r.get("Screenshot") as unknown,
    ysws: r.get("YSWS") as string,
  }));
}

// ADMIN FUNCTIONS

export async function isAdminUser(userId: string): Promise<boolean> {
  const safeId = escapeFormulaString(userId);
  const records = await getUsersTable()
    .select({
      filterByFormula: `{id} = '${safeId}'`,
      maxRecords: 1,
    })
    .firstPage();
  if (!records.length) return false;
  return records[0].get("is_admin") === true;
}

export async function getAllSubmissions() {
  const records = await getReviewTable()
    .select({
      sort: [{ field: "Project", direction: "asc" }],
    })
    .all();

  // Collect unique userids to batch-fetch slack_ids
  const userids = [...new Set(records.map((r) => r.get("userid") as string).filter(Boolean))];
  const slackIdMap: Record<string, string> = {};
  const pronounsMap: Record<string, string> = {};

  if (userids.length > 0) {
    const formula = `OR(${userids.map((id) => `{id} = '${escapeFormulaString(id)}'`).join(",")})`;
    const users = await getUsersTable().select({ filterByFormula: formula, fields: ["id", "slack_id", "pronouns"] }).all();
    for (const u of users) {
      const id = u.get("id") as string;
      const sid = u.get("slack_id") as string;
      const pronouns = u.get("pronouns") as string;
      if (id && sid) slackIdMap[id] = sid;
      if (id && pronouns) pronounsMap[id] = pronouns;
    }
  }

  return records.map((r) => {
    const userid = r.get("userid") as string;
    return {
      id: r.id,
      project: r.get("Project") as string,
      description: r.get("Description") as string,
      displayname: r.get("displayname") as string,
      email: r.get("Email") as string,
      hours: r.get("hours") as number,
      overrideHours: (r.get("Optional - Override Hours Spent") as number) || undefined,
      playableUrl: r.get("Playable URL") as string,
      codeUrl: r.get("Code URL") as string,
      screenshot: r.get("Screenshot") as unknown,
      status: (() => { const s = r.get("Status") as string; return s === "TBD" || !s ? "Pending" : s; })(),
      ysws: r.get("YSWS") as string,
      challenge: r.get("Challenge") as string,
      slack_id: (userid && slackIdMap[userid]) || undefined,
      pronouns: (userid && pronounsMap[userid]) || undefined,
      dm_history: (() => {
        try { return JSON.parse((r.get("dm_history") as string) || "[]"); } catch { return []; }
      })(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createdAt: (r as any)._rawJson?.createdTime as string | undefined,
    };
  });
}

export async function updateSubmissionStatus(
  recordId: string,
  status: "Approved" | "Rejected" | "Pending",
  shipJustification?: string,
  overrideHours?: number
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fields: Record<string, any> = { Status: status === "Pending" ? "TBD" : status };
  if (shipJustification) fields["Optional - Override Hours Spent Justification"] = shipJustification;
  if (overrideHours !== undefined && overrideHours > 0) fields["Optional - Override Hours Spent"] = overrideHours;
  await getReviewTable().update(recordId, fields);
  return { success: true };
}

export type DmEntry = { sender: string; message: string; timestamp: string };

export async function appendSubmissionDm(recordId: string, entry: DmEntry) {
  const records = await getReviewTable()
    .select({ filterByFormula: `RECORD_ID() = '${recordId}'`, maxRecords: 1, fields: ["dm_history"] })
    .firstPage();
  const record = records[0];
  if (!record) throw new Error("Submission not found");

  let history: DmEntry[] = [];
  try {
    const raw = record.get("dm_history") as string;
    if (raw) history = JSON.parse(raw);
  } catch {}

  history.push(entry);
  await getReviewTable().update(recordId, { dm_history: JSON.stringify(history), "DM Msg": entry.message });
  return history;
}

function getCalendarTable() {
  return getBase()("calendar_events");
}

export async function getCalendarEvents() {
  const records = await getCalendarTable()
    .select()
    .all();

  return records
    .map((r) => ({
      id: r.id,
      title: (r.get("title") ?? "") as string,
      date: (r.get("date") ?? "") as string,
      time: (r.get("time") as string) || undefined,
      description: (r.get("description") ?? "") as string,
      type: (r.get("type") ?? "huddle") as "huddle" | "challenge" | "social" | "deadline",
      joinUrl: (r.get("join_url") as string) || undefined,
    }))
    .filter((e) => e.date)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function createCalendarEvent(event: {
  title: string;
  date: string;
  time?: string;
  description: string;
  type: "huddle" | "challenge" | "social" | "deadline";
  joinUrl?: string;
}) {
  const fields: Record<string, string> = {
    title: event.title,
    date: event.date,
    description: event.description,
    type: event.type,
  };
  if (event.time) fields.time = event.time;
  if (event.joinUrl) fields.join_url = event.joinUrl;
  const record = await getCalendarTable().create(fields);
  return {
    id: record.id,
    title: (record.get("title") ?? "") as string,
    date: (record.get("date") ?? "") as string,
    time: record.get("time") as string | undefined,
    description: (record.get("description") ?? "") as string,
    type: (record.get("type") ?? "huddle") as "huddle" | "challenge" | "social" | "deadline",
    joinUrl: record.get("join_url") as string | undefined,
  };
}

export async function updateCalendarEvent(eventId: string, event: {
  title?: string;
  date?: string;
  time?: string | null;
  description?: string;
  type?: "huddle" | "challenge" | "social" | "deadline";
  joinUrl?: string | null;
}) {
  const fields: Record<string, unknown> = {};
  if (event.title !== undefined) fields.title = event.title;
  if (event.date !== undefined) fields.date = event.date;
  if (event.time !== undefined) fields.time = event.time ?? "";
  if (event.description !== undefined) fields.description = event.description;
  if (event.type !== undefined) fields.type = event.type;
  if (event.joinUrl !== undefined) fields.join_url = event.joinUrl ?? "";
  const record = await getCalendarTable().update(eventId, fields as Record<string, string>);
  return {
    id: record.id,
    title: (record.get("title") ?? "") as string,
    date: (record.get("date") ?? "") as string,
    time: (record.get("time") as string) || undefined,
    description: (record.get("description") ?? "") as string,
    type: (record.get("type") ?? "huddle") as "huddle" | "challenge" | "social" | "deadline",
    joinUrl: (record.get("join_url") as string) || undefined,
  };
}

export async function deleteCalendarEvent(eventId: string) {
  await getCalendarTable().destroy(eventId);
  return { success: true };
}

export async function getAllUsersWithReferralCode() {
  const users = await getUsersTable()
    .select({
      filterByFormula: `AND({referral_code} != '', {referral_code} != BLANK())`,
      view: "Grid view"
    })
    .all();

  return users.map((user) => ({
    id: user.get("id") as string,
    email: user.get("email") as string,
    slack_id: user.get("slack_id") as string,
    referral_code: user.get("referral_code") as string,
    verification_status: user.get("verification_status") as string,
  }));
}

export async function upsertPyramidRecord(data: {
  email: string;
  hours: number;
  projects_shipped: number;
  idv_status: string;
  referral_code: string;
}) {
  const safeEmail = escapeFormulaString(data.email);

  // Check if record exists
  const existing = await getPyramidTable()
    .select({
      filterByFormula: `{Email} = '${safeEmail}'`,
      maxRecords: 1,
    })
    .firstPage();

  const fields = {
    Email: data.email,
    Hours: data.hours,
    "Projects Shipped": data.projects_shipped,
    "IDV Status": data.idv_status,
    "Referral Code": data.referral_code,
  };

  if (existing.length > 0) {
    // Update existing record
    await getPyramidTable().update(existing[0].id, fields);
    return existing[0];
  } else {
    // Create new record
    const record = await getPyramidTable().create(fields);
    return record;
  }
}