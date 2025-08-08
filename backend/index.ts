import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

const app = new Elysia();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  })
);

app.post("/chat", async ({ body }) => {
  const { message } = body as { message: string };

  if (!message) {
    return { error: "Message is required" };
  }

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [{ role: "user", content: message }],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("OpenRouter API Error:", data.error);
      return { error: data.error.message };
    }

    if (!data.choices || data.choices.length === 0) {
      console.error("Invalid response from OpenRouter API:", data);
      return { error: "Failed to generate content" };
    }

    const text = data.choices[0].message.content;
    return { response: text };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate content" };
  }
});

app.listen(3000);

console.log(
  `Backend server is running at http://${app.server?.hostname}:${app.server?.port}`
);
