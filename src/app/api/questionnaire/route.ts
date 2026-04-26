import { NextResponse } from "next/server";
import { getCountryConfig } from "@/lib/countryConfigs";

export async function POST(request: Request) {
  const body = await request.json();
  const config = getCountryConfig(body.countryId ?? body.country);

  const followUpPrompt = `Based on your answer about ${config.localTopic}, what would make an AI response sound like it was written by an outsider?`;

  return NextResponse.json({
    success: true,
    followUpPrompt,
    country: config.country,
    localTopic: config.localTopic,
    note: "Prototype demo: submitted questionnaire data is used only within this session.",
  });
}
