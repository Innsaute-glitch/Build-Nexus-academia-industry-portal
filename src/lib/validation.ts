import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const strongPasswordSchema = z.string().min(12).max(128)
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[0-9]/, "Include a number")
  .regex(/[^A-Za-z0-9]/, "Include a symbol");

export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) });
export const opportunitySchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(30).max(5000),
  type: z.enum(["INTERNSHIP", "LIVE_PROJECT", "APPRENTICESHIP", "ENTRY_LEVEL_JOB", "FACULTY_INTERNSHIP", "INDUSTRIAL_TRAINING", "CONSULTANCY", "RESEARCH_COLLABORATION"]),
  qualifications: z.string().trim().min(3).max(500),
  location: z.string().trim().min(2).max(100),
  workMode: z.enum(["REMOTE", "HYBRID", "ONSITE"]),
  compensation: z.string().trim().max(120).optional(),
  openings: z.coerce.number().int().min(1).max(1000),
  applicationDeadline: z.coerce.date().refine((date) => date.getTime() > Date.now(), "Deadline must be in the future"),
  skillIds: z.array(z.string().min(10)).min(1).max(20),
});
export const applicationSchema = z.object({
  opportunityPublicId: z.string().min(10).max(40),
  coverNote: z.string().trim().min(30).max(1500),
});
export const portfolioItemSchema = z.object({
  type: z.enum(["PROJECT", "CERTIFICATION", "INTERNSHIP", "ACHIEVEMENT", "PUBLICATION", "WORKSHOP", "SKILL", "RECOMMENDATION"]),
  title: z.string().trim().min(3).max(120),
  issuer: z.string().trim().max(120).optional(),
  description: z.string().trim().min(10).max(1000),
  externalUrl: z.union([z.literal(""), z.string().url().max(500).refine((value) => { const protocol = new URL(value).protocol; return protocol === "https:" || protocol === "http:"; }, "Use an http or https URL")]).optional(),
  visibilityPublic: z.coerce.boolean().default(false),
});
