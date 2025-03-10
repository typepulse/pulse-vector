import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  try {
    const response = await fetch(`/api/v1/upload-file`, {
      method: "POST",
      headers: {
        Authorization: process.env.DEMO_SUPA_API_KEY!,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json({
        success: false,
        error: errorData?.message || `HTTP error! status: ${response.status}`,
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error uploading file:", error);

    return NextResponse.json({
      success: false,
      error: "An unexpected error occurred while uploading the file",
    }, { status: 500 });
  }
}
