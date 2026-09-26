import type { Experience, Profile, Project, Skill } from "@/types";
import type { TerminalData } from "./terminal";

/** Trims full records down to what the terminal needs, keeping the client payload small. */
export function toTerminalData({ profile, projects, skills, experiences }: { profile: Profile; projects: Project[]; skills: Skill[]; experiences: Experience[] }): TerminalData {
  return {
    profile,
    projects: projects.map(({ slug, title, tagline, category, tech }) => ({ slug, title, tagline, category, tech })),
    skills: skills.map(({ name, category, proficiency }) => ({ name, category, proficiency })),
    experiences: experiences.map(({ company, position, start_date, end_date }) => ({ company, position, start_date, end_date })),
  };
}
