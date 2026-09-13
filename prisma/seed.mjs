import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg(process.env.DATABASE_URL);
const db = new PrismaClient({ adapter });
if (process.env.ALLOW_DESTRUCTIVE_SEED !== "true" || process.env.NODE_ENV === "production") {
  throw new Error("Refusing destructive demo seed. Set ALLOW_DESTRUCTIVE_SEED=true outside production.");
}
const demoPassword = process.env.DEMO_PASSWORD;
if (!demoPassword) throw new Error("DEMO_PASSWORD is required for the development seed.");
const passwordHash = await hash(demoPassword, { memoryCost: 19456, timeCost: 2, parallelism: 1 });

async function main() {
  await db.applicationStatusHistory.deleteMany();
  await db.application.deleteMany();
  await db.savedOpportunity.deleteMany();
  await db.opportunitySkill.deleteMany();
  await db.opportunity.deleteMany();
  await db.verificationRequest.deleteMany();
  await db.portfolioItem.deleteMany();
  await db.assessmentAnswer.deleteMany();
  await db.assessmentAttempt.deleteMany();
  await db.assessmentQuestion.deleteMany();
  await db.assessment.deleteMany();
  await db.learningProgramme.deleteMany();
  await db.notification.deleteMany();
  await db.auditLog.deleteMany();
  await db.authAttempt.deleteMany();
  await db.session.deleteMany();
  await db.userSkill.deleteMany();
  await db.user.deleteMany();
  await db.skill.deleteMany();
  await db.skillCategory.deleteMany();
  await db.programme.deleteMany();
  await db.department.deleteMany();
  await db.organisation.deleteMany();
  await db.institution.deleteMany();

  const institute = await db.institution.create({ data: { name: "Northbridge Institute of Technology", code: "NIT-01", city: "Bengaluru" } });
  const computing = await db.department.create({ data: { name: "Computing & Information Systems", institutionId: institute.id } });
  const design = await db.department.create({ data: { name: "Design & Innovation", institutionId: institute.id } });
  await db.programme.create({ data: { name: "B.Tech Computer Science", level: "Undergraduate", departmentId: computing.id } });
  await db.programme.create({ data: { name: "M.Des Interaction Design", level: "Postgraduate", departmentId: design.id } });
  const vertex = await db.organisation.create({ data: { name: "Vertex Labs", sector: "Technology", city: "Bengaluru", verifiedAt: new Date() } });
  const terra = await db.organisation.create({ data: { name: "Terra Mobility", sector: "Mobility & Energy", city: "Pune", verifiedAt: new Date() } });
  const lumina = await db.organisation.create({ data: { name: "Lumina Health Systems", sector: "Health Technology", city: "Hyderabad", verifiedAt: new Date() } });

  const student = await db.user.create({ data: { email: "student@demo.academia", passwordHash, name: "Aarav Mehta", role: "STUDENT", institutionId: institute.id, headline: "Computer Science undergraduate · Product-minded builder", location: "Bengaluru", careerInterests: ["Product engineering", "Data platforms"], desiredRoles: ["Product Engineer", "Frontend Engineer"] } });
  const academician = await db.user.create({ data: { email: "faculty@demo.academia", passwordHash, name: "Dr. Mira Rao", role: "ACADEMICIAN", institutionId: institute.id, headline: "Associate Professor · Human-centred systems", location: "Bengaluru", careerInterests: ["Applied research", "Industry training"], desiredRoles: ["Research collaboration", "Faculty internship"] } });
  const industry = await db.user.create({ data: { email: "industry@demo.academia", passwordHash, name: "Rohan Kapoor", role: "INDUSTRY", organisationId: vertex.id, headline: "Talent & university partnerships · Vertex Labs", location: "Bengaluru" } });
  const institutionAdmin = await db.user.create({ data: { email: "admin@demo.academia", passwordHash, name: "Nisha Thomas", role: "INSTITUTION_ADMIN", institutionId: institute.id, headline: "Institution partnerships administrator", location: "Bengaluru" } });
  await db.user.create({ data: { email: "platform@demo.academia", passwordHash, name: "Platform Operations", role: "PLATFORM_ADMIN", headline: "Portal operations", location: "India" } });

  const categoryData = [
    { name: "Engineering", skills: ["TypeScript", "React", "Python", "SQL", "API Design"] },
    { name: "Data & AI", skills: ["Data Analysis", "Machine Learning", "Data Visualisation"] },
    { name: "Professional", skills: ["Communication", "Problem Solving", "Collaboration", "Product Thinking"] },
  ];
  const skillMap = new Map();
  for (const category of categoryData) {
    const createdCategory = await db.skillCategory.create({ data: { name: category.name } });
    for (const name of category.skills) skillMap.set(name, await db.skill.create({ data: { name, categoryId: createdCategory.id } }));
  }

  await db.userSkill.createMany({ data: [
    { userId: student.id, skillId: skillMap.get("TypeScript").id, level: 3, source: "VERIFIED", verifiedAt: new Date("2026-08-18") },
    { userId: student.id, skillId: skillMap.get("React").id, level: 3, source: "ASSESSMENT" },
    { userId: student.id, skillId: skillMap.get("SQL").id, level: 2, source: "ASSESSMENT" },
    { userId: student.id, skillId: skillMap.get("Product Thinking").id, level: 3, source: "SELF_REPORTED" },
    { userId: student.id, skillId: skillMap.get("Collaboration").id, level: 3, source: "ASSESSMENT" },
    { userId: academician.id, skillId: skillMap.get("Data Analysis").id, level: 4, source: "VERIFIED", verifiedAt: new Date("2026-07-12") },
    { userId: academician.id, skillId: skillMap.get("Communication").id, level: 4, source: "VERIFIED", verifiedAt: new Date("2026-07-12") },
  ] });

  const makeOpportunity = async (data, skillNames, createdById, organisationId) => {
    const opp = await db.opportunity.create({ data: { ...data, createdById, organisationId, status: "PUBLISHED", applicationDeadline: new Date(data.applicationDeadline) } });
    await db.opportunitySkill.createMany({ data: skillNames.map((name, index) => ({ opportunityId: opp.id, skillId: skillMap.get(name).id, required: index < Math.max(1, skillNames.length - 1), minimumLevel: index === 0 ? 3 : 2 })) });
    return opp;
  };
  const productInternship = await makeOpportunity({ title: "Product Engineering Intern", description: "Join a small platform team shipping accessible workflow tools for university and industry partners. You will work across discovery, implementation and measurement.", type: "INTERNSHIP", qualifications: "B.Tech / B.E. in Computer Science or a related programme", location: "Bengaluru or remote", workMode: "HYBRID", startDate: new Date("2026-10-12"), endDate: new Date("2027-01-09"), compensation: "₹25,000 / month", openings: 3, applicationDeadline: "2026-09-30" }, ["TypeScript", "React", "SQL", "Product Thinking", "Communication"], industry.id, vertex.id);
  await makeOpportunity({ title: "Data Platform Apprentice", description: "Build reliable data quality checks and lightweight analytics pipelines alongside Terra Mobility's operations data team.", type: "APPRENTICESHIP", qualifications: "Final-year student or recent graduate in CS, IT, Statistics or Engineering", location: "Pune", workMode: "ONSITE", startDate: new Date("2026-10-20"), endDate: new Date("2027-01-20"), compensation: "₹22,000 / month", openings: 2, applicationDeadline: "2026-10-05" }, ["Python", "SQL", "Data Analysis", "Problem Solving"], industry.id, terra.id);
  await makeOpportunity({ title: "Health Systems Research Collaboration", description: "Collaborate with Lumina Health Systems on a six-month applied research project exploring explainable triage workflows and human factors.", type: "RESEARCH_COLLABORATION", qualifications: "Faculty member or research scholar with relevant HCI, health informatics or systems background", location: "Hyderabad + remote", workMode: "HYBRID", startDate: new Date("2026-11-01"), endDate: new Date("2027-04-30"), compensation: "Sponsored research engagement", openings: 1, applicationDeadline: "2026-10-18" }, ["Data Analysis", "Communication", "Product Thinking"], industry.id, lumina.id);
  await makeOpportunity({ title: "Faculty Industry Immersion: Responsible AI", description: "A two-week immersion for educators to observe production ML governance, evaluation and responsible deployment practices.", type: "FACULTY_INTERNSHIP", qualifications: "Faculty member with an interest in applied AI or digital systems", location: "Bengaluru", workMode: "ONSITE", startDate: new Date("2026-11-09"), endDate: new Date("2026-11-20"), compensation: "Travel support available", openings: 4, applicationDeadline: "2026-10-28" }, ["Machine Learning", "Communication", "Problem Solving"], industry.id, vertex.id);

  await db.portfolioItem.createMany({ data: [
    { ownerId: student.id, type: "PROJECT", title: "Civic Signals", issuer: "Northbridge Studio", description: "A TypeScript data explorer that turns public transport reports into prioritised service insights.", externalUrl: "https://example.com/civic-signals", visibilityPublic: true, verificationStatus: "VERIFIED" },
    { ownerId: student.id, type: "CERTIFICATION", title: "SQL for Product Analytics", issuer: "DataCamp (demo record)", description: "Query design, cohort analysis and decision-ready metrics.", visibilityPublic: true, verificationStatus: "PENDING" },
    { ownerId: student.id, type: "ACHIEVEMENT", title: "Campus Innovation Challenge finalist", issuer: "Northbridge Institute of Technology", description: "Recognised for a low-bandwidth student services prototype.", visibilityPublic: false, verificationStatus: "UNVERIFIED" },
    { ownerId: academician.id, type: "PUBLICATION", title: "Designing for accountable campus AI", issuer: "Journal of Applied Systems", description: "A fictional publication record used for product demonstration.", visibilityPublic: true, verificationStatus: "VERIFIED" },
  ] });
  const assessment = await db.assessment.create({ data: { title: "Career readiness baseline", description: "A short, versioned check across technical and professional capabilities.", version: 1, questions: { create: [
    { prompt: "How comfortable are you designing a typed API contract?", type: "LIKERT", category: "Technical foundations", options: ["Learning", "Working knowledge", "Confident", "Can mentor"], correctAnswer: "3", weight: 1, position: 1 },
    { prompt: "Which practice best reduces duplicate records in an application workflow?", type: "MULTIPLE_CHOICE", category: "Technical foundations", options: ["Client-only checks", "A database uniqueness constraint", "A longer form", "A toast message"], correctAnswer: "A database uniqueness constraint", weight: 1, position: 2 },
    { prompt: "I can explain a complex trade-off to a non-technical stakeholder.", type: "SELF_REPORT", category: "Communication", options: ["Not yet", "Sometimes", "Usually", "Consistently"], correctAnswer: "3", weight: 1, position: 3 },
    { prompt: "When a team disagrees, I help make the decision and next step explicit.", type: "SELF_REPORT", category: "Collaboration", options: ["Not yet", "Sometimes", "Usually", "Consistently"], correctAnswer: "3", weight: 1, position: 4 },
  ] } } });
  const questions = await db.assessmentQuestion.findMany({ where: { assessmentId: assessment.id }, orderBy: { position: "asc" } });
  const attempt = await db.assessmentAttempt.create({ data: { assessmentId: assessment.id, userId: student.id, assessmentVersion: 1, completedAt: new Date("2026-09-09"), overallScore: 72, categoryScores: { "Technical foundations": 75, Communication: 68, Collaboration: 73 }, strengths: ["Technical foundations", "Collaboration"], gaps: ["Communication"] } });
  await db.assessmentAnswer.createMany({ data: questions.map((question, index) => ({ attemptId: attempt.id, questionId: question.id, answer: index === 1 ? "A database uniqueness constraint" : "3", score: index === 1 ? 100 : 70 })) });

  await db.learningProgramme.createMany({ data: [
    { title: "Production React patterns", provider: "Vertex Academy", category: "Engineering", description: "A practical cohort on state, accessibility and resilient UI composition.", mode: "REMOTE", duration: "4 weeks", eligibility: "Students with basic React experience" },
    { title: "Communicating technical decisions", provider: "Northbridge Career Studio", category: "Professional", description: "Practise concise written and spoken decision records with peer feedback.", mode: "HYBRID", duration: "2 weeks", eligibility: "Open to students and faculty" },
    { title: "SQL for operations", provider: "Terra Mobility", category: "Data & AI", description: "Work through real-shaped operational questions using safe query patterns.", mode: "ONSITE", duration: "3 weeks", eligibility: "Final-year students" },
  ] });
  await db.application.create({ data: { opportunityId: productInternship.id, applicantId: student.id, status: "SHORTLISTED", coverNote: "I enjoy working from ambiguous problem to a useful, tested product. My recent Civic Signals project strengthened my TypeScript, SQL and product discovery practice.", history: { create: [
    { toStatus: "SUBMITTED", actorId: student.id, message: "Application submitted" },
    { fromStatus: "SUBMITTED", toStatus: "UNDER_REVIEW", actorId: industry.id, message: "Application is being reviewed by the Vertex Labs team" },
    { fromStatus: "UNDER_REVIEW", toStatus: "SHORTLISTED", actorId: industry.id, message: "Shortlisted for a first conversation" },
  ] } } });
  await db.notification.createMany({ data: [
    { userId: student.id, title: "You have been shortlisted", body: "Vertex Labs moved your Product Engineering Intern application to shortlisted.", createdAt: new Date("2026-09-10") },
    { userId: student.id, title: "Close one skill gap", body: "A short communication programme is aligned with your latest assessment.", createdAt: new Date("2026-09-09") },
    { userId: industry.id, title: "New candidate activity", body: "Aarav Mehta is now shortlisted for Product Engineering Intern.", createdAt: new Date("2026-09-10") },
    { userId: institutionAdmin.id, title: "Verification queue updated", body: "Three portfolio records need review this week.", createdAt: new Date("2026-09-11") },
  ] });
  await db.auditLog.create({ data: { actorId: student.id, action: "SEED_DEMO_DATA", entityType: "System", outcome: "SUCCESS", metadata: { clearlyFictional: true } } });
  console.log(JSON.stringify({ student: student.email, industry: industry.email, applications: 1 }));
}

try { await main(); } finally { await db.$disconnect(); }
