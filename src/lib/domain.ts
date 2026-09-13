import type { ApplicationStatus, Role } from "@prisma/client";

export type ScoreAnswer = { category: string; score: number; maxScore: number };

export function scoreAssessment(answers: ScoreAnswer[]) {
  if (answers.length === 0) return { overall: 0, categories: {}, strengths: [], gaps: [] };
  const totals: Record<string, { score: number; max: number }> = {};
  for (const answer of answers) {
    const current = totals[answer.category] ?? { score: 0, max: 0 };
    current.score += Math.max(0, Math.min(answer.score, answer.maxScore));
    current.max += answer.maxScore;
    totals[answer.category] = current;
  }
  const categories = Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, Math.round(value.score / value.max * 100)]));
  const overall = Math.round(Object.values(totals).reduce((sum, value) => sum + value.score, 0) / Object.values(totals).reduce((sum, value) => sum + value.max, 0) * 100);
  const strengths = Object.entries(categories).filter(([, value]) => value >= 70).map(([key]) => key);
  const gaps = Object.entries(categories).filter(([, value]) => value < 60).map(([key]) => key);
  return { overall, categories, strengths, gaps };
}

export type RecommendationInput = {
  requiredSkills: string[];
  preferredSkills: string[];
  userSkills: string[];
  desiredRoles: string[];
  title: string;
  workMode: string;
  preferredMode?: string;
  eligible: boolean;
};

export function scoreRecommendation(input: RecommendationInput) {
  if (!input.eligible) return { score: 0, factors: ["Eligibility requirements are not met"] };
  const owned = new Set(input.userSkills.map((value) => value.toLowerCase()));
  const requiredMatched = input.requiredSkills.filter((value) => owned.has(value.toLowerCase()));
  const preferredMatched = input.preferredSkills.filter((value) => owned.has(value.toLowerCase()));
  const skillBase = input.requiredSkills.length ? requiredMatched.length / input.requiredSkills.length : 1;
  const roleMatch = input.desiredRoles.some((role) => input.title.toLowerCase().includes(role.toLowerCase()));
  const modeMatch = !input.preferredMode || input.preferredMode === input.workMode;
  const score = Math.round(skillBase * 70 + (preferredMatched.length ? 10 : 0) + (roleMatch ? 15 : 0) + (modeMatch ? 5 : 0));
  const factors = [requiredMatched.length + " of " + input.requiredSkills.length + " required skills match"];
  if (preferredMatched.length) factors.push(preferredMatched.length + " preferred skill matches");
  if (roleMatch) factors.push("Aligned with a desired role");
  if (modeMatch) factors.push("Work mode fits your preference");
  return { score: Math.min(100, score), factors };
}

const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  DRAFT: ["SUBMITTED", "WITHDRAWN"],
  SUBMITTED: ["UNDER_REVIEW", "WITHDRAWN", "REJECTED"],
  UNDER_REVIEW: ["SHORTLISTED", "REJECTED", "WITHDRAWN"],
  SHORTLISTED: ["INTERVIEW", "SELECTED", "REJECTED", "WITHDRAWN"],
  INTERVIEW: ["SELECTED", "REJECTED", "WITHDRAWN"],
  SELECTED: ["ACCEPTED", "REJECTED", "WITHDRAWN"],
  ACCEPTED: ["COMPLETED", "WITHDRAWN"],
  REJECTED: [],
  WITHDRAWN: [],
  COMPLETED: [],
};

export function canTransition(from: ApplicationStatus, to: ApplicationStatus) {
  return transitions[from].includes(to);
}

export function canApply(role: Role, opportunityType: string) {
  const facultyTypes = new Set(["FACULTY_INTERNSHIP", "INDUSTRIAL_TRAINING", "CONSULTANCY", "RESEARCH_COLLABORATION"]);
  if (role === "ACADEMICIAN") return facultyTypes.has(opportunityType);
  if (role === "STUDENT") return !facultyTypes.has(opportunityType);
  return false;
}

export function canReviewApplication(role: Role) {
  return role === "INDUSTRY" || role === "PLATFORM_ADMIN";
}

export function canReviewPortfolio(role: Role) {
  return role === "INSTITUTION_ADMIN" || role === "PLATFORM_ADMIN";
}
