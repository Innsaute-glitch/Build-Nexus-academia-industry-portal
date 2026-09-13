-- CreateEnum
CREATE TYPE "SkillEvidenceSource" AS ENUM ('SELF_REPORTED', 'ASSESSMENT', 'VERIFIED');

-- CreateTable
CREATE TABLE "UserSkill" (
    "userId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "level" INTEGER NOT NULL,
    "source" "SkillEvidenceSource" NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSkill_pkey" PRIMARY KEY ("userId","skillId","source")
);

-- CreateIndex
CREATE INDEX "UserSkill_skillId_source_idx" ON "UserSkill"("skillId", "source");

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkill" ADD CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
