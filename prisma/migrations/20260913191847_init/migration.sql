-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ACADEMICIAN', 'INDUSTRY', 'INSTITUTION_ADMIN', 'PLATFORM_ADMIN');

-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('INTERNSHIP', 'LIVE_PROJECT', 'APPRENTICESHIP', 'ENTRY_LEVEL_JOB', 'FACULTY_INTERNSHIP', 'INDUSTRIAL_TRAINING', 'CONSULTANCY', 'RESEARCH_COLLABORATION');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED', 'WITHDRAWN', 'ACCEPTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PortfolioItemType" AS ENUM ('PROJECT', 'CERTIFICATION', 'INTERNSHIP', 'ACHIEVEMENT', 'PUBLICATION', 'WORKSHOP', 'SKILL', 'RECOMMENDATION');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'LIKERT', 'SELF_REPORT');

-- CreateEnum
CREATE TYPE "DocumentAccess" AS ENUM ('PRIVATE', 'APPLICATION', 'INSTITUTION', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'CLEAN', 'REJECTED');

-- CreateTable
CREATE TABLE "Institution" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institutionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Programme" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "departmentId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Programme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organisation" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "emailVerifiedAt" TIMESTAMP(3),
    "institutionId" UUID,
    "organisationId" UUID,
    "headline" TEXT,
    "location" TEXT,
    "careerInterests" TEXT[],
    "desiredRoles" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "ipHash" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthAttempt" (
    "id" UUID NOT NULL,
    "keyHash" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillCategory" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SkillCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentQuestion" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "assessmentId" UUID NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "category" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctAnswer" TEXT,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL,

    CONSTRAINT "AssessmentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentAttempt" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "assessmentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "assessmentVersion" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "overallScore" INTEGER,
    "categoryScores" JSONB,
    "strengths" TEXT[],
    "gaps" TEXT[],

    CONSTRAINT "AssessmentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentAnswer" (
    "id" UUID NOT NULL,
    "attemptId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "answer" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "AssessmentAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "organisationId" UUID NOT NULL,
    "createdById" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "OpportunityType" NOT NULL,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'DRAFT',
    "qualifications" TEXT NOT NULL,
    "minExperienceMonths" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT NOT NULL,
    "workMode" "WorkMode" NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "compensation" TEXT,
    "openings" INTEGER NOT NULL,
    "applicationDeadline" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpportunitySkill" (
    "opportunityId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "minimumLevel" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "OpportunitySkill_pkey" PRIMARY KEY ("opportunityId","skillId")
);

-- CreateTable
CREATE TABLE "SavedOpportunity" (
    "userId" UUID NOT NULL,
    "opportunityId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedOpportunity_pkey" PRIMARY KEY ("userId","opportunityId")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "opportunityId" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "coverNote" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "withdrawnAt" TIMESTAMP(3),

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationStatusHistory" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "fromStatus" "ApplicationStatus",
    "toStatus" "ApplicationStatus" NOT NULL,
    "actorId" UUID NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningProgramme" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mode" "WorkMode" NOT NULL,
    "duration" TEXT NOT NULL,
    "eligibility" TEXT NOT NULL,
    "url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningProgramme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "type" "PortfolioItemType" NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "description" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3),
    "externalUrl" TEXT,
    "visibilityPublic" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "portfolioItemId" UUID NOT NULL,
    "requesterId" UUID NOT NULL,
    "reviewerId" UUID,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "VerificationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "scanStatus" "ScanStatus" NOT NULL DEFAULT 'PENDING',
    "access" "DocumentAccess" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternshipPlacement" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "applicationId" UUID NOT NULL,
    "opportunityId" UUID NOT NULL,
    "participantId" UUID NOT NULL,
    "mentorId" UUID,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "attendancePercent" INTEGER,
    "finalEvaluation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternshipPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "placementId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "progressNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "placementId" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "privateToParticipant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "publicId" TEXT NOT NULL,
    "actorId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityPublicId" TEXT,
    "outcome" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Institution_publicId_key" ON "Institution"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_code_key" ON "Institution"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Department_publicId_key" ON "Department"("publicId");

-- CreateIndex
CREATE INDEX "Department_institutionId_idx" ON "Department"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_institutionId_name_key" ON "Department"("institutionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Programme_publicId_key" ON "Programme"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Programme_departmentId_name_key" ON "Programme"("departmentId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_publicId_key" ON "Organisation"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "User_publicId_key" ON "User"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_institutionId_role_idx" ON "User"("institutionId", "role");

-- CreateIndex
CREATE INDEX "User_organisationId_role_idx" ON "User"("organisationId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "AuthAttempt_keyHash_createdAt_idx" ON "AuthAttempt"("keyHash", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SkillCategory_publicId_key" ON "SkillCategory"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillCategory_name_key" ON "SkillCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_publicId_key" ON "Skill"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "Skill_categoryId_idx" ON "Skill"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_publicId_key" ON "Assessment"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_title_version_key" ON "Assessment"("title", "version");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentQuestion_publicId_key" ON "AssessmentQuestion"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentQuestion_assessmentId_position_key" ON "AssessmentQuestion"("assessmentId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAttempt_publicId_key" ON "AssessmentAttempt"("publicId");

-- CreateIndex
CREATE INDEX "AssessmentAttempt_userId_completedAt_idx" ON "AssessmentAttempt"("userId", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAnswer_attemptId_questionId_key" ON "AssessmentAnswer"("attemptId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_publicId_key" ON "Opportunity"("publicId");

-- CreateIndex
CREATE INDEX "Opportunity_status_applicationDeadline_idx" ON "Opportunity"("status", "applicationDeadline");

-- CreateIndex
CREATE INDEX "Opportunity_organisationId_status_idx" ON "Opportunity"("organisationId", "status");

-- CreateIndex
CREATE INDEX "Opportunity_type_workMode_idx" ON "Opportunity"("type", "workMode");

-- CreateIndex
CREATE INDEX "OpportunitySkill_skillId_idx" ON "OpportunitySkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_publicId_key" ON "Application"("publicId");

-- CreateIndex
CREATE INDEX "Application_applicantId_status_idx" ON "Application"("applicantId", "status");

-- CreateIndex
CREATE INDEX "Application_opportunityId_status_idx" ON "Application"("opportunityId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_opportunityId_applicantId_key" ON "Application"("opportunityId", "applicantId");

-- CreateIndex
CREATE INDEX "ApplicationStatusHistory_applicationId_createdAt_idx" ON "ApplicationStatusHistory"("applicationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LearningProgramme_publicId_key" ON "LearningProgramme"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioItem_publicId_key" ON "PortfolioItem"("publicId");

-- CreateIndex
CREATE INDEX "PortfolioItem_ownerId_type_idx" ON "PortfolioItem"("ownerId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_publicId_key" ON "VerificationRequest"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_portfolioItemId_key" ON "VerificationRequest"("portfolioItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_publicId_key" ON "Document"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_storageKey_key" ON "Document"("storageKey");

-- CreateIndex
CREATE INDEX "Document_ownerId_access_idx" ON "Document"("ownerId", "access");

-- CreateIndex
CREATE UNIQUE INDEX "InternshipPlacement_publicId_key" ON "InternshipPlacement"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "InternshipPlacement_applicationId_key" ON "InternshipPlacement"("applicationId");

-- CreateIndex
CREATE INDEX "InternshipPlacement_participantId_idx" ON "InternshipPlacement"("participantId");

-- CreateIndex
CREATE INDEX "InternshipPlacement_mentorId_idx" ON "InternshipPlacement"("mentorId");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_publicId_key" ON "Milestone"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_publicId_key" ON "Feedback"("publicId");

-- CreateIndex
CREATE INDEX "Feedback_placementId_createdAt_idx" ON "Feedback"("placementId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_publicId_key" ON "Notification"("publicId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "Notification"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_publicId_key" ON "AuditLog"("publicId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Programme" ADD CONSTRAINT "Programme_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SkillCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentQuestion" ADD CONSTRAINT "AssessmentQuestion_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAttempt" ADD CONSTRAINT "AssessmentAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAnswer" ADD CONSTRAINT "AssessmentAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "AssessmentAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAnswer" ADD CONSTRAINT "AssessmentAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "AssessmentQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunitySkill" ADD CONSTRAINT "OpportunitySkill_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunitySkill" ADD CONSTRAINT "OpportunitySkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedOpportunity" ADD CONSTRAINT "SavedOpportunity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedOpportunity" ADD CONSTRAINT "SavedOpportunity_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioItem" ADD CONSTRAINT "PortfolioItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_portfolioItemId_fkey" FOREIGN KEY ("portfolioItemId") REFERENCES "PortfolioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationRequest" ADD CONSTRAINT "VerificationRequest_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipPlacement" ADD CONSTRAINT "InternshipPlacement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipPlacement" ADD CONSTRAINT "InternshipPlacement_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipPlacement" ADD CONSTRAINT "InternshipPlacement_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternshipPlacement" ADD CONSTRAINT "InternshipPlacement_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "InternshipPlacement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_placementId_fkey" FOREIGN KEY ("placementId") REFERENCES "InternshipPlacement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
