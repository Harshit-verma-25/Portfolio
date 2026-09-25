import type { Metadata } from "next";
import { Contact } from "@/components/sections/contact";
import { Aurora } from "@/components/layout/aurora";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/json-ld";
import { getProfile } from "@/lib/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact",
  description: "Hire Harshit Verma or start a project — send a message, book a call or connect on social.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const profile = await getProfile();
  return (
    <div className="relative overflow-hidden pt-24">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <Aurora intensity={0.5} />
      <Contact profile={profile} headingLevel="h1" />
    </div>
  );
}
