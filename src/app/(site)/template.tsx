"use client";

import { m } from "framer-motion";

/** Page transition — re-mounts on every navigation within the site. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <m.div initial={{ opacity: 0, y: 16, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </m.div>
  );
}
