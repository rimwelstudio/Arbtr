import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json({ limit: "5mb" }));

// Server-side Gemini client with required User-Agent
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the environment. Please check Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function normalizeLanguageName(lang?: string): string {
  if (!lang || lang === 'auto') return 'auto';
  const trimmed = lang.trim();
  const map: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    zh: 'Chinese (Simplified)',
    ja: 'Japanese',
    ko: 'Korean',
    pt: 'Portuguese',
    it: 'Italian',
    nl: 'Dutch',
    ru: 'Russian',
    ar: 'Arabic',
    hi: 'Hindi',
    tr: 'Turkish',
    pl: 'Polish',
    vi: 'Vietnamese',
    id: 'Indonesian',
    sv: 'Swedish',
    tl: 'Filipino (Tagalog)',
    da: 'Danish',
  };
  return map[trimmed.toLowerCase()] || trimmed;
}

// Valid fallback models in priority order: gemini-3.1-flash-lite (fastest ~1.5-2s), gemini-flash-latest, gemini-3.8-flash
const MODELS_TO_TRY = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];

function safeJsonParse(raw: string): any {
  if (!raw || typeof raw !== "string") {
    throw new Error("Empty response received from AI model");
  }

  let text = raw.trim();

  // Strip code block markers if present
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  // Direct parse attempt
  try {
    return JSON.parse(text);
  } catch (initialErr) {
    // Attempt 1: Extract the outermost JSON object { ... }
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const extracted = text.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(extracted);
      } catch {
        // Attempt 2: Strip trailing commas before close braces or brackets
        const noTrailingCommas = extracted.replace(/,\s*([\]}])/g, "$1");
        try {
          return JSON.parse(noTrailingCommas);
        } catch {}
      }
    }

    throw initialErr;
  }
}

// Normalizes actionPlan steps so that every item has step, title, and description
function normalizeActionPlan(rawPlan: any): Array<{ step: number; title: string; description: string }> {
  if (!rawPlan) {
    return [];
  }

  let items: any[] = [];

  if (Array.isArray(rawPlan)) {
    items = rawPlan;
  } else if (typeof rawPlan === "string") {
    // If returned as a newline or numbered string block
    items = rawPlan
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } else if (typeof rawPlan === "object") {
    if (Array.isArray(rawPlan.steps)) {
      items = rawPlan.steps;
    } else if (Array.isArray(rawPlan.actions)) {
      items = rawPlan.actions;
    } else if (Array.isArray(rawPlan.actionPlan)) {
      items = rawPlan.actionPlan;
    } else if (Array.isArray(rawPlan.checklist)) {
      items = rawPlan.checklist;
    } else {
      // Extract values of object (e.g. { "step1": ..., "step2": ... })
      items = Object.values(rawPlan);
    }
  }

  if (items.length === 0) {
    return [];
  }

  return items.map((item: any, idx: number) => {
    if (typeof item === "string") {
      const cleaned = item.replace(/^(step\s*\d+[:.-]?|\d+[:.-]?)\s*/i, "").trim();
      const rawText = cleaned || item.trim();

      const colonIdx = rawText.indexOf(":");
      const dashIdx = rawText.indexOf(" - ");
      if (colonIdx > 0 && colonIdx < 60) {
        return {
          step: idx + 1,
          title: rawText.slice(0, colonIdx).trim(),
          description: rawText.slice(colonIdx + 1).trim(),
        };
      }
      if (dashIdx > 0 && dashIdx < 60) {
        return {
          step: idx + 1,
          title: rawText.slice(0, dashIdx).trim(),
          description: rawText.slice(dashIdx + 3).trim(),
        };
      }
      return {
        step: idx + 1,
        title: rawText.length > 60 ? rawText.slice(0, 60) + "..." : rawText,
        description: rawText,
      };
    }

    if (typeof item === "object" && item !== null) {
      const stepNum = typeof item.step === "number" ? item.step : idx + 1;
      
      // Look through extensive list of title keys in English and international languages
      const rawTitle =
        item.title ||
        item.action ||
        item.task ||
        item.name ||
        item.heading ||
        item.summary ||
        item.step_title ||
        item.actionTitle ||
        item.actionItem ||
        item.what ||
        item.titre ||
        item.titulo ||
        item.título ||
        item.titel ||
        item.bezeichnung ||
        item.schritt ||
        item.titolo ||
        item.标题 ||
        item.行动 ||
        item.任务 ||
        item.名称 ||
        "";

      // Look through extensive list of description keys
      const rawDesc =
        item.description ||
        item.detail ||
        item.details ||
        item.text ||
        item.instruction ||
        item.notes ||
        item.timeline ||
        item.timeframe ||
        item.how ||
        item.step_description ||
        item.actionDescription ||
        item.texte ||
        item.texto ||
        item.beschreibung ||
        item.dettagli ||
        item.描述 ||
        item.详情 ||
        item.说明 ||
        item.内容 ||
        "";

      const strTitle = String(rawTitle).trim();
      const strDesc = String(rawDesc).trim();

      if (strTitle && strDesc) {
        return {
          step: stepNum,
          title: strTitle,
          description: strDesc,
        };
      }
      if (strTitle && !strDesc) {
        const colonIdx = strTitle.indexOf(":");
        if (colonIdx > 0 && colonIdx < 60) {
          return {
            step: stepNum,
            title: strTitle.slice(0, colonIdx).trim(),
            description: strTitle.slice(colonIdx + 1).trim(),
          };
        }
        return {
          step: stepNum,
          title: strTitle,
          description: strTitle,
        };
      }
      if (!strTitle && strDesc) {
        const colonIdx = strDesc.indexOf(":");
        if (colonIdx > 0 && colonIdx < 60) {
          return {
            step: stepNum,
            title: strDesc.slice(0, colonIdx).trim(),
            description: strDesc.slice(colonIdx + 1).trim(),
          };
        }
        return {
          step: stepNum,
          title: strDesc.length > 60 ? strDesc.slice(0, 60) + "..." : strDesc,
          description: strDesc,
        };
      }

      // If neither matched, inspect other string values in the object
      const stringValues = Object.entries(item)
        .filter(([key, val]) => !["id", "step", "stepNumber", "number"].includes(key) && typeof val === "string" && val.trim().length > 0)
        .map(([, val]) => String(val).trim());

      if (stringValues.length >= 2) {
        return {
          step: stepNum,
          title: stringValues[0],
          description: stringValues[1],
        };
      } else if (stringValues.length === 1) {
        return {
          step: stepNum,
          title: stringValues[0],
          description: stringValues[0],
        };
      }
    }

    return {
      step: idx + 1,
      title: `Action Step ${idx + 1}`,
      description: typeof item === "string" ? item : "",
    };
  });
}

async function generateContentWithFallback(
  ai: GoogleGenAI,
  requestParams: {
    contents: string | any;
    config?: any;
  }
): Promise<any> {
  let lastError: any = null;

  for (const model of MODELS_TO_TRY) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: requestParams.contents,
          config: requestParams.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || err || "");
        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("429") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("Resource has been exhausted");

        if (isTransient) {
          console.log(`[AI Router] Model ${model} busy (attempt ${attempt + 1}), trying alternative...`);
          // Brief pause before retry or next model
          await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        } else {
          console.log(`[AI Router] Model ${model} not available, switching to next model...`);
          break;
        }
      }
    }
  }

  throw lastError;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Main decision analysis endpoint
app.post("/api/analyze-decision", async (req, res) => {
  try {
    const { title, context, options, priorities, targetLanguage } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "A decision title or question is required." });
    }

    const ai = getGeminiClient();

    // Prepare prompt
    const optionsList = Array.isArray(options) && options.filter(Boolean).length > 0
      ? options.filter(Boolean)
      : ["Option A: Proceed / Yes", "Option B: Decline / Status Quo"];

    const prioritiesText = Array.isArray(priorities) && priorities.length > 0
      ? priorities.join(", ")
      : "Standard holistic factors (Financial, Career/Life Satisfaction, Stress & Work-life balance, Long-term growth, Risk & Reversibility)";

    const resolvedLanguage = normalizeLanguageName(targetLanguage);
    const languageInstruction = resolvedLanguage && resolvedLanguage !== "auto"
      ? `CRITICAL LANGUAGE REQUIREMENT: You MUST generate the ENTIRE analysis, all titles, option summaries, pros, cons, categories, criteria names, descriptions, explanations, matrix summaries, SWOT quadrants, strategic implications, verdict, tiebreaker factor, reasoning, and action steps fluently and naturally in ${resolvedLanguage}. Do NOT mix with other languages.`
      : "Language: Infer and match the primary language used in the decision title, or respond in English if neutral.";

    const prompt = `
You are "Arbitr", an expert decision scientist, executive strategist, and cognitive psychologist.
Analyze the following user decision with deep rigor, objective evaluation, and crisp clarity.

${languageInstruction}

Decision to Make:
"${title.trim()}"

Background Context & Nuance:
"${(context || "No extra context provided by the user. Infer common real-world trade-offs.").trim()}"

Candidate Options to evaluate:
${optionsList.map((opt: string, i: number) => `Option ${i + 1}: ${opt}`).join("\n")}

Key User Priorities / Core Values:
${prioritiesText}

You must provide a thorough, multidimensional breakdown covering:
1. "options": For each option:
   - "id": "opt-1", "opt-2", etc.
   - "name": Concise name of the option
   - "summary": A punchy 1-2 sentence assessment
   - "score": Overall estimated fit score from 1 to 100 based on standard well-being and priority alignment
   - "pros": Array of 3 to 6 distinct pros. Each pro must have:
       - "id": unique string
       - "text": concise pro statement
       - "category": e.g. "Financial", "Lifestyle", "Career Growth", "Peace of Mind", "Flexibility"
       - "impact": "low" | "medium" | "high" | "critical"
       - "rationale": brief explanation of why this matters
   - "cons": Array of 3 to 6 distinct cons. Each con must have:
       - "id": unique string
       - "text": concise con statement
       - "category": e.g. "Financial Risk", "Time Commitment", "Stress", "Opportunity Cost", "Uncertainty"
       - "impact": "low" | "medium" | "high" | "critical"
       - "rationale": explanation of the risk
       - "mitigation": practical actionable way to reduce or hedge this negative impact

2. "comparisonMatrix":
   - "analysisSummary": 2-sentence executive summary of how the options compare across criteria.
   - "criteria": Array of 5 to 7 comparative criteria (e.g., "Financial ROI & Cost", "Time & Energy Demand", "Long-term Upside & Growth", "Reversibility & Risk Exposure", "Alignment with Happiness & Well-being", "Stress Level").
     Each criterion must have:
       - "id": unique string
       - "name": criterion title
       - "description": what this measures in this context
       - "importanceWeight": integer 1 to 5 (how critical it normally is for this type of decision)
       - "scores": object mapping each option id (e.g. "opt-1": 8, "opt-2": 5) on a 1-10 scale
       - "explanations": object mapping each option id to a 1-sentence rating reason
       - "leadingOptionId": the option id that wins on this criterion

3. "swotAnalysis":
   Provide a detailed SWOT breakdown for each option (keyed by option id like "opt-1", "opt-2"):
   Each SWOT quadrant contains:
     - "strengths": Array of 3-4 bullet points (internal intrinsic advantages)
     - "weaknesses": Array of 3-4 bullet points (internal disadvantages or deficits)
     - "opportunities": Array of 3-4 bullet points (external tailwinds, leverage points, growth doors)
     - "threats": Array of 3-4 bullet points (external headwinds, downside hazards, black swans)
     - "strategicImplication": A synthesized strategic takeaway for this option

4. "verdict":
   Be bold and decisive! The user came to "Arbitr" to break deadlock.
   - "recommendedOptionId": option id of the winning recommendation
   - "recommendedOptionName": name of the winning option
   - "confidenceScore": integer percentage (e.g. 78, 85, 92) reflecting decision clarity
   - "theTiebreakerFactor": The pivotal, uncompromising reason that breaks the tie
   - "coreReasoning": A persuasive, balanced 2-3 paragraph synthesis explaining why this recommendation edges ahead
   - "regretMinimizationCheck": Bezos-style regret minimization test or 10-10-10 perspective (how will you feel about this in 10 minutes, 10 months, 10 years?)
   - "gutCheckQuestion": A penetrating question the user can ask their intuition to confirm if this feels right
   - "actionPlan": Array of 3 to 5 immediate, practical execution steps within 48 hours. Each step MUST be an object with:
       - "step": integer (1, 2, 3...)
       - "title": concise, high-impact action title (e.g. "Schedule 1-on-1 alignment", "Review financial safeguards")
       - "description": 1-2 sentence concrete instruction detailing exactly what to do and verify
   - "criticalRisksToWatch": 2-3 key pitfalls to monitor closely once the choice is made
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "You are Arbitr, an elite decision consultant and cognitive science analyst. Deliver ultra-sharp, insightful, highly objective decision breakdowns in valid JSON without markdown fences. Ensure all quotes within text fields are properly escaped.",
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsedData = safeJsonParse(response.text || "{}");

    // Ensure verdict actionPlan is normalized
    const rawVerdict = parsedData.verdict || {};
    const normalizedVerdict = {
      ...rawVerdict,
      actionPlan: normalizeActionPlan(rawVerdict.actionPlan),
    };

    // Ensure IDs and consistent structure
    const analysisResult = {
      id: "dec_" + Date.now(),
      createdAt: new Date().toISOString(),
      title: title.trim(),
      context: context ? context.trim() : "",
      options: parsedData.options || [],
      comparisonMatrix: parsedData.comparisonMatrix || { criteria: [], analysisSummary: "" },
      swotAnalysis: parsedData.swotAnalysis || {},
      verdict: normalizedVerdict,
      language: resolvedLanguage || "auto",
    };

    return res.json(analysisResult);
  } catch (error: any) {
    let message = error?.message || "Failed to analyze decision";

    // Unpack raw JSON error messages if Google API returned a serialized error string
    try {
      if (typeof message === "string" && message.trim().startsWith("{")) {
        const parsed = JSON.parse(message);
        if (parsed.error?.message) {
          message = parsed.error.message;
        }
      }
    } catch {
      // Ignore JSON parse error
    }

    const isDemandError =
      message.includes("high demand") ||
      message.includes("503") ||
      message.includes("UNAVAILABLE") ||
      message.includes("Resource has been exhausted");

    if (isDemandError) {
      console.log("[AI Notice] Model is under temporary high demand:", message.slice(0, 120));
    } else {
      console.warn("Decision analysis ended with error:", message);
    }

    return res.status(isDemandError ? 503 : 500).json({
      error: isDemandError
        ? "The AI model is currently experiencing temporary high demand. Please click 'Retry Analysis' to resubmit."
        : message,
      hint: message.includes("GEMINI_API_KEY")
        ? "Please make sure your GEMINI_API_KEY is configured in Settings > Secrets."
        : isDemandError
        ? "Click 'Retry Analysis' to resubmit."
        : "Please check your input and try again.",
    });
  }
});

// AI Translation endpoint: Translates an entire decision analysis structure
app.post("/api/translate-decision", async (req, res) => {
  try {
    const { decisionData, targetLanguage } = req.body;

    if (!decisionData || typeof decisionData !== "object") {
      return res.status(400).json({ error: "decisionData object is required." });
    }
    if (!targetLanguage || typeof targetLanguage !== "string" || !targetLanguage.trim()) {
      return res.status(400).json({ error: "targetLanguage is required." });
    }

    const resolvedTargetLang = normalizeLanguageName(targetLanguage.trim());

    const ai = getGeminiClient();

    const prompt = `
You are an expert multilingual decision scientist and translator.
Translate the following decision analysis report into ${resolvedTargetLang}.

MANDATORY RULES:
1. Translate all natural human language into natural, high-impact ${resolvedTargetLang}:
   - "title" and "context"
   - "options": "name", "summary", "pros" ("text", "category", "rationale"), "cons" ("text", "category", "rationale", "mitigation")
   - "comparisonMatrix": "analysisSummary", and each criterion's "name", "description", and each explanation in "explanations"
   - "swotAnalysis": all bullet points in "strengths", "weaknesses", "opportunities", "threats", and "strategicImplication"
   - "verdict": "recommendedOptionName", "theTiebreakerFactor", "coreReasoning", "regretMinimizationCheck", "gutCheckQuestion", "criticalRisksToWatch", and each actionPlan item ("title", "description")
2. CRITICAL STRUCTURAL PRESERVATION:
   - Do NOT change or delete ANY "id" properties (e.g. keep "opt-1", "opt-2", criterion ids, pro/con ids intact).
   - Do NOT change any numeric scores, weights, or percentages (keep "score", "importanceWeight", "scores" values, "confidenceScore" unchanged).
   - Do NOT change "impact" enum values ("low", "medium", "high", "critical").
   - In "swotAnalysis", the keys must remain the exact option IDs ("opt-1", "opt-2", etc.).
   - In "verdict", "recommendedOptionId" MUST remain the exact same ID.
3. Return strictly valid JSON matching this schema without markdown code fences. Ensure all internal double quotes inside text values are escaped.

Original Data to translate:
${JSON.stringify({
  title: decisionData.title,
  context: decisionData.context,
  options: decisionData.options,
  comparisonMatrix: decisionData.comparisonMatrix,
  swotAnalysis: decisionData.swotAnalysis,
  verdict: decisionData.verdict,
}, null, 2)}
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: `You are an elite translator. Translate the decision analysis report accurately, naturally, and compellingly into ${resolvedTargetLang}. Return strictly valid JSON only.`,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const translatedPayload = safeJsonParse(response.text || "{}");

    // Ensure translated verdict actionPlan is normalized
    let finalVerdict = translatedPayload.verdict || decisionData.verdict || {};
    if (finalVerdict.actionPlan) {
      finalVerdict = {
        ...finalVerdict,
        actionPlan: normalizeActionPlan(finalVerdict.actionPlan),
      };
    }

    const translatedDecision = {
      ...decisionData,
      ...translatedPayload,
      verdict: finalVerdict,
      id: decisionData.id,
      createdAt: decisionData.createdAt,
      translatedTo: resolvedTargetLang,
      originalVersion: decisionData.originalVersion || decisionData,
    };

    return res.json(translatedDecision);
  } catch (error: any) {
    let message = error?.message || "Failed to translate decision";

    try {
      if (typeof message === "string" && message.trim().startsWith("{")) {
        const parsed = JSON.parse(message);
        if (parsed.error?.message) message = parsed.error.message;
      }
    } catch {}

    const isDemandError =
      message.includes("high demand") ||
      message.includes("503") ||
      message.includes("UNAVAILABLE") ||
      message.includes("Resource has been exhausted");

    if (isDemandError) {
      console.log("[AI Notice] Translation under temporary high demand:", message.slice(0, 120));
    } else {
      console.warn("Decision translation ended with error:", message);
    }

    return res.status(isDemandError ? 503 : 500).json({
      error: isDemandError
        ? "The AI translation model is temporarily busy. Please try again in a few seconds."
        : message,
    });
  }
});

// Follow-up refinement endpoint
app.post("/api/refine-decision", async (req, res) => {
  try {
    const { currentDecision, followUpQuestion, targetLanguage } = req.body;
    if (!currentDecision || !followUpQuestion) {
      return res.status(400).json({ error: "Current decision data and follow-up question are required." });
    }

    const ai = getGeminiClient();

    const resolvedLang = normalizeLanguageName(targetLanguage);
    const langDirective = resolvedLang && resolvedLang !== 'auto'
      ? `Respond strictly and fluently in ${resolvedLang}.`
      : `Respond in the primary language of the question or report.`;

    const prompt = `
You are "Arbitr", an elite decision-making advisor.
${langDirective}

The user already has the following decision analysis:

Title: "${currentDecision.title}"
Context: "${currentDecision.context || 'None'}"
Current Options: ${currentDecision.options?.map((o: any) => o.name).join(", ")}
Current Recommended Verdict: ${currentDecision.verdict?.recommendedOptionName}
Tiebreaker Factor: ${currentDecision.verdict?.theTiebreakerFactor}

User's Follow-up scenario / What-if question:
"${followUpQuestion}"

Please provide an insightful, direct advisory answer explaining:
1. How this new condition or question shifts the balance between the options.
2. Does it flip the tiebreaker recommendation? (Yes/No with clear reasoning)
3. Specific adjustments to the pros/cons or risk profile.
4. An actionable tip to test or validate this specific angle before making a final commitment.

Return your response in clean JSON with fields:
{
  "recommendationShift": "flips_verdict" | "reinforces_verdict" | "neutral_nuance",
  "updatedWinningOption": "Name of winning option under this new condition",
  "advisorySummary": "2-3 paragraphs of sharp analytical advice",
  "impactedFactors": ["Key factor 1", "Key factor 2"],
  "testableAction": "One concrete test to run this week to resolve this doubt"
}
`;

    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "You are Arbitr. Answer decisively in valid JSON without markdown fences.",
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = safeJsonParse(response.text?.trim() || "{}");
    return res.json(parsed);
  } catch (error: any) {
    let message = error?.message || "Failed to process follow-up";

    try {
      if (typeof message === "string" && message.trim().startsWith("{")) {
        const parsed = JSON.parse(message);
        if (parsed.error?.message) {
          message = parsed.error.message;
        }
      }
    } catch {}

    const isDemandError =
      message.includes("high demand") ||
      message.includes("503") ||
      message.includes("UNAVAILABLE") ||
      message.includes("Resource has been exhausted");

    if (isDemandError) {
      console.log("[AI Notice] Follow-up refinement under temporary high demand:", message.slice(0, 120));
    } else {
      console.warn("Refinement ended with error:", message);
    }

    return res.status(isDemandError ? 503 : 500).json({
      error: isDemandError
        ? "The AI model is currently experiencing temporary high demand. Please try again shortly."
        : message,
    });
  }
});

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish (Español)",
  fr: "French (Français)",
  de: "German (Deutsch)",
  zh: "Chinese Simplified (简体中文)",
  ja: "Japanese (日本語)",
  ko: "Korean (한국어)",
  pt: "Portuguese (Português)",
  it: "Italian (Italiano)",
  nl: "Dutch (Nederlands)",
  ru: "Russian (Русский)",
  ar: "Arabic (العربية)",
  hi: "Hindi (हिन्दी)",
  tr: "Turkish (Türkçe)",
  pl: "Polish (Polski)",
  vi: "Vietnamese (Tiếng Việt)",
  id: "Indonesian (Bahasa Indonesia)",
  sv: "Swedish (Svenska)",
  tl: "Filipino (Tagalog)",
  da: "Danish (Dansk)",
};

// Zena Voice Persona Chat Endpoint
app.post("/api/zena/chat", async (req, res) => {
  try {
    const { message, decisionContext, conversationHistory, language = "en" } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGeminiClient();
    const targetLang = LANGUAGE_NAMES[language] || language || "English";
    const systemInstruction = `You are Zena, the official mascot and decision referee of Arbitr.
Your mandate: An analytical, candid, and supportive decision referee who cuts through bias, weighs competing trade-offs, and delivers clear verdicts in 1–3 spoken sentences.
Core Directives:
- Identity: You are Zena, the Arbitr Decision Ref. Speak with an analytical, candid, and supportive tone that cuts straight through noise and indecision.
- CRITICAL CONVERSATION LANGUAGE REQUIREMENT: You MUST converse, advise, and respond strictly, purely, and completely in ${targetLang}. Never mix languages, never switch to English or another language mid-response, and never use terms from other languages unless explicitly requested by the user. Every single sentence of your response must be in ${targetLang}.
- Analytical Referee Mandate: Cut through emotional noise and cognitive biases (loss aversion, status quo bias, sunk-cost fallacy). Help the user weigh competing trade-offs with razor-sharp clarity.
- Tiebreaker Precision: When two options are locked in a dilemma or deadlock, isolate the single decisive "Tiebreaker Factor" and deliver a clear, actionable verdict with unflinching conviction.
- CRITICAL CONCISENESS RULE: Every spoken response MUST be strictly within 1 to 3 spoken sentences. Never monologue, never output bulleted walls of text, and never exceed 3 sentences. Be direct, punchy, conversational, and impactful.
${decisionContext ? `\nActive Arbitr Dilemma Context:\n${decisionContext}` : ""}`;

    // Format chat contents
    const contents: any[] = [];
    if (Array.isArray(conversationHistory)) {
      for (const item of conversationHistory.slice(-6)) {
        if (item.text && (item.role === "user" || item.role === "model" || item.role === "assistant")) {
          contents.push({
            role: item.role === "user" ? "user" : "model",
            parts: [{ text: item.text }],
          });
        }
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await generateContentWithFallback(ai, {
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
        maxOutputTokens: 400,
      },
    });

    const reply = response.text?.trim() || "I've analyzed your trade-offs. Weigh your non-negotiable criterion first to break this tie decisively.";
    return res.json({ reply });
  } catch (error: any) {
    console.warn("[Zena Voice Chat] Error processing chat:", error?.message);
    return res.status(500).json({
      error: error?.message || "Failed to generate Zena response",
      reply: "When two choices feel evenly matched, identify which option carries the highest irreversible risk and eliminate it.",
    });
  }
});

// Live Voice status endpoint
app.get("/api/live-voice/status", (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    available: hasKey,
    model: "gemini-3.1-flash-live-preview",
    voices: ["Zena", "Kore", "Puck", "Charon", "Fenrir"],
  });
});

/**
 * WebSocket bridge for Gemini 3.1 Live API
 */
function setupLiveVoiceWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    try {
      const urlObj = new URL(request.url || "", `http://${request.headers.host || "localhost"}`);
      if (urlObj.pathname === "/api/live-voice") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      }
    } catch {
      // Allow other upgrade handlers if any
    }
  });

  wss.on("connection", async (clientWs: WebSocket) => {
    console.log("[Live Voice] New client connected to WebSocket");

    let liveSession: any = null;
    let isLiveConnected = false;
    const queuedClientMessages: any[] = [];

    const sendToClient = (data: any) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(data));
      }
    };

    const processClientMessage = (msg: any) => {
      if (!liveSession) return;
      try {
        if (msg.type === "audio" && msg.audio) {
          liveSession.sendRealtimeInput({
            audio: {
              data: msg.audio,
              mimeType: "audio/pcm;rate=16000",
            },
          });
        } else if (msg.type === "text" && msg.text) {
          liveSession.sendRealtimeInput({
            text: msg.text,
          });
        } else if (msg.type === "turn_complete") {
          liveSession.sendClientContent({ turnComplete: true });
        }
      } catch (err: any) {
        console.warn("[Live Voice] Error sending realtime input:", err?.message);
      }
    };

    async function initLiveSession(voiceName: string = "Zena", decisionContext: string = "", languageCode: string = "en") {
      try {
        const ai = getGeminiClient();
        // Map Zena and other aliases to Gemini Live supported prebuilt voices
        // Gemini Live officially supports: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
        const liveVoiceMap: Record<string, string> = {
          Zena: "Zephyr",
          Aoede: "Zephyr",
          Zephyr: "Zephyr",
          Kore: "Kore",
          Puck: "Puck",
          Charon: "Charon",
          Fenrir: "Fenrir",
        };
        const prebuiltVoice = liveVoiceMap[voiceName] || "Zephyr";
        const targetLang = LANGUAGE_NAMES[languageCode] || languageCode || "English";

        const systemInstruction = `You are Zena, the official mascot and decision referee of Arbitr.
Your mandate: An analytical, candid, and supportive decision referee who cuts through bias, weighs competing trade-offs, and delivers clear verdicts in 1–3 spoken sentences.
Core Directives:
- Identity: You are Zena, the Arbitr Decision Ref. The user addresses you as Zena. Speak with an analytical, candid, and supportive voice that cuts straight through noise and indecision.
- CRITICAL CONVERSATION LANGUAGE REQUIREMENT: You MUST speak, converse, and transcribe strictly, purely, and completely in ${targetLang}. Never mix multiple languages, never switch to English or another language mid-turn, and never output foreign words unless the user explicitly commands you to speak in another language. All spoken audio and output transcriptions must be entirely in ${targetLang}.
- Analytical Referee Mandate: Cut through emotional bias, weigh competing trade-offs, identify overlooked blind spots, and challenge cognitive distortions (like loss aversion, status quo bias, or sunk-cost fallacy).
- Tiebreaker Precision: When two options are locked in a dilemma or deadlock, isolate the single decisive "Tiebreaker Factor" and deliver a clear, actionable verdict with unflinching conviction.
- CRITICAL CONCISENESS RULE: Every spoken response MUST be strictly within 1 to 3 spoken sentences. Never monologue, never output bulleted walls of text, and never exceed 3 sentences. Be direct, punchy, conversational, and impactful.
${decisionContext ? `\nActive Arbitr Dilemma Context:\n${decisionContext}` : ""}`;

        liveSession = await ai.live.connect({
          model: "gemini-3.1-flash-live-preview",
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: prebuiltVoice,
                },
              },
            },
            systemInstruction,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {
              isLiveConnected = true;
              console.log("[Live Voice] Gemini Live connection established for voice:", voiceName, `(mapped to ${prebuiltVoice}) in language:`, targetLang);
              sendToClient({
                type: "ready",
                message: `Connected to Gemini 3.1 Live API as Zena (${targetLang})`,
                voice: voiceName,
                backendVoice: prebuiltVoice,
                language: languageCode,
                languageName: targetLang,
                model: "gemini-3.1-flash-live-preview",
              });

              while (queuedClientMessages.length > 0) {
                const queued = queuedClientMessages.shift();
                processClientMessage(queued);
              }
            },
            onmessage: (message: any) => {
              if (clientWs.readyState !== WebSocket.OPEN) return;

              // 1. Audio data and turn text from model
              let hasTurnText = false;
              const parts = message.serverContent?.modelTurn?.parts;
              if (parts && Array.isArray(parts)) {
                for (const part of parts) {
                  if (part.inlineData?.data) {
                    sendToClient({
                      type: "audio",
                      audio: part.inlineData.data,
                    });
                  }
                  if (part.text) {
                    hasTurnText = true;
                    sendToClient({
                      type: "transcript",
                      role: "model",
                      text: part.text,
                    });
                  }
                }
              }

              // 2. Output audio transcription if sent separately and not already in part.text
              if (!hasTurnText && message.serverContent?.outputTranscription?.text) {
                sendToClient({
                  type: "transcript",
                  role: "model",
                  text: message.serverContent.outputTranscription.text,
                });
              }

              // 3. Input audio transcription (user words)
              if (message.serverContent?.inputTranscription?.text) {
                sendToClient({
                  type: "transcript",
                  role: "user",
                  text: message.serverContent.inputTranscription.text,
                });
              }

              // 4. Interrupted
              if (message.serverContent?.interrupted) {
                sendToClient({ type: "interrupted" });
              }

              // 5. Turn Complete
              if (message.serverContent?.turnComplete) {
                sendToClient({ type: "turn_complete" });
              }
            },
            onerror: (err: any) => {
              console.error("[Live Voice] Live session error:", err);
              sendToClient({
                type: "error",
                error: err?.message || "Live API session error",
              });
            },
            onclose: () => {
              isLiveConnected = false;
              console.log("[Live Voice] Live session closed");
              sendToClient({ type: "closed" });
            },
          },
        });
      } catch (err: any) {
        console.error("[Live Voice] Failed to establish Live session:", err);
        sendToClient({
          type: "error",
          error: err?.message || "Failed to establish Live session",
        });
      }
    }

    clientWs.on("message", async (rawData) => {
      try {
        const msg = JSON.parse(rawData.toString());

        if (msg.type === "ping") {
          sendToClient({ type: "pong", timestamp: Date.now() });
          return;
        }

        if (msg.type === "init") {
          if (liveSession) {
            try {
              liveSession.close();
            } catch {}
            liveSession = null;
            isLiveConnected = false;
          }
          await initLiveSession(msg.voice, msg.decisionContext, msg.language || "en");
          return;
        }

        if (!liveSession || !isLiveConnected) {
          queuedClientMessages.push(msg);
          if (!liveSession) {
            await initLiveSession(msg.voice, msg.decisionContext, msg.language || "en");
          }
          return;
        }

        processClientMessage(msg);
      } catch (err: any) {
        console.warn("[Live Voice] Incoming client message error:", err?.message);
      }
    });

    clientWs.on("close", () => {
      if (liveSession) {
        try {
          liveSession.close();
        } catch {}
        liveSession = null;
      }
    });

    clientWs.on("error", () => {
      if (liveSession) {
        try {
          liveSession.close();
        } catch {}
        liveSession = null;
      }
    });
  });
}

async function startServer() {
  const server = http.createServer(app);

  // Setup WebSocket server for Gemini Live
  setupLiveVoiceWebSocket(server);

  // Robots.txt SEO static route
  app.get("/robots.txt", (_req, res, next) => {
    const robotsPath = path.join(process.cwd(), "public", "robots.txt");
    if (fs.existsSync(robotsPath)) {
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      return res.sendFile(robotsPath);
    }
    next();
  });

  // PWA Service Worker & Web App Manifest MIME Type and static routing
  app.get(["/manifest.webmanifest", "/manifest.json"], (_req, res, next) => {
    const manifestPath = path.join(process.cwd(), "public", "manifest.webmanifest");
    if (fs.existsSync(manifestPath)) {
      res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
      return res.sendFile(manifestPath);
    }
    next();
  });

  // Ensure Service Worker scripts and workbox modules are strictly served as application/javascript
  app.use((req, res, next) => {
    const rawUrl = req.url || "";
    if (
      rawUrl.includes("dev-sw.js") ||
      rawUrl.includes("sw.js") ||
      rawUrl.includes("workbox-") ||
      rawUrl.includes("virtual:pwa-register")
    ) {
      const origSetHeader = res.setHeader.bind(res);
      res.setHeader = function (name: string, val: any) {
        if (typeof name === "string" && name.toLowerCase() === "content-type") {
          return origSetHeader("Content-Type", "application/javascript; charset=utf-8");
        }
        return origSetHeader(name, val);
      };
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    }
    next();
  });

  // Vite middleware in dev or static serving in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Arbitr server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
