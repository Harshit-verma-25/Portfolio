import { GitFork, Github, Star, Users } from "lucide-react";
import { SectionHeading } from "@/components/motion/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { getGithubData, getLeetCodeData, type ContributionDay, type LeetCodeData } from "@/lib/integrations";

const LEVEL_COLORS = ["rgba(255,255,255,0.05)", "#312e81", "#4f46e5", "#7c3aed", "#22d3ee"];

function Heatmap({ weeks }: { weeks: ContributionDay[][] }) {
  const cell = 11;
  const gap = 3;
  const width = weeks.length * (cell + gap);
  const height = 7 * (cell + gap);
  return (
    <div className="overflow-x-auto pb-2" dir="rtl" data-lenis-prevent>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="GitHub contribution heatmap for the last year" className="block">
        {weeks.map((week, x) =>
          week.map((d, y) =>
            d.date ? (
              <rect key={d.date} x={x * (cell + gap)} y={y * (cell + gap)} width={cell} height={cell} rx={3} fill={LEVEL_COLORS[d.level]}>
                <title>{`${d.count} contribution${d.count === 1 ? "" : "s"} on ${d.date}`}</title>
              </rect>
            ) : null,
          ),
        )}
      </svg>
    </div>
  );
}

function LeetCodeCard({ data }: { data: LeetCodeData }) {
  const rows = [
    { label: "Easy", solved: data.solved.easy, total: data.totalQuestions.easy, color: "#22c55e" },
    { label: "Medium", solved: data.solved.medium, total: data.totalQuestions.medium, color: "#f59e0b" },
    { label: "Hard", solved: data.solved.hard, total: data.totalQuestions.hard, color: "#ef4444" },
  ];
  return (
    <div className="glass h-full rounded-3xl p-7">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">LeetCode</h3>
        <a href={`https://leetcode.com/u/${data.username}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-muted hover:text-fg">
          @{data.username}
        </a>
      </div>
      <p className="mt-6 text-5xl font-semibold tracking-tight text-gradient">{data.solved.all}</p>
      <p className="text-sm text-muted">problems solved</p>
      <ul className="mt-6 space-y-3">
        {rows.map((r) => (
          <li key={r.label}>
            <div className="flex justify-between text-xs">
              <span style={{ color: r.color }}>{r.label}</span>
              <span className="font-mono text-muted">
                {r.solved}/{r.total}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full" style={{ width: `${(r.solved / Math.max(1, r.total)) * 100}%`, background: r.color }} />
            </div>
          </li>
        ))}
      </ul>
      <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5 text-sm">
        <div>
          <dt className="text-xs text-muted">Contest rating</dt>
          <dd className="mt-1 font-semibold">{data.contestRating ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Global ranking</dt>
          <dd className="mt-1 font-semibold">{data.ranking ? `#${data.ranking.toLocaleString()}` : "—"}</dd>
        </div>
      </dl>
    </div>
  );
}

export async function GithubActivity() {
  const [gh, lc] = await Promise.all([getGithubData(), getLeetCodeData()]);
  if (!gh && !lc) return null;
  return (
    <section aria-labelledby="activity-title" className="section">
      <div className="container-page">
        <SectionHeading id="activity-title" eyebrow="Live activity" title="Shipping, in public." description="Real contribution data from GitHub, refreshed every few hours." />
        <div className={lc ? "grid gap-5 lg:grid-cols-[1.8fr_1fr]" : ""}>
          {gh && (
            <Reveal>
              <div className="glass rounded-3xl p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <a href={`https://github.com/${gh.username}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-semibold hover:text-accent">
                    <Github className="size-5" /> @{gh.username}
                  </a>
                  <dl className="flex gap-6 text-sm">
                    <div className="flex items-center gap-1.5">
                      <dt className="sr-only">Contributions in the last year</dt>
                      <dd>
                        <span className="font-semibold">{gh.total.toLocaleString()}</span> <span className="text-muted">contributions</span>
                      </dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GitFork className="size-4 text-muted" aria-hidden />
                      <dt className="sr-only">Public repositories</dt>
                      <dd>{gh.publicRepos}</dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="size-4 text-muted" aria-hidden />
                      <dt className="sr-only">Followers</dt>
                      <dd>{gh.followers}</dd>
                    </div>
                  </dl>
                </div>
                {gh.weeks.length > 0 && (
                  <>
                    <div className="mt-6">
                      <Heatmap weeks={gh.weeks} />
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-1.5 text-[11px] text-muted" aria-hidden>
                      Less {LEVEL_COLORS.map((c) => <span key={c} className="size-2.5 rounded-[3px]" style={{ background: c }} />)} More
                    </div>
                  </>
                )}
                {gh.repos.length > 0 && (
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {gh.repos.map((r) => (
                      <li key={r.name}>
                        <a href={r.url} target="_blank" rel="noreferrer" className="block h-full rounded-2xl border border-line p-4 transition hover:border-white/20 hover:bg-white/[0.04]">
                          <p className="truncate font-mono text-sm font-medium">{r.name}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted">{r.description ?? "No description"}</p>
                          <p className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
                            {r.language && <span>{r.language}</span>}
                            <span className="flex items-center gap-1">
                              <Star className="size-3" aria-hidden /> {r.stars}
                            </span>
                          </p>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          )}
          {lc && (
            <Reveal delay={0.1}>
              <LeetCodeCard data={lc} />
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

export function GithubActivitySkeleton() {
  return (
    <div className="container-page section">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-8 h-64 w-full rounded-3xl" />
    </div>
  );
}
