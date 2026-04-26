import { NextResponse } from "next/server";
import { ok, err } from "@/lib/types";
import type { Candidate, QuestionnaireData, TestResult } from "@/lib/types";
import { generatePassport } from "@/lib/passport";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const profile: Candidate = body.profile;
    const questionnaire: QuestionnaireData = body.questionnaire;
    const testResult: TestResult = body.testResult;

    if (!profile || !questionnaire || !testResult) {
      return NextResponse.json(err("Missing profile, questionnaire, or test result."), { status: 400 });
    }

    const passport = generatePassport(profile, questionnaire, testResult);

    return NextResponse.json(
      ok({
        passport,
        generatedAt: new Date().toISOString(),
        note: "Prototype demo: Skills Passport generated dynamically from your profile, questionnaire, and test score.",
      })
    );
  } catch {
    return NextResponse.json(err("Failed to generate Skills Passport."), { status: 400 });
  }
}
