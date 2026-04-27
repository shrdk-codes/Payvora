import * as functions from "firebase-functions";
import axios from "axios";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AIRequestData {
  messages: Message[];
}

interface AIResponseData {
  answer: string;
}

/**
 * Firebase Cloud Function: getAIResponse
 *
 * Receives conversation history from the frontend and calls the OpenRouter API
 * using the API key stored securely as a Firebase environment variable.
 * The key is never exposed to the client.
 *
 * Set the key before deploying:
 *   firebase functions:config:set openrouter.api_key="YOUR_OPENROUTER_KEY"
 *
 * Or for Firebase Functions v2 (Gen 2) use Secret Manager / .env files.
 */
export const getAIResponse = functions.https.onCall(
  async (data: AIRequestData, _context): Promise<AIResponseData> => {
    // Retrieve API key from Firebase environment config (never exposed to client)
    const apiKey: string | undefined =
      functions.config().openrouter?.api_key ||
      process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "OpenRouter API key is not configured."
      );
    }

    const messages: Message[] = Array.isArray(data.messages)
      ? data.messages
      : [];

    if (messages.length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "messages array is required and must not be empty."
      );
    }

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "meta-llama/llama-3-8b-instruct:free",
          messages,
          max_tokens: 256,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://payvora-sigma.vercel.app",
            "X-Title": "PayVora AI Agent",
          },
        }
      );

      const answer: string =
        response.data?.choices?.[0]?.message?.content ?? "";
      if (!answer) {
        throw new functions.https.HttpsError(
          "internal",
          "Received an empty response from the AI model."
        );
      }
      return { answer };
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data
          ? JSON.stringify(err.response.data)
          : String(err);
      functions.logger.error("OpenRouter API error:", message);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to get AI response."
      );
    }
  }
);
