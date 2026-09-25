"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bold, Code, Heading2, Heading3, Image as ImageIcon, Italic, Link2, List, ListOrdered, Quote, SquareCode } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaPicker } from "./media-picker";

type Action = { icon: typeof Bold; label: string; wrap?: [string, string]; prefix?: string; block?: string };

const ACTIONS: Action[] = [
  { icon: Bold, label: "Bold", wrap: ["**", "**"] },
  { icon: Italic, label: "Italic", wrap: ["_", "_"] },
  { icon: Heading2, label: "Heading 2", prefix: "## " },
  { icon: Heading3, label: "Heading 3", prefix: "### " },
  { icon: Link2, label: "Link", wrap: ["[", "](https://)"] },
  { icon: List, label: "Bulleted list", prefix: "- " },
  { icon: ListOrdered, label: "Numbered list", prefix: "1. " },
  { icon: Quote, label: "Quote", prefix: "> " },
  { icon: Code, label: "Inline code", wrap: ["`", "`"] },
  { icon: SquareCode, label: "Code block", block: "```ts\n\n```" },
];

/**
 * Rich Markdown editor: formatting toolbar, keyboard shortcuts (⌘B / ⌘I / ⌘K), media
 * insertion and a live preview rendered with the same pipeline as the public blog.
 */
export function MarkdownEditor({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const apply = (action: Action) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = value.slice(s, e);
    let next = value;
    let cursor = e;
    if (action.wrap) {
      next = value.slice(0, s) + action.wrap[0] + (selected || action.label.toLowerCase()) + action.wrap[1] + value.slice(e);
      cursor = s + action.wrap[0].length + (selected || action.label.toLowerCase()).length;
    } else if (action.prefix) {
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      next = value.slice(0, lineStart) + action.prefix + value.slice(lineStart);
      cursor = e + action.prefix.length;
    } else if (action.block) {
      next = value.slice(0, s) + `\n${action.block}\n` + value.slice(e);
      cursor = s + action.block.indexOf("\n") + 2;
    }
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const insert = (text: string) => {
    const el = ref.current;
    const pos = el?.selectionStart ?? value.length;
    onChange(value.slice(0, pos) + text + value.slice(pos));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const map: Record<string, number> = { b: 0, i: 1, k: 4 };
    const idx = map[e.key.toLowerCase()];
    if (idx !== undefined) {
      e.preventDefault();
      apply(ACTIONS[idx]);
    }
  };

  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <Tabs defaultValue="write" className="rounded-2xl border border-line bg-white/[0.02]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-2">
        <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-0.5">
          {ACTIONS.map((a) => (
            <button key={a.label} type="button" onClick={() => apply(a)} className="rounded-lg p-2 text-muted hover:bg-white/10 hover:text-fg" aria-label={a.label} title={a.label}>
              <a.icon className="size-4" />
            </button>
          ))}
          <button type="button" onClick={() => setPickerOpen(true)} className="rounded-lg p-2 text-muted hover:bg-white/10 hover:text-fg" aria-label="Insert image" title="Insert image">
            <ImageIcon className="size-4" />
          </button>
        </div>
        <TabsList className="p-0.5">
          <TabsTrigger value="write" className="px-3 py-1 text-xs">
            Write
          </TabsTrigger>
          <TabsTrigger value="preview" className="px-3 py-1 text-xs">
            Preview
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="write">
        <textarea
          id={id}
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={18}
          className="block w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed outline-none"
          placeholder="Write in Markdown…"
        />
      </TabsContent>
      <TabsContent value="preview" className="max-h-[60dvh] overflow-y-auto p-5">
        <div className="prose-portfolio">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || "_Nothing to preview yet._"}</ReactMarkdown>
        </div>
      </TabsContent>
      <p className="border-t border-line px-4 py-2 text-right font-mono text-[11px] text-muted">
        {words} words · {Math.max(1, Math.round(words / 220))} min read
      </p>
      <MediaPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={(url) => insert(`\n![alt text](${url})\n`)} />
    </Tabs>
  );
}
