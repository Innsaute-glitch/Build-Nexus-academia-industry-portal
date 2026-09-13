import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Shell } from "@/components/shell";
import { OpportunityForm } from "@/components/forms";
export default async function NewOpportunityPage() { await requireSession(["INDUSTRY"]); const skills = await db.skill.findMany({ orderBy: { name: "asc" } }); return <Shell active="/opportunities"><div className="content"><div className="page-intro"><div><p className="eyebrow">Industry workspace</p><h1>Post an opportunity</h1><p>Describe the work clearly. New posts enter a review queue before they are visible to participants.</p></div></div><div className="panel panel-pad" style={{ maxWidth: 860 }}><OpportunityForm skillIds={skills.slice(0, 4).map((skill) => skill.id).join(",")} /></div></div></Shell>; }
