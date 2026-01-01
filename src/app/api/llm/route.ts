import { NextRequest, NextResponse } from "next/server";
import { callGemini } from "@/lib/llm";
import { LLMRequestSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validated = LLMRequestSchema.parse(body);

    // Call Gemini
    const output = await callGemini(validated);

    return NextResponse.json({ output }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

