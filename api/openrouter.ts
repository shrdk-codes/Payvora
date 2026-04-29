/**
 * api/openrouter.ts
 *
 * Vercel Edge Function – secure proxy for the OpenRouter AI API.
 *
 * The OPENROUTER_API_KEY is read from Vercel environment variables and is
 * never exposed to the client.
 *
 * POST /api/openrouter
 * Body:  { messages: Array<{ role: string; content: string }> }
 * Reply: { answer: string }  |  { error: string }
 */

export const config = { runtime: "edge" };

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export default async function handler(req: Request): Promise<Response> {
  // Only accept POST requests
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return json({ error: "OpenRouter API key is not configured." }, 500);
  }

  // Build the site URL for the HTTP-Referer header.
  // VERCEL_URL is automatically set by Vercel on each deployment.
  const siteUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://payvora-sigma.vercel.app";

  // Parse request body
  let messages: Message[];
  try {
    const body = await req.json();
    messages = body?.messages;
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: "messages array is required and must not be empty." }, 400);
  }

  // Validate each message has role and content
  for (const msg of messages) {
    if (typeof msg.role !== "string" || typeof msg.content !== "string") {
      return json({ error: "Each message must have a string role and content." }, 400);
    }
  }

  // Call OpenRouter API
  try {
    const upstream = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": siteUrl,
          "X-Title": "PayVora AI Agent",
        },
        body: JSON.stringify({
          // GPT-4o-mini – fast, affordable OpenAI model available on OpenRouter.
          // Change this to any OpenRouter model slug you prefer, e.g.:
          //   "meta-llama/llama-3-8b-instruct:free"
          //   "openai/gpt-4o"
          model: "openai/gpt-4o-mini",
          messages,
          max_tokens: 512,
        }),
      }
    );

    const data = await upstream.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!upstream.ok) {
      const errMsg = data?.error?.message ?? "OpenRouter API error";
      return json({ error: errMsg }, upstream.status);
    }

    const answer = data?.choices?.[0]?.message?.content ?? "";
    if (!answer) {
      return json({ error: "Received an empty response from the AI model." }, 500);
    }

    return json({ answer }, 200);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return json({ error: message }, 500);
  }
}

/** Helper – return a JSON Response with the given status code. */
function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
