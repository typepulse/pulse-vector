import process from "node:process";
import { createClient } from "jsr:@supabase/supabase-js@2";

type ActivityResponse = {
  user_id: string;
  signup_date: string;
  api_key_created: boolean;
  file_uploaded: boolean;
};

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

Deno.serve(async (req) => {
  const { API_ROUTE_SECRET } = await req.json();
  if (API_ROUTE_SECRET !== process.env.API_ROUTE_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data, error } = await supabaseAdmin.rpc("get_recent_user_activity");

  if (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }

  const userActivity = (data as ActivityResponse[]).reduce(
    (
      acc: {
        totalSignups: number;
        totalApiKeyCreated: number;
        totalFileUploads: number;
      },
      curr,
    ) => {
      acc.totalSignups += 1;
      if (curr.api_key_created) {
        acc.totalApiKeyCreated += 1;
      }
      if (curr.file_uploaded) {
        acc.totalFileUploads += 1;
      }
      return acc;
    },
    {
      totalSignups: 0,
      totalApiKeyCreated: 0,
      totalFileUploads: 0,
    },
  );

  const message = `
  **🗞️ Weekly Report (${
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  })**
- Total Signups: ${userActivity.totalSignups}
- Total API Key Created: ${userActivity.totalApiKeyCreated}
- Total File Uploads: ${userActivity.totalFileUploads}
`;

  await fetch(
    "https://discordapp.com/api/channels/1328923640682643466/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      body: JSON.stringify({ content: message }),
    },
  );

  return new Response(
    JSON.stringify({ status: "success", data: userActivity }),
    { headers: { "Content-Type": "application/json" } },
  );
});
