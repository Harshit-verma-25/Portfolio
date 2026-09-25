import { getLeetCodeData } from "@/lib/integrations";

export const revalidate = 10800;

export async function GET() {
  const data = await getLeetCodeData();
  return data ? Response.json(data) : Response.json({ error: "LeetCode not configured" }, { status: 404 });
}
