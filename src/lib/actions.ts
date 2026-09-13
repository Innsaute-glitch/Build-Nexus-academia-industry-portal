"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { authenticate, destroySession, getSession, requireSession } from "@/lib/auth";
import { applicationSchema, loginSchema, opportunitySchema, portfolioItemSchema } from "@/lib/validation";
import { canApply, canReviewApplication, canReviewPortfolio, canTransition, scoreAssessment } from "@/lib/domain";
import { formDataObject } from "@/lib/result";

export async function loginAction(_state: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse(formDataObject(formData));
  if (!parsed.success) return { status: "error", message: "Enter a valid email and password.", fieldErrors: parsed.error.flatten().fieldErrors };
  const result = await authenticate(parsed.data.email, parsed.data.password);
  if (!result.ok) return { status: "error", message: result.error };
  redirect("/dashboard");
}

export async function demoLoginAction(formData: FormData) {
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_DEMO_LOGIN !== "true") redirect("/login?error=demo-disabled");
  const email = String(formData.get("email") || "");
  const password = process.env.DEMO_PASSWORD;
  if (!password) redirect("/login?error=demo-disabled");
  const result = await authenticate(email, password);
  if (!result.ok) redirect("/login?error=invalid");
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function applyAction(_state: unknown, formData: FormData) {
  const session = await requireSession(["STUDENT", "ACADEMICIAN"]);
  const parsed = applicationSchema.safeParse(formDataObject(formData));
  if (!parsed.success) return { status: "error", message: "Add a cover note of at least 30 characters." };
  const opportunity = await db.opportunity.findUnique({ where: { publicId: parsed.data.opportunityPublicId }, include: { skills: { include: { skill: true } } } });
  if (!opportunity || opportunity.status !== "PUBLISHED" || opportunity.applicationDeadline <= new Date()) return { status: "error", message: "This opportunity is no longer accepting applications." };
  if (!canApply(session.user.role, opportunity.type)) return { status: "error", message: "This opportunity is for a different participant group." };
  try {
    const created = await db.$transaction(async (tx) => {
      const activeCount = await tx.application.count({ where: { opportunityId: opportunity.id, status: { notIn: ["REJECTED", "WITHDRAWN"] } } });
      if (activeCount >= opportunity.openings) throw new Error("NO_OPENINGS");
      const application = await tx.application.create({ data: { opportunityId: opportunity.id, applicantId: session.user.id, coverNote: parsed.data.coverNote, status: "SUBMITTED", history: { create: { toStatus: "SUBMITTED", actorId: session.user.id, message: "Application submitted" } } } });
      await tx.auditLog.create({ data: { actorId: session.user.id, action: "APPLICATION_SUBMITTED", entityType: "Application", entityPublicId: application.publicId, outcome: "SUCCESS" } });
      return application;
    }, { isolationLevel: "Serializable" });
    revalidatePath("/opportunities"); revalidatePath("/applications"); revalidatePath("/dashboard");
    return { status: "success", message: "Application submitted.", applicationId: created.publicId };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return { status: "error", message: "You have already applied to this opportunity." };
    if (error instanceof Error && error.message === "NO_OPENINGS") return { status: "error", message: "This opportunity has reached its application capacity." };
    return { status: "error", message: "We could not submit the application. Try again." };
  }
}

export async function updateApplicationStatusAction(_state: unknown, formData: FormData) {
  const session = await requireSession(["INDUSTRY", "PLATFORM_ADMIN"]);
  const applicationPublicId = String(formData.get("applicationPublicId") || "");
  const toStatus = String(formData.get("toStatus") || "") as "UNDER_REVIEW" | "SHORTLISTED" | "INTERVIEW" | "SELECTED" | "REJECTED";
  const message = String(formData.get("message") || "").trim().slice(0, 500);
  const application = await db.application.findUnique({ where: { publicId: applicationPublicId }, include: { opportunity: true } });
  if (!application || (session.user.role === "INDUSTRY" && application.opportunity.organisationId !== session.user.organisationId)) return { status: "error", message: "Application not found." };
  if (!canReviewApplication(session.user.role) || !canTransition(application.status, toStatus)) return { status: "error", message: "That status change is not allowed from the current state." };
  const changed = await db.$transaction(async (tx) => {
    const updated = await tx.application.updateMany({ where: { id: application.id, version: application.version, status: application.status }, data: { status: toStatus, version: { increment: 1 } } });
    if (updated.count !== 1) throw new Error("STALE_WORKFLOW");
    await tx.applicationStatusHistory.create({ data: { applicationId: application.id, fromStatus: application.status, toStatus, actorId: session.user.id, message: message || undefined } });
    await tx.auditLog.create({ data: { actorId: session.user.id, action: "APPLICATION_STATUS_CHANGED", entityType: "Application", entityPublicId: application.publicId, outcome: "SUCCESS", metadata: { toStatus } } });
    return updated;
  }).catch(() => null);
  if (!changed) return { status: "error", message: "The application changed elsewhere. Refresh and try again." };
  revalidatePath("/applications"); revalidatePath("/dashboard");
  return { status: "success", message: "Application status updated." };
}

export async function createOpportunityAction(_state: unknown, formData: FormData) {
  const session = await requireSession(["INDUSTRY"]);
  if (!session.user.organisationId) return { status: "error", message: "Your account is not linked to an organisation." };
  const raw = formDataObject(formData);
  const parsed = opportunitySchema.safeParse({ ...raw, skillIds: String(raw.skillIds || "").split(",").filter(Boolean) });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message || "Check the opportunity details." };
  const knownSkills = await db.skill.count({ where: { id: { in: parsed.data.skillIds } } });
  if (knownSkills !== parsed.data.skillIds.length) return { status: "error", message: "One or more selected skills are invalid." };
  const opportunity = await db.$transaction(async (tx) => {
    const created = await tx.opportunity.create({ data: { title: parsed.data.title, description: parsed.data.description, type: parsed.data.type, qualifications: parsed.data.qualifications, location: parsed.data.location, workMode: parsed.data.workMode, compensation: parsed.data.compensation || undefined, openings: parsed.data.openings, applicationDeadline: parsed.data.applicationDeadline, organisationId: session.user.organisationId!, createdById: session.user.id, status: "PENDING_REVIEW", skills: { create: parsed.data.skillIds.map((skillId) => ({ skillId, required: true })) } } });
    await tx.auditLog.create({ data: { actorId: session.user.id, action: "OPPORTUNITY_CREATED", entityType: "Opportunity", entityPublicId: created.publicId, outcome: "SUCCESS" } });
    return created;
  });
  revalidatePath("/opportunities");
  return { status: "success", message: "Opportunity submitted for review.", opportunityId: opportunity.publicId };
}

export async function addPortfolioItemAction(_state: unknown, formData: FormData) {
  const session = await requireSession(["STUDENT", "ACADEMICIAN"]);
  const parsed = portfolioItemSchema.safeParse(formDataObject(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message || "Check the portfolio details." };
  const item = await db.portfolioItem.create({ data: { ...parsed.data, ownerId: session.user.id, verificationStatus: "UNVERIFIED", externalUrl: parsed.data.externalUrl || undefined } });
  await db.auditLog.create({ data: { actorId: session.user.id, action: "PORTFOLIO_ITEM_CREATED", entityType: "PortfolioItem", entityPublicId: item.publicId, outcome: "SUCCESS" } });
  revalidatePath("/portfolio"); revalidatePath("/dashboard");
  return { status: "success", message: "Portfolio item added. Request verification when ready." };
}

export async function requestVerificationAction(formData: FormData) {
  const session = await requireSession(["STUDENT", "ACADEMICIAN"]);
  const publicId = String(formData.get("portfolioItemPublicId") || "");
  const item = await db.portfolioItem.findUnique({ where: { publicId } });
  if (!item || item.ownerId !== session.user.id || item.verificationStatus !== "UNVERIFIED") redirect("/portfolio?status=not-allowed");
  await db.$transaction([db.portfolioItem.update({ where: { id: item.id }, data: { verificationStatus: "PENDING" } }), db.verificationRequest.create({ data: { portfolioItemId: item.id, requesterId: session.user.id } }), db.auditLog.create({ data: { actorId: session.user.id, action: "VERIFICATION_REQUESTED", entityType: "PortfolioItem", entityPublicId: item.publicId, outcome: "SUCCESS" } })]);
  revalidatePath("/portfolio");
  redirect("/portfolio?status=submitted");
}

export async function reviewVerificationAction(formData: FormData) {
  const session = await requireSession(["INSTITUTION_ADMIN", "PLATFORM_ADMIN"]);
  const requestPublicId = String(formData.get("verificationRequestPublicId") || "");
  const status = String(formData.get("status") || "") as "VERIFIED" | "REJECTED";
  if (!canReviewPortfolio(session.user.role) || !["VERIFIED", "REJECTED"].includes(status)) redirect("/verification?status=not-allowed");
  const request = await db.verificationRequest.findUnique({ where: { publicId: requestPublicId }, include: { portfolioItem: { include: { owner: true } } } });
  if (!request || request.status !== "PENDING") redirect("/verification?status=not-found");
  if (session.user.role === "INSTITUTION_ADMIN" && request.portfolioItem.owner.institutionId !== session.user.institutionId) redirect("/verification?status=not-found");
  const reviewed = await db.$transaction(async (tx) => {
    const changed = await tx.verificationRequest.updateMany({ where: { id: request.id, status: "PENDING" }, data: { status, reviewerId: session.user.id, reviewedAt: new Date() } });
    if (changed.count !== 1) return false;
    await tx.portfolioItem.update({ where: { id: request.portfolioItemId }, data: { verificationStatus: status } });
    await tx.auditLog.create({ data: { actorId: session.user.id, action: "VERIFICATION_REVIEWED", entityType: "VerificationRequest", entityPublicId: request.publicId, outcome: "SUCCESS", metadata: { status } } });
    return true;
  });
  if (!reviewed) redirect("/verification?status=stale");
  revalidatePath("/portfolio"); revalidatePath("/verification");
  redirect("/verification?status=saved");
}

export async function markNotificationReadAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const publicId = String(formData.get("notificationPublicId") || "");
  await db.notification.updateMany({ where: { publicId, userId: session.user.id }, data: { readAt: new Date() } });
  revalidatePath("/notifications");
  redirect("/notifications?status=read");
}

export async function submitAssessmentAction(_state: unknown, formData: FormData) {
  const session = await requireSession(["STUDENT"]);
  const assessmentPublicId = String(formData.get("assessmentPublicId") || "");
  const assessment = await db.assessment.findFirst({ where: { publicId: assessmentPublicId, active: true }, include: { questions: { orderBy: { position: "asc" } } } });
  if (!assessment) return { status: "error", message: "This assessment version is no longer available." };
  const answers = assessment.questions.map((question) => ({ question, answer: String(formData.get("answer_" + question.publicId) || ""), options: Array.isArray(question.options) ? question.options.map(String) : [] }));
  if (answers.some(({ answer, options }) => !answer || !options.includes(answer))) return { status: "error", message: "Answer every question using one of the available options." };
  const scored = answers.map(({ question, answer, options }) => {
    const score = question.type === "MULTIPLE_CHOICE" ? (answer === question.correctAnswer ? 100 : 0) : Math.round(options.indexOf(answer) / Math.max(1, options.length - 1) * 100);
    return { question, answer, score };
  });
  const result = scoreAssessment(scored.map(({ question, score }) => ({ category: question.category, score, maxScore: 100 })));
  const attempt = await db.$transaction(async (tx) => {
    const created = await tx.assessmentAttempt.create({ data: { assessmentId: assessment.id, userId: session.user.id, assessmentVersion: assessment.version, completedAt: new Date(), overallScore: result.overall, categoryScores: result.categories, strengths: result.strengths, gaps: result.gaps, answers: { create: scored.map(({ question, answer, score }) => ({ questionId: question.id, answer, score })) } } });
    await tx.auditLog.create({ data: { actorId: session.user.id, action: "ASSESSMENT_COMPLETED", entityType: "AssessmentAttempt", entityPublicId: created.publicId, outcome: "SUCCESS", metadata: { assessmentVersion: assessment.version } } });
    return created;
  });
  revalidatePath("/assessment"); revalidatePath("/dashboard");
  return { status: "success", message: "Assessment completed. Your new readiness profile is available.", attemptId: attempt.publicId };
}
