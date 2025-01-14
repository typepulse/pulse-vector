import { NextRequest, NextResponse } from "next/server";
import axios from "redaxios";

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const routeSecret = searchParams.get("API_ROUTE_SECRET");
  if (routeSecret !== process.env.API_ROUTE_SECRET) {
    return NextResponse.json({ message: "Not authorized" }, { status: 401 });
  }

  // get post request body
  const reqJson = await req.json();

  // Loops
  axios.post(
    "https://app.loops.so/api/v1/events/send",
    {
      email: reqJson.record.email,
      userId: reqJson.record.id,
      firstName: reqJson.record.name?.split(" ")[0] ?? null,
      lastName: reqJson.record.name?.split(" ")[1] ?? null,
      eventName: "new-signup",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
      },
    },
  );

  return NextResponse.json({ status: "done" });
}
