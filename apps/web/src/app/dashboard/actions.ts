"use server";

import { createClient } from "@/utils/supabase/server";

export async function generateApiKey() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("api_keys").insert({});
  console.log({ data, error });
}
