import { NextResponse } from "next/server";
import { ok, err } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, country, languages = [], domainKnowledge = [], hobbies = [], informalWork } = body;

    // Derive detected skills from profile + questionnaire
    const detectedSkills: string[] = [];

    if (languages.length >= 2) detectedSkills.push("Multilingual evaluation potential");
    if (domainKnowledge.length > 0) detectedSkills.push(`Domain knowledge: ${domainKnowledge.slice(0, 2).join(", ")}`);
    if (hobbies.includes("Reading") || hobbies.includes("Writing")) detectedSkills.push("Strong text comprehension");
    if (informalWork && informalWork.length > 20) detectedSkills.push("Informal-work context experience");
    detectedSkills.push("Human judgement capability (baseline verified by profile)");

    // Recommended test areas based on profile
    const recommendedAreas: string[] = [];
    recommendedAreas.push("Grammar and language quality review");
    recommendedAreas.push("Factual accuracy assessment");
    if (languages.some((l: string) => l !== "English")) recommendedAreas.push("Translation quality judgement");
    recommendedAreas.push("Scam and misinformation detection");

    // AI clarification message
    const clarificationMessage = `Based on your profile from ${country ?? "your community"}, Unmapped Voices has detected strong potential for AI data evaluation work. Your ${languages.length > 1 ? `multilingual background (${languages.join(", ")}) is` : "language background is"} a valued signal. The micro-skill test below will verify your readiness level and generate your Skills Passport.`;

    return NextResponse.json(
      ok({
        name,
        country,
        detectedSkills,
        recommendedAreas,
        clarificationMessage,
        estimatedTestMinutes: 8,
        note: "Prototype demo: AI skill detection is simulated from profile data.",
      })
    );
  } catch {
    return NextResponse.json(err("Failed to process profile clarification."), { status: 400 });
  }
}
