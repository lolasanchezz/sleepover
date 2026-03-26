"use server"

import { addProduct } from "@/lib/airtable"
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";

export async function orderProduct(formData: FormData, product: string, addressString?: string) {
  const session = await requireAuth();
  const id = session.userId;
  
  if (!product) {
    throw new Error("Product ID is required")
  }

  await addProduct(id, product, formData, addressString)

  redirect("/portal/shop")
}
