"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function generateApiKey() {
  const supabase = await createClient();

  await supabase.from("api_keys").insert({});

  revalidatePath("/dashboard");
}
