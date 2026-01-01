import { GoogleGenerativeAI } from "@google/generative-ai";
import { LLMRequest } from "./types";

export async function callGemini(request: LLMRequest): Promise<string> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GOOGLE_GEMINI_API_KEY environment variable is not set");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> = [];

  // Add text parts
  if (request.system_prompt) {
    parts.push({ text: `System: ${request.system_prompt}\n\n` });
  }
  if (request.user_message) {
    parts.push({ text: `User: ${request.user_message}` });
  }

  // Add image parts
  if (request.images && request.images.length > 0) {
    for (const imageBase64 of request.images) {
      // Extract mime type from base64 if present, otherwise default to image/png
      const mimeType = imageBase64.includes("data:image/")
        ? imageBase64.split(";")[0].split(":")[1]
        : "image/png";
      
      // Remove data URL prefix if present
      const base64Data = imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;

      parts.push({
        inlineData: {
          data: base64Data,
          mimeType,
        },
      });
    }
  }

  try {
    const result = await model.generateContent(parts);
    const response = await result.response;
    return response.text();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw new Error("Unknown error occurred while calling Gemini API");
  }
}

