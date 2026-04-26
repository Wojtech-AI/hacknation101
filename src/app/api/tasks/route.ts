import { NextResponse } from "next/server";
import { getCountryConfig } from "@/lib/countryConfigs";
import { generateTasks } from "@/lib/tasks";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryId = searchParams.get("country") ?? "madagascar";
  const config = getCountryConfig(countryId);
  const tasks = generateTasks(config);
  return NextResponse.json({ tasks, country: config.country });
}
