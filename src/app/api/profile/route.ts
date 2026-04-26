import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({
    success: true,
    message: "Profile saved for demo session.",
    name: body.name ?? "",
    country: body.country ?? "madagascar",
    note: "Prototype demo: no data is stored on a real server.",
  });
}
