import { NextResponse } from "next/server";

import { z } from "zod";

import type { RoundTableChatMode } from "@/components/roundtable/types";

import { getHistoricalFigureById } from "@/data/historical-figures";
import { isCustomFigureStorageId } from "@/lib/custom-figures-storage";
import {
  buildFigureSystemPrompt,
  payloadToHistoricalFigure,
} from "@/lib/roundtable-figures";

import {

  buildCustomTopicFull,

  buildPredefinedTopicFull,

  getRoundTableTopicById,

} from "@/data/roundtable-topics";

import { getOpenAIApiKey, getOpenAIModel } from "@/lib/load-secrets";
import {
  buildFigureRetrievalQuery,
  retrieveFigureContext,
} from "@/lib/figure-rag/retrieve";

import { buildDebateUserPrompt, buildInterjectionUserPrompt } from "@/lib/roundtable-prompts";



const messageSchema = z.object({

  role: z.enum(["user", "assistant"]),

  content: z.string(),

  figureId: z.string().optional(),

  figureName: z.string().optional(),

  initials: z.string().optional(),

  era: z.string().optional(),

});



const customTopicSchema = z.object({

  title: z.string().trim().min(1).max(120),

  description: z.string().max(500).optional(),

});

const customFigureSchema = z
  .object({
    fullName: z.string().trim().min(1).max(80).optional(),
    name: z.string().trim().min(1).max(80).optional(),
    activeYears: z.string().max(60).optional(),
    era: z.string().max(60).optional(),
    titleRole: z.string().max(120).optional(),
    role: z.string().max(120).optional(),
    shortDescription: z.string().max(300).optional(),
    biography: z.string().max(2000).optional(),
    expertise: z.union([z.string().max(2000), z.array(z.string())]).optional(),
    leadershipStyle: z.string().max(2000).optional(),
    personality: z.string().max(2000).optional(),
    ideologyPhilosophy: z.string().max(2000).optional(),
    debateStyle: z.string().max(2000).optional(),
    keyAchievements: z.string().max(2000).optional(),
    historicalContext: z.string().max(2000).optional(),
    notableQuotes: z.string().max(2000).optional(),
    profileImageUrl: z.string().max(500_000).optional(),
  })
  .transform((data) => ({
    fullName: (data.fullName ?? data.name ?? "").trim(),
    activeYears: (data.activeYears ?? data.era ?? "").trim(),
    titleRole: (data.titleRole ?? data.role ?? "").trim(),
    shortDescription: data.shortDescription?.trim(),
    biography: data.biography?.trim(),
    expertise: data.expertise,
    leadershipStyle: (data.leadershipStyle ?? data.personality)?.trim(),
    ideologyPhilosophy: data.ideologyPhilosophy?.trim(),
    debateStyle: data.debateStyle?.trim(),
    keyAchievements: data.keyAchievements?.trim(),
    historicalContext: data.historicalContext?.trim(),
    notableQuotes: data.notableQuotes?.trim(),
    profileImageUrl: data.profileImageUrl?.trim(),
  }))
  .refine((data) => data.fullName.length > 0, {
    message: "customFigure.fullName (or name) is required",
  });

const bodySchema = z

  .object({

    figureId: z.string(),

    topicId: z.string().min(1).optional(),

    topicDescription: z.string().max(500).optional(),

    customTopic: customTopicSchema.optional(),

    customFigure: customFigureSchema.optional(),

    messages: z.array(messageSchema),

    mode: z.enum(["debate", "interjection"]).optional(),

    moderatorText: z.string().optional(),

  })

  .refine((data) => Boolean(data.topicId) !== Boolean(data.customTopic), {

    message: "Provide either topicId or customTopic, not both",

  })

  .refine((data) => !data.topicDescription || Boolean(data.topicId), {

    message: "topicDescription requires topicId",

  })

  .refine(
    (data) => {
      const isCustom = isCustomFigureStorageId(data.figureId);
      if (isCustom) return Boolean(data.customFigure);
      return !data.customFigure;
    },
    {
      message: "customFigure is required for custom figure ids and must not be sent for built-in figures",
    },
  );



async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {

  const apiKey = getOpenAIApiKey();

  if (!apiKey) {

    throw new Error("MISSING_API_KEY");

  }



  const model = getOpenAIModel();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      Authorization: `Bearer ${apiKey}`,

    },

    body: JSON.stringify({

      model,

      max_tokens: 350,

      messages: [

        { role: "system", content: systemPrompt },

        { role: "user", content: userPrompt },

      ],

    }),

  });



  const data = (await res.json()) as {

    choices?: { message?: { content?: string } }[];

    error?: { message?: string };

  };



  if (!res.ok) {

    throw new Error(data.error?.message ?? "OpenAI API error");

  }



  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) throw new Error("Empty response from OpenAI");

  return text;

}



function buildUserPrompt(

  mode: RoundTableChatMode,

  topicFull: string,

  messages: z.infer<typeof messageSchema>[],

  moderatorText?: string,

): string {

  if (mode === "interjection" && moderatorText) {

    return buildInterjectionUserPrompt(topicFull, moderatorText, messages);

  }

  return buildDebateUserPrompt(topicFull, messages);

}



function resolveTopicFull(body: z.infer<typeof bodySchema>): string | null {

  if (body.customTopic) {

    return buildCustomTopicFull(body.customTopic.title, body.customTopic.description);

  }

  if (body.topicId) {

    const topic = getRoundTableTopicById(body.topicId);

    if (!topic) return null;

    return buildPredefinedTopicFull(topic.full, body.topicDescription);

  }

  return null;

}



export async function POST(request: Request) {

  let body: z.infer<typeof bodySchema>;

  try {

    const json: unknown = await request.json();

    body = bodySchema.parse(json);

  } catch {

    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  }



  const topicFull = resolveTopicFull(body);

  let figure = getHistoricalFigureById(body.figureId);

  if (!figure && isCustomFigureStorageId(body.figureId) && body.customFigure) {
    figure = payloadToHistoricalFigure(body.figureId, body.customFigure);
  }

  if (!figure) {

    return NextResponse.json({ error: "Unknown figure" }, { status: 400 });

  }

  if (!topicFull) {

    return NextResponse.json({ error: "Unknown topic" }, { status: 400 });

  }



  if (!getOpenAIApiKey()) {

    return NextResponse.json(

      {

        error:

          "OpenAI API key is not configured. Add OPENAI_API_KEY to secrets/openai.env at the repo root or set it in the server environment.",

        code: "MISSING_API_KEY",

      },

      { status: 503 },

    );

  }



  const mode: RoundTableChatMode = body.mode ?? "debate";

  let systemPrompt = buildFigureSystemPrompt(figure, topicFull);
  let citations: { sourceName: string; snippet: string }[] = [];

  const retrievalQuery = buildFigureRetrievalQuery(
    topicFull,
    body.messages,
    mode,
  );
  try {
    const rag = await retrieveFigureContext(figure.id, retrievalQuery, 5);
    if (rag.chunks.length > 0) {
      systemPrompt += rag.promptSection;
      citations = rag.citations.map((c) => ({
        sourceName: c.sourceName,
        snippet: c.snippet,
      }));
    }
  } catch {
    /* RAG optional — fall back to profile-only prompt */
  }

  const userPrompt = buildUserPrompt(mode, topicFull, body.messages, body.moderatorText);



  try {

    const content = await callOpenAI(systemPrompt, userPrompt);

    return NextResponse.json({
      content,
      figureId: figure.id,
      ...(citations.length > 0 ? { citations } : {}),
    });

  } catch (err) {

    const message = err instanceof Error ? err.message : "Generation failed";

    if (message === "MISSING_API_KEY") {

      return NextResponse.json(

        {

          error:

            "OpenAI API key is not configured. Add OPENAI_API_KEY to secrets/openai.env at the repo root.",

          code: "MISSING_API_KEY",

        },

        { status: 503 },

      );

    }

    return NextResponse.json({ error: message }, { status: 502 });

  }

}

