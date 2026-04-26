import { NextResponse } from "next/server";
import { getCountryConfig } from "@/lib/countryConfigs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get("country") ?? "madagascar";
  const config = getCountryConfig(countryId);
  return NextResponse.json({ config, note: "Prototype demo: all dashboard figures are simulated." });
}
