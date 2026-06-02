import { Transaction } from "@/context/FinanceContext";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface HistoryItem {
  user: string;
  message: string;
}

interface ChatParams {
  message: string;
  transactions: Transaction[];
  history?: HistoryItem[];
}

// In Expo, use EXPO_PUBLIC_ prefix for client-side environment variables
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function getFinanceAIResponse({
  message,
  transactions,
  history,
}: ChatParams): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error(
        "Missing EXPO_PUBLIC_GEMINI_API_KEY in your environment variables.",
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const formattedHistory =
      history?.map((item) => `${item.user}: ${item.message}`).join("\n") ||
      "No previous history";

    const prompt = `
      You are an intelligent finance assistant.

      You help users:
      - analyze expenses
      - detect overspending
      - summarize spending
      - identify subscriptions
      - give budgeting advice

      Transaction history:
      ${JSON.stringify(transactions)}

      Previous Chat:
      ${formattedHistory}

      Current User Question:
      ${message}

      Rules:
      - Keep answers short
      - Be mobile friendly
      - Use bullet points when useful
      - Never hallucinate fake transactions
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return responseText;
  } catch (err) {
    console.error("Direct Gemini API Error:", err);
    throw err;
  }
}
