import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AssessmentRunner } from "@/components/assessment-runner";
export default async function AssessmentStartPage() { await requireSession(["STUDENT"]); const assessment = await db.assessment.findFirst({ where: { active: true }, include: { questions: { orderBy: { position: "asc" }, select: { publicId: true, prompt: true, category: true, options: true } } } }); if (!assessment) notFound(); const questions = assessment.questions.map((question) => ({ ...question, options: Array.isArray(question.options) ? question.options.map(String) : [] })); return <main className="auth-page" style={{ display: "block", padding: 24 }}><div style={{ maxWidth: 720, margin: "6vh auto" }}><AssessmentRunner assessmentPublicId={assessment.publicId} questions={questions} /></div></main>; }
