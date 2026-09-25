import "server-only";

import { getAchievements, getCertifications, getExperiences, getMilestones, getProfile, getProjects, getSkills } from "@/lib/content";
import { formatRange } from "@/lib/utils";

/**
 * Builds the assistant's knowledge base from the same content the site renders, so the
 * assistant is always in sync with whatever is edited in /admin.
 */
export async function buildKnowledgeBase() {
  const [profile, projects, experiences, skills, achievements, certifications] = await Promise.all([
    getProfile(),
    getProjects(),
    getExperiences(),
    getSkills(),
    getAchievements(),
    getCertifications(),
  ]);

  const sections = [
    `# Profile
Name: ${profile.name}
Title: ${profile.title}
Location: ${profile.location}
Email: ${profile.email}
Available for work: ${profile.available_for_work ? "yes" : "no"}
Bio: ${profile.bio}
Socials: ${Object.entries(profile.socials).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join(", ")}
Now building: ${profile.now_building.role} at ${profile.now_building.company} — ${profile.now_building.summary} (${profile.now_building.items.join("; ")})`,

    `# Experience
${experiences.map((e) => `- ${e.position} at ${e.company} (${e.employment_type}, ${formatRange(e.start_date, e.end_date)}, ${e.location}). ${e.description} Achievements: ${e.achievements.join("; ")}. Tech: ${e.tech.join(", ")}.`).join("\n")}`,

    `# Education & journey
${getMilestones().map((m) => `- ${m.year}: ${m.title} — ${m.subtitle}. ${m.description}`).join("\n")}`,

    `# Skills (proficiency %, years)
${skills.map((s) => `- ${s.name} [${s.category}] ${s.proficiency}%, ${s.years}y`).join("\n")}`,

    `# Projects
${projects
  .map((p) => {
    const cs = p.case_study;
    return `## ${p.title} (${p.category}, ${p.year}) — /projects/${p.slug}
${p.tagline} ${p.description}
Tech: ${p.tech.join(", ")}${p.github_url ? `\nGitHub: ${p.github_url}` : ""}${p.live_url ? `\nLive: ${p.live_url}` : ""}${
      cs
        ? `\nProblem: ${cs.problem}\nArchitecture: ${cs.architecture}\nChallenges: ${cs.challenges.map((c) => `${c.title}: ${c.detail}`).join(" | ")}\nFeatures: ${cs.features.join("; ")}\nResults: ${cs.results.join("; ")}`
        : ""
    }`;
  })
  .join("\n\n")}`,

    `# Achievements
${achievements.map((a) => `- ${a.title}: ${a.description}`).join("\n")}${certifications.length ? `\n\n# Certifications\n${certifications.map((c) => `- ${c.title} — ${c.issuer}`).join("\n")}` : ""}`,
  ];

  return sections.join("\n\n");
}

export function systemPrompt(knowledge: string) {
  return `You are the AI assistant on Harshit Verma's portfolio website. Visitors — often recruiters, founders and fellow engineers — ask you about Harshit's work, skills, experience and availability.

Answer using only the knowledge base below. If something isn't covered, say you don't have that detail and suggest contacting Harshit via the contact page (/contact) or email. Never invent employers, dates, metrics or links.

Style: warm, confident and concise — usually 2–5 sentences or a short bulleted list. Speak about Harshit in the third person. Use Markdown sparingly (bold, short lists, links to site paths like /projects/quyl). If the visitor wants to hire or collaborate, point them to /contact.

<knowledge_base>
${knowledge}
</knowledge_base>`;
}
