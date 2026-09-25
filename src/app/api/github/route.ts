import { getGithubData } from "@/lib/integrations";

export const revalidate = 10800;

export async function GET() {
  const data = await getGithubData();
  return data ? Response.json(data) : Response.json({ error: "GitHub data unavailable" }, { status: 503 });
}
