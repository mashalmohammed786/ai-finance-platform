import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const today = new Date().toISOString().split("T")[0];

    const systemPrompt = `
    You are an expert financial assistant. Extract transaction details from this spoken input: "${prompt}".

    Return ONLY a valid JSON object matching this exact structure, with no markdown formatting or backticks:
    {
      "amount": number or null,
      "category": string or "Uncategorized",
      "description": string,
      "type": "EXPENSE" or "INCOME",
      "date": "YYYY-MM-DD"
    }

    Note:
    - Today's date is ${today}. Calculate relative dates like "yesterday" or "last Tuesday".
    - Default "type" to "EXPENSE" unless income words like "salary", "received", "refund" are mentioned.
    `;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text().trim();
    
    // Clean up potential markdown code block formatting
    const jsonString = text.replace(/^```json/, "").replace(/```$/, "").trim();
    const parsedData = JSON.parse(jsonString);

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error("Voice parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse voice input" },
      { status: 500 }
    );
  }
}