import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";

import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

import * as z from "zod";
import { searchInternet } from "./internet.service.js";
import { sendEmail } from "./mail.service.js";

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");




const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-flash-latest",
  apiKey: process.env.GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});




const searchInternetTool = tool(searchInternet, {
  name: "searchInternet",
  description: "use this tool to search internet",
  schema: z.object({
    query: z.string().describe("search query"),
  }),
});

const sendEmailTool = tool(
  async ({ to, subject, body }) => {
    try {
      await sendEmail({ to, subject, html: body, text: body.replace(/<[^>]*>?/gm, '') });
      return "Email sent successfully";
    } catch (err) {
      return `Failed to send email: ${err.message}`;
    }
  },
  {
    name: "sendEmail",
    description: "Use this tool to send an email to a user. The body should be in HTML format. Useful for sending jokes or info.",
    schema: z.object({
      to: z.string().email().describe("recipient email address"),
      subject: z.string().describe("email subject"),
      body: z.string().describe("email body in HTML format"),
    }),
  }
);




const agent = createReactAgent({
  llm: mistralModel,
  tools: [searchInternetTool, sendEmailTool],
  systemMessage: "Use tools when needed. If the user asks to send an email with a joke or any info, use the sendEmail tool. For jokes, generate a funny HTML template."
});




export async function generateResponse(messages) {
  try {
    console.log("Generating response for", messages.length, "messages");

    
    const processedMessages = await Promise.all(
      messages.map(async (msg) => {
        if (msg.role !== "user") return msg;

        const pdfRegex =
          /!\[PDF:.*?\]\((data:application\/pdf;base64,.*?)\)/g;

        const imageRegex =
          /!\[.*?\]\((data:image\/.*?;base64,.*?)\)/g;

        const pdfMatches = [...msg.content.matchAll(pdfRegex)];
        const imageMatches = [...msg.content.matchAll(imageRegex)];

        let extraText = "";

        for (const match of pdfMatches) {
          try {
            if (!match || !match[1]) continue;

            const parts = match[1].split(",");
            if (parts.length < 2) continue;

            const buffer = Buffer.from(parts[1], "base64");
            const data = await pdf(buffer);

            extraText += `\n\n--- PDF CONTENT START ---\n${data.text}\n--- PDF CONTENT END ---\n`;
          } catch (err) {
            console.error("PDF Parsing Error:", err);
          }
        }

        let cleanedContent = msg.content
          .replace(pdfRegex, "")
          .replace(imageRegex, "")
          .trim();

      
        if (imageMatches.length > 0) {
          const images = imageMatches.map((m) => ({
            type: "image_url",
            image_url: m[1] || "",
          }));

          return {
            ...msg,
            content: [
              {
                type: "text",
                text:
                  (cleanedContent + extraText) ||
                  "Analyze the attached document/image.",
              },
              ...images,
            ],
          };
        }

        return {
          ...msg,
          content:
            (cleanedContent + extraText) ||
            "Analyze the attached document.",
        };
      })
    );

    console.log("Processed messages");

    
    const formattedMessages = processedMessages
      .map((msg) => {
        if (msg.role === "user") {
          if (Array.isArray(msg.content)) {
            return new HumanMessage({ content: msg.content });
          }
          return new HumanMessage(msg.content);
        } else if (msg.role === "ai") {
          return new AIMessage(msg.content);
        }
      })
      .filter(Boolean);

    
    const response = await agent.invoke({
      messages: formattedMessages,
    });

   
    if (!response || !response.messages?.length) {
      throw new Error("Empty response from AI");
    }

    const finalMessage = response.messages.at(-1);

    return finalMessage?.content || "No response generated.";
  } catch (err) {
    console.error("AI GENERATION ERROR:", err);
    throw err;
  }
}



export async function generateChatTitle(message) {
  const pdfRegex =
    /!\[PDF:.*?\]\((data:application\/pdf;base64,.*?)\)/g;

  const imageRegex =
    /!\[.*?\]\((data:image\/.*?;base64,.*?)\)/g;

  const pdfFallbackRegex = /<pdf_text>[\s\S]*?<\/pdf_text>/g;

  let cleanedMessage = message
    .replace(pdfRegex, "[PDF attached]")
    .replace(imageRegex, "[Image attached]")
    .replace(pdfFallbackRegex, "[PDF text attached]")
    .trim();

  if (!cleanedMessage) {
    cleanedMessage = "User uploaded a document";
  }

  const response = await mistralModel.invoke([
    new SystemMessage(`
You are a helpful assistant that generates concise and descriptive titles (2-4 words).
    `),
    new HumanMessage(`
Generate a title for this message:
"${cleanedMessage}"
    `),
  ]);

  return response.content;
}

export async function generateJoke() {
  const response = await mistralModel.invoke([
    new SystemMessage("You are a funny comedian. Generate a short, funny joke for a new user who just signed up for Perplexity."),
    new HumanMessage("Tell me a joke!"),
  ]);
  return response.content;
}
