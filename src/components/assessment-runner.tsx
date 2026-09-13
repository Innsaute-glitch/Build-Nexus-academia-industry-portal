"use client";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitAssessmentAction } from "@/lib/actions";
import { initialActionState } from "@/lib/result";

type Question = { publicId: string; prompt: string; category: string; options: string[] };
export function AssessmentRunner({ assessmentPublicId, questions }: { assessmentPublicId: string; questions: Question[] }) {
  const router = useRouter(); const [step, setStep] = useState(0); const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, action, pending] = useActionState(submitAssessmentAction, initialActionState); const q = questions[step];
  if (!q) return <div className="panel panel-pad"><div className="empty">No active assessment questions are available.</div></div>;
  if (state.status === "success") return <div className="panel panel-pad"><p className="eyebrow">Assessment complete</p><h1>Your result is ready to review.</h1><div className="alert alert-success">{state.message}</div><button className="btn btn-primary" onClick={() => router.push("/assessment")}>View assessment hub</button></div>;
  function choose(value: string) { const next = { ...answers, [q.publicId]: value }; setAnswers(next); if (step < questions.length - 1) setStep(step + 1); }
  return <><Link href="/assessment" className="text-link">← Back to assessment</Link><form action={action} className="panel panel-pad" style={{ marginTop: 18 }}><input type="hidden" name="assessmentPublicId" value={assessmentPublicId} />{questions.map((question) => <input key={question.publicId} type="hidden" name={"answer_" + question.publicId} value={answers[question.publicId] || ""} />)}<div className="inline" style={{ justifyContent: "space-between" }}><p className="eyebrow">Question {step + 1} of {questions.length}</p><span className="pill pill-teal">{q.category}</span></div><div className="progress" style={{ margin: "8px 0 30px" }}><span style={{ width: ((step + 1) / questions.length * 100) + "%" }} /></div><h1 style={{ fontSize: 24 }}>{q.prompt}</h1><p style={{ color: "var(--muted)", fontSize: 12 }}>Choose the answer that best reflects your current experience.</p><div className="grid" style={{ marginTop: 28 }}>{q.options.map((option) => <button key={option} type="button" className={answers[q.publicId] === option ? "btn btn-primary" : "btn btn-secondary"} style={{ justifyContent: "flex-start", minHeight: 52 }} onClick={() => choose(option)}>{option}</button>)}</div>{step > 0 && <button className="btn btn-secondary" type="button" style={{ marginTop: 20, marginRight: 8 }} onClick={() => setStep(step - 1)}>Previous</button>}{step === questions.length - 1 && answers[q.publicId] && <button className="btn btn-primary" style={{ marginTop: 20 }} type="submit" disabled={pending}>{pending ? "Scoring securely…" : "Submit assessment"}</button>}{state.message && state.status === "error" ? <div className="alert" style={{ marginTop: 12 }}>{state.message}</div> : null}</form></>;
}
