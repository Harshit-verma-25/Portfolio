"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUI } from "@/store/ui";
import { track } from "@/lib/analytics";
import { cn, formatRange } from "@/lib/utils";
import type { Experience, Profile, Project, Skill } from "@/types";

export interface TerminalData {
  profile: Profile;
  projects: Pick<Project, "slug" | "title" | "tagline" | "category" | "tech">[];
  skills: Pick<Skill, "name" | "category" | "proficiency">[];
  experiences: Pick<Experience, "company" | "position" | "start_date" | "end_date">[];
}

type Line = { kind: "in" | "out" | "err" | "accent"; text: string };

const PROMPT = "harshit@portfolio:~$";
const PAGES = ["home", "about", "projects", "experience", "blog", "contact"];

const COMMANDS: Record<string, string> = {
  help: "List available commands",
  whoami: "Who is Harshit?",
  about: "Short bio",
  now: "What I'm building right now",
  projects: "List projects",
  open: "open <project> — open a case study",
  skills: "Skills grouped by category",
  experience: "Work history",
  contact: "How to reach me",
  socials: "Social links",
  resume: "Download résumé",
  cd: "cd <page> — navigate (home, about, projects, experience, blog, contact)",
  ask: "ask <question> — ask the AI assistant",
  ls: "List pages",
  history: "Command history",
  date: "Current date & time",
  echo: "echo <text>",
  clear: "Clear the screen",
  exit: "Close the terminal",
};

export function Terminal({ data, className, autoFocus = false, onExit }: { data: TerminalData; className?: string; autoFocus?: boolean; onExit?: () => void }) {
  const router = useRouter();
  const ask = useUI((s) => s.ask);
  const [lines, setLines] = useState<Line[]>(() => [
    { kind: "accent", text: `Welcome to ${data.profile.name}'s portfolio shell v2.0` },
    { kind: "out", text: "Type `help` to see what you can do. Tab autocompletes, ↑/↓ browse history." },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const completions = useMemo(() => [...Object.keys(COMMANDS), ...data.projects.map((p) => p.slug), ...PAGES], [data.projects]);

  const run = (raw: string) => {
    const cmdline = raw.trim();
    const out: Line[] = [{ kind: "in", text: `${PROMPT} ${cmdline}` }];
    const push = (text: string, kind: Line["kind"] = "out") => out.push({ kind, text });
    const [cmd, ...args] = cmdline.split(/\s+/);
    const arg = args.join(" ");
    if (cmdline) {
      setHistory((h) => [...h, cmdline]);
      track("terminal_command", { command: cmd });
    }

    switch (cmd?.toLowerCase()) {
      case "":
      case undefined:
        break;
      case "help":
        Object.entries(COMMANDS).forEach(([k, v]) => push(`  ${k.padEnd(12)} ${v}`));
        break;
      case "whoami":
        push(`${data.profile.name} — ${data.profile.title}`, "accent");
        push(data.profile.tagline);
        break;
      case "about":
        push(data.profile.bio);
        break;
      case "now":
        push(`${data.profile.now_building.role} @ ${data.profile.now_building.company}`, "accent");
        push(data.profile.now_building.summary);
        data.profile.now_building.items.forEach((i) => push(`  • ${i}`));
        break;
      case "projects":
      case "ls-projects":
        data.projects.forEach((p) => push(`  ${p.slug.padEnd(26)} ${p.category.padEnd(12)} ${p.tagline}`));
        push("Tip: `open <project>` to read a case study.", "accent");
        break;
      case "open": {
        const p = data.projects.find((x) => x.slug === arg.toLowerCase() || x.title.toLowerCase() === arg.toLowerCase());
        if (!p) push(`open: project not found: ${arg || "(none)"}`, "err");
        else {
          push(`Opening ${p.title}…`, "accent");
          router.push(`/projects/${p.slug}`);
          onExit?.();
        }
        break;
      }
      case "skills": {
        const groups = new Map<string, string[]>();
        data.skills.forEach((s) => groups.set(s.category, [...(groups.get(s.category) ?? []), s.name]));
        groups.forEach((v, k) => push(`  ${k.padEnd(10)} ${v.join(", ")}`));
        break;
      }
      case "experience":
        data.experiences.forEach((e) => push(`  ${formatRange(e.start_date, e.end_date).padEnd(22)} ${e.position} @ ${e.company}`));
        break;
      case "contact":
        push(`  email     ${data.profile.email}`);
        push("  form      cd contact");
        break;
      case "socials":
        Object.entries(data.profile.socials).forEach(([k, v]) => v && push(`  ${k.padEnd(10)} ${v}`));
        break;
      case "resume":
        push("Downloading résumé…", "accent");
        window.open(data.profile.resume_url, "_blank", "noopener");
        break;
      case "ls":
        push(PAGES.map((p) => `${p}/`).join("  "));
        break;
      case "cd": {
        const page = arg.replace(/^\/|\/$/g, "").toLowerCase() || "home";
        if (!PAGES.includes(page) && page !== "~" && page !== "..") push(`cd: no such page: ${arg}`, "err");
        else {
          router.push(page === "home" || page === "~" || page === ".." ? "/" : `/${page}`);
          onExit?.();
        }
        break;
      }
      case "ask":
        if (!arg) push("usage: ask <question>", "err");
        else {
          push("Handing over to the AI assistant…", "accent");
          ask(arg);
          onExit?.();
        }
        break;
      case "history":
        history.forEach((h, i) => push(`  ${String(i + 1).padStart(3)}  ${h}`));
        break;
      case "date":
        push(new Date().toString());
        break;
      case "echo":
        push(arg);
        break;
      case "sudo":
        push("Nice try. This incident will be reported. 🚨", "err");
        break;
      case "rm":
        push("rm: permission denied — this portfolio is production.", "err");
        break;
      case "clear":
        setLines([]);
        setInput("");
        return;
      case "exit":
        onExit?.();
        break;
      default:
        push(`command not found: ${cmd}. Try \`help\`.`, "err");
    }
    setLines((l) => [...l, ...out]);
    setInput("");
    setCursor(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") run(input);
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setInput(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (cursor < 0) return;
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(-1);
        setInput("");
      } else {
        setCursor(next);
        setInput(history[next]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const parts = input.split(" ");
      const last = parts.pop() ?? "";
      const match = completions.filter((c) => c.startsWith(last.toLowerCase()));
      if (match.length === 1) setInput([...parts, match[0]].join(" ") + " ");
      else if (match.length > 1) setLines((l) => [...l, { kind: "out", text: match.join("  ") }]);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-2xl border border-line bg-[#060918]/95 font-mono text-[13px] shadow-2xl", className)} onClick={() => inputRef.current?.focus()}>
      <div className="flex items-center gap-2 border-b border-line bg-white/[0.03] px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs text-muted">harshit@portfolio — zsh</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 leading-relaxed" data-lenis-prevent role="log" aria-live="polite" aria-label="Terminal output">
        {lines.map((l, i) => (
          <pre
            key={i}
            className={cn(
              "whitespace-pre-wrap break-words font-mono",
              l.kind === "in" && "text-zinc-100",
              l.kind === "out" && "text-zinc-400",
              l.kind === "err" && "text-red-400",
              l.kind === "accent" && "text-cyan-300",
            )}
          >
            {l.text}
          </pre>
        ))}
        <div className="flex items-center gap-2">
          <label htmlFor="terminal-input" className="shrink-0 text-cyan-400">
            {PROMPT}
          </label>
          <input
            id="terminal-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-zinc-100 caret-cyan-400 outline-none"
            aria-label="Terminal command"
          />
        </div>
      </div>
    </div>
  );
}
