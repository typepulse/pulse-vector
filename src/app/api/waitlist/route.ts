import { NextResponse } from "next/server";
import axios from "redaxios";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = emailSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // TODO: Add your email storage logic here
    // Example: Save to database, send to email service, etc.
    console.log("New waitlist signup:", email);

    await axios.post(
      "https://discordapp.com/api/channels/1117282263630102628/messages",
      {
        content: `
App: **Supavec**
Email: ${email ?? "No email"}`,
      },
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(
      { message: "Successfully joined waitlist" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
