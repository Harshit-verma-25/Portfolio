import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { buildKnowledgeBase, systemPrompt } from "@/lib/assistant";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "claude-opus-5";

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(2000) }))
    .min(1)
    .max(20)
    .refine((m) => m[m.length - 1].role === "user", "Last message must be from the user"),
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (!rateLimit(`chat:${ip}`, 20, 60_000)) {
    return Response.json({ error: "You're sending messages too quickly. Please wait a minute." }, { status: 429 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      "The AI assistant isn't configured on this deployment yet. You can explore [projects](/projects), read about my [experience](/experience), or reach out via the [contact page](/contact).",
      { headers: { "Content-Type": "text/plain; charset=utf-8" } },
    );
  }

  const client = new Anthropic();
  const knowledge = await buildKnowledgeBase();

  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 2048,
    // Chat about a portfolio is a simple, latency-sensitive route: low effort keeps answers quick.
    output_config: { effort: "low" },
    // Server-side refusal fallback: if the primary model declines, the API re-runs on a fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    // The knowledge base is identical across requests, so cache it.
    system: [{ type: "text", text: systemPrompt(knowledge), cache_control: { type: "ephemeral" } }],
    messages: parsed.data.messages,
  });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\nSorry — I can't help with that one. Try asking about Harshit's projects, skills or experience."));
        }
      } catch (err) {
        console.error("[chat]", err);
        const msg =
          err instanceof Anthropic.RateLimitError
            ? "The assistant is busy right now — please try again in a moment."
            : "Something went wrong while answering. Please try again.";
        controller.enqueue(encoder.encode(`\n\n${msg}`));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
