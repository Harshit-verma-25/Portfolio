export const siteConfig = {
  name: "Harshit Verma",
  shortName: "HV",
  title: "Harshit Verma — Full Stack Software Developer",
  description:
    "Harshit Verma is a full stack software developer building fast, accessible, AI-native digital products with Next.js, Node.js, Supabase and cloud tooling.",
  keywords: ["Harshit Verma", "Full Stack Developer", "Next.js Developer", "React", "Node.js", "Supabase", "Three.js", "AI Engineer", "New Delhi", "Portfolio"],
  twitter: "",
  calendly: process.env.NEXT_PUBLIC_CALENDLY_URL ?? "",
};

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Work" },
  { href: "/experience", label: "Experience" },
  { href: "/blog", label: "Writing" },
  { href: "/contact", label: "Contact" },
] as const;
