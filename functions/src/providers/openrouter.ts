import { defineSecret } from "firebase-functions/params";

export const OPENROUTER_API_KEY = defineSecret("OPENROUTER_API_KEY");

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export async function generateTextCompletion(model: string, prompt: string): Promise<string> {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY.value()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenRouter (${model}) ${response.status}: ${detail}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error(`OpenRouter (${model}) lieferte keinen Text.`);
  return content;
}
