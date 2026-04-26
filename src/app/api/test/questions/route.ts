import { NextResponse } from "next/server";
import { ok } from "@/lib/types";
import { TEST_QUESTIONS } from "@/lib/mockData";

export async function GET() {
  // Strip correct answers from client-facing payload
  const safeQuestions = TEST_QUESTIONS.map(({ correct: _correct, explanation: _explanation, ...q }) => q);
  return NextResponse.json(ok({ questions: safeQuestions, totalCount: safeQuestions.length }));
}
