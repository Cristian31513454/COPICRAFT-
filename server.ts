import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy initializer for the Gemini client to prevent crashing on boot if no API key is specified yet.
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY standard environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Ensure the endpoint reports configuration state
app.get("/api/config", (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Endpoint: AI-powered Content Analysis
app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { title, content, targetKeyword } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required for analysis." });
    }

    const ai = getGeminiClient();

    const prompt = `Analyze the following blog post or article.
Title: "${title || "Untitled"}"
Target Primary Keyword: "${targetKeyword || "None specified"}"
Content:
"""
${content}
"""

Execute a deep audit of readability, Flesch scores, keyword optimization, tone matching, and core search visibility guidelines. Return a response adhering STRICTLY to the requested JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a senior professional SEO strategist, copywriter, and conversions specialist. Analyze the draft extremely rigorously and yield realistic grades. Do not be overly generous; if the content is short or low value, grade it accordingly.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seoScore: {
              type: Type.INTEGER,
              description: "SEO compliance rating from 20 to 100 based on keyword prominence, title structure, and content length.",
            },
            readabilityGrade: {
              type: Type.STRING,
              description: "Recommended reading level grade (e.g., 'Grade 6-7', 'Grade 9', 'Grade 12', 'University level').",
            },
            readabilityScore: {
              type: Type.INTEGER,
              description: "Flesch reading ease index from 10 to 100 (where 90+ is very easy, 60-70 is standard, <30 is highly academic/difficult).",
            },
            sentimentTone: {
              type: Type.STRING,
              description: "Primary mood or tone detected, such as 'Empathetic & Warm', 'Pragmatic & Informative', 'Overly Salesy', or 'Academic'.",
            },
            toneScores: {
              type: Type.OBJECT,
              properties: {
                persuasiveness: { type: Type.INTEGER, description: "Rating from 0 to 100 for sales-driven conviction and CTA clarity." },
                clarity: { type: Type.INTEGER, description: "Rating from 0 to 100 for syntactical simplicity and logical flow." },
                professionalism: { type: Type.INTEGER, description: "Rating from 0 to 100 for academic/professional authority." },
                engagement: { type: Type.INTEGER, description: "Rating from 0 to 100 for hooking readers and visual structure." },
              },
              required: ["persuasiveness", "clarity", "professionalism", "engagement"],
            },
            suggestedKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "5-7 secondary/LSI keywords that would match search intent and enrich the semantic profile of the text.",
            },
            improvementTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-4 highly specific, actionable editorial/SEO improvements. Be extremely constructive and specific to this text.",
            },
          },
          required: [
            "seoScore",
            "readabilityGrade",
            "readabilityScore",
            "sentimentTone",
            "toneScores",
            "suggestedKeywords",
            "improvementTips",
          ],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Analysis Error:", err);
    res.status(500).json({ error: err.message || "Failed to analyze content." });
  }
});

// Endpoint: Copywriting Smart Rewrite / Tone Changer
app.post("/api/ai/rewrite", async (req, res) => {
  try {
    const { text, tone, instructions } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required for rewriting." });
    }

    const ai = getGeminiClient();

    const prompt = `Rewrite the following section or article segment.
Target Style/Tone: "${tone}"
Custom Directive: "${instructions || "None"}"

Text to Rewrite:
"""
${text}
"""

Keep the factual alignment consistent but rewrite the phrasing, sentence length, hooking potential, and vocabulary to dramatically elevate the copywriting standard according to the selected style in a highly readable format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a master of neuromarketing and conversion copy, writing prose that turns readers into buyers. Adapt perfectly to the selected tone. Do not provide any conversational preamble, notes, or quotes. Output ONLY the rewritten text.",
      },
    });

    res.json({ rewrittenText: response.text });
  } catch (err: any) {
    console.error("Rewrite Error:", err);
    res.status(500).json({ error: err.message || "Failed to rewrite content." });
  }
});

// Endpoint: AI Idea & Outline generator
app.post("/api/ai/outline", async (req, res) => {
  try {
    const { topic, primaryKeyword, audience } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required for outline generation." });
    }

    const ai = getGeminiClient();

    const prompt = `Generate a comprehensive SEO-optimized Blog Post Outline.
Topic: "${topic}"
Primary Target Keyword: "${primaryKeyword || "None specified"}"
Target Audience: "${audience || "General digital readers"}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Create a world-class blog post layout with an H1 suggestion, 4-6 detailed H2 sections, LSI sub-bullets, and hook ideas. Output the content in pure Markdown without conversational meta-text.",
      },
    });

    res.json({ outline: response.text });
  } catch (err: any) {
    console.error("Outline Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate outline." });
  }
});

// Endpoint: Title & Meta tag Auto-generator
app.post("/api/ai/metadata", async (req, res) => {
  try {
    const { title, content, targetKeyword } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required to generate search metadata." });
    }

    const ai = getGeminiClient();

    const prompt = `Based on the draft provided, generate optimized search metadata.
Title Hint: "${title || "Untitled"}"
Target Keyword Hint: "${targetKeyword || "None"}"
Content Sample:
"""
${content.substring(0, 1500)}
"""`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Propose metadata for Google search optimization.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleTag: { type: Type.STRING, description: "SEO Optimized Title Tag (under 60 characters), rich with keyword focus and highly clickable." },
            metaDescription: { type: Type.STRING, description: "High-CTR Meta Description (120-155 characters) summarizing the hook and introducing a clear call-to-value." },
            urlSlug: { type: Type.STRING, description: "Clean URL slug target based on primary keywords, e.g., 'best-marketing-tactics'." },
            headerStructureTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 tips to restructure headings (H1/H2/H3) for ideal schema ranking." }
          },
          required: ["titleTag", "metaDescription", "urlSlug", "headerStructureTips"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (err: any) {
    console.error("Metadata Generation Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate metadata tags." });
  }
});

// Serve frontend assets or integrate Vite Middleware
async function startWebBack() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI SEO Content Studio running at http://0.0.0.0:${PORT}`);
  });
}

startWebBack();
