import { type NextRequest, NextResponse } from "next/server";
import { searchSuggestions } from "@/lib/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const suggestions = await searchSuggestions(q);
  return NextResponse.json({ suggestions });
}
