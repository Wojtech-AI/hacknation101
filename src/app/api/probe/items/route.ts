import { NextResponse } from "next/server";
import { ok } from "@/lib/types";
import { publicProbeItems } from "@/lib/probe";

/**
 * GET /api/probe/items
 *
 * Returns the 3 probe items with their prompts and options but without
 * `correctIndex` / `explanation`. The client renders the form, then
 * POSTs to /api/probe/submit which performs scoring server-side.
 */
export async function GET() {
  return NextResponse.json(
    ok({
      items: publicProbeItems(),
      note: "Probe items are scored server-side; ground-truth answers stay on the server.",
    }),
  );
}
