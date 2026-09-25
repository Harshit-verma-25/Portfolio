import { contactSchema } from "@/lib/validation/contact";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

async function notifyByEmail(lead: { name: string; email: string; subject: string; message: string; budget?: string }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  if (!key || !to) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Portfolio <onboarding@resend.dev>",
      to: [to],
      reply_to: lead.email,
      subject: `New lead: ${lead.subject}`,
      text: `From: ${lead.name} <${lead.email}>\nBudget: ${lead.budget || "—"}\n\n${lead.message}`,
    }),
  }).catch((err) => console.error("[contact] email failed", err));
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  if (!rateLimit(`contact:${ip}`, 5, 10 * 60_000)) {
    return Response.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Please check the form.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const { website, ...lead } = parsed.data;
  if (website) return Response.json({ ok: true }); // bot — pretend success

  const supabase = createServiceClient();
  if (supabase) {
    const { error } = await supabase.from("leads").insert({ ...lead, budget: lead.budget || null, status: "new" });
    if (error) {
      console.error("[contact] insert failed", error);
      return Response.json({ error: "Couldn't save your message. Please email me directly." }, { status: 500 });
    }
  } else if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: "The contact form isn't configured yet. Please email me directly." }, { status: 503 });
  }

  await notifyByEmail({ ...lead, budget: lead.budget || undefined });
  return Response.json({ ok: true });
}
