import { z } from "zod";

export const BUDGETS = ["< ₹50k", "₹50k – ₹2L", "₹2L – ₹5L", "₹5L+", "Full-time role", "Not sure yet"] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.email("Please enter a valid email").max(200),
  subject: z.string().trim().min(2, "Add a short subject").max(150),
  budget: z.enum(BUDGETS).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell me a bit more (10+ characters)").max(5000),
  // Honeypot — real users never see or fill this.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
