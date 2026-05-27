import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/chat", async (req, res) => {
  try {
    const { message, transactions, history } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const formattedHistory = history
      ?.map((item) => `${item.user}: ${item.message}`)
      .join("\n");

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

    const response = result.response.text();

    res.json({
      message: response,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
