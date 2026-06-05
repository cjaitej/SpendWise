import { Transaction } from "@/context/FinanceContext";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface HistoryItem {
  user: string;
  message: string;
}

interface ChatParams {
  message: string;
  transactions: Partial<Transaction>[];
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
You are SpendWise AI, a smart personal finance assistant.

Your goal is to help users understand and improve their finances using ONLY the transaction data provided.

## Capabilities
- Analyze spending patterns
- Categorize spending behavior
- Detect unusual expenses
- Identify recurring subscriptions
- Summarize expenses by category
- Provide budgeting suggestions
- Answer questions about transactions

## Transaction Data
${JSON.stringify(transactions)}

## Previous Conversation
${formattedHistory}

## User Question
${message}

## Important Rules
1. Use ONLY the transaction data provided.
2. Never invent transactions, amounts, merchants, dates, categories, or subscriptions.
3. If the data is insufficient, clearly say so.
4. Do not assume missing information.
5. All currency values are in INR (₹).
6. Keep responses concise and mobile-friendly.
7. Use bullet points whenever possible.
8. Highlight important numbers using ₹ formatting.
9. When giving advice, base it on actual spending patterns from the data.
10. If asked for totals, calculate them from the provided transactions.
11. If asked for trends, compare only available data.
12. Avoid generic financial advice unless directly relevant.

## Response Style
- Friendly and professional
- Maximum 6-8 short bullet points
- Focus on actionable insights
- Prioritize the most important findings first

Provide the best answer to the user's question.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return responseText;
  } catch (err) {
    console.error("Direct Gemini API Error:", err);
    throw err;
  }
}
