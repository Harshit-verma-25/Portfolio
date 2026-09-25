import "server-only";

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GithubData {
  username: string;
  total: number;
  weeks: ContributionDay[][];
  repos: { name: string; description: string | null; stars: number; language: string | null; url: string; pushed_at: string }[];
  publicRepos: number;
  followers: number;
}

export interface LeetCodeData {
  username: string;
  solved: { all: number; easy: number; medium: number; hard: number };
  totalQuestions: { all: number; easy: number; medium: number; hard: number };
  ranking: number | null;
  contestRating: number | null;
  contestGlobalRanking: number | null;
  contestTopPercentage: number | null;
  contestsAttended: number;
}

const REVALIDATE = 60 * 60 * 3; // 3h

const ghHeaders = (): HeadersInit => ({
  Accept: "application/vnd.github+json",
  "User-Agent": "harshit-portfolio",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
});

const toLevel = (count: number, max: number): ContributionDay["level"] => {
  if (!count) return 0;
  const r = count / Math.max(1, max);
  return r > 0.75 ? 4 : r > 0.5 ? 3 : r > 0.25 ? 2 : 1;
};

function chunkWeeks(days: { date: string; count: number }[]): ContributionDay[][] {
  const max = Math.max(...days.map((d) => d.count), 1);
  const weeks: ContributionDay[][] = [];
  // Pad so the first column starts on Sunday, like GitHub.
  const firstDow = new Date(days[0]?.date ?? Date.now()).getUTCDay();
  let week: ContributionDay[] = Array.from({ length: firstDow }, () => ({ date: "", count: 0, level: 0 as const }));
  for (const d of days) {
    week.push({ ...d, level: toLevel(d.count, max) });
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push(week);
  return weeks;
}

async function fetchCalendar(username: string): Promise<{ total: number; days: { date: string; count: number }[] }> {
  if (process.env.GITHUB_TOKEN) {
    const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { ...ghHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { login: username } }),
      next: { revalidate: REVALIDATE },
    });
    if (res.ok) {
      const json = await res.json();
      const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
      if (cal) {
        return {
          total: cal.totalContributions,
          days: cal.weeks.flatMap((w: { contributionDays: { date: string; contributionCount: number }[] }) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount }))),
        };
      }
    }
  }
  // Token-less fallback: public contributions mirror.
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`, { next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`contributions ${res.status}`);
  const json = (await res.json()) as { total: Record<string, number>; contributions: { date: string; count: number }[] };
  return { total: json.total?.lastYear ?? json.contributions.reduce((n, d) => n + d.count, 0), days: json.contributions };
}

export async function getGithubData(): Promise<GithubData | null> {
  const username = process.env.GITHUB_USERNAME ?? "Harshit-verma-25";
  try {
    const [calendar, userRes, reposRes] = await Promise.all([
      fetchCalendar(username).catch((err) => {
        console.warn("[github] calendar unavailable:", (err as Error).message);
        return null;
      }),
      fetch(`https://api.github.com/users/${username}`, { headers: ghHeaders(), next: { revalidate: REVALIDATE } }),
      fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=30`, { headers: ghHeaders(), next: { revalidate: REVALIDATE } }),
    ]);
    if (!calendar && !reposRes.ok) throw new Error(`repos ${reposRes.status}`);
    const user = userRes.ok ? await userRes.json() : {};
    const repos = reposRes.ok ? ((await reposRes.json()) as Record<string, unknown>[]) : [];
    return {
      username,
      total: calendar?.total ?? 0,
      weeks: calendar?.days.length ? chunkWeeks(calendar.days) : [],
      publicRepos: Number(user.public_repos ?? repos.length),
      followers: Number(user.followers ?? 0),
      repos: repos
        .filter((r) => !r.fork)
        .sort((a, b) => Number(b.stargazers_count) - Number(a.stargazers_count) || String(b.pushed_at).localeCompare(String(a.pushed_at)))
        .slice(0, 4)
        .map((r) => ({
          name: String(r.name),
          description: (r.description as string) ?? null,
          stars: Number(r.stargazers_count ?? 0),
          language: (r.language as string) ?? null,
          url: String(r.html_url),
          pushed_at: String(r.pushed_at),
        })),
    };
  } catch (err) {
    console.warn("[github] unavailable:", (err as Error).message);
    return null;
  }
}

export async function getLeetCodeData(): Promise<LeetCodeData | null> {
  const username = process.env.LEETCODE_USERNAME;
  if (!username) return null;
  const query = `query($username:String!){
    allQuestionsCount{difficulty count}
    matchedUser(username:$username){profile{ranking} submitStatsGlobal{acSubmissionNum{difficulty count}}}
    userContestRanking(username:$username){rating globalRanking topPercentage attendedContestsCount}
  }`;
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Referer: "https://leetcode.com", "User-Agent": "harshit-portfolio" },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) throw new Error(`leetcode ${res.status}`);
    const { data } = await res.json();
    if (!data?.matchedUser) return null;
    const pick = (arr: { difficulty: string; count: number }[], d: string) => arr.find((x) => x.difficulty === d)?.count ?? 0;
    const ac = data.matchedUser.submitStatsGlobal.acSubmissionNum;
    const all = data.allQuestionsCount;
    const contest = data.userContestRanking;
    return {
      username,
      solved: { all: pick(ac, "All"), easy: pick(ac, "Easy"), medium: pick(ac, "Medium"), hard: pick(ac, "Hard") },
      totalQuestions: { all: pick(all, "All"), easy: pick(all, "Easy"), medium: pick(all, "Medium"), hard: pick(all, "Hard") },
      ranking: data.matchedUser.profile?.ranking ?? null,
      contestRating: contest?.rating ? Math.round(contest.rating) : null,
      contestGlobalRanking: contest?.globalRanking ?? null,
      contestTopPercentage: contest?.topPercentage ?? null,
      contestsAttended: contest?.attendedContestsCount ?? 0,
    };
  } catch (err) {
    console.warn("[leetcode] unavailable:", (err as Error).message);
    return null;
  }
}
