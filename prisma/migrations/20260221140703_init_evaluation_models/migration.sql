-- AlterTable
ALTER TABLE "runs" ADD COLUMN     "evaluated_at" TIMESTAMPTZ,
ADD COLUMN     "evaluation" JSONB,
ADD COLUMN     "is_locked" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "run_question_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "run_id" UUID NOT NULL,
    "question_index" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL,
    "per_skill" JSONB NOT NULL DEFAULT '{}',
    "feedback" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "run_question_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_skill_claims" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agent_fk_id" UUID NOT NULL,
    "owner_user_id" UUID NOT NULL,
    "skill_id" TEXT NOT NULL,
    "proficiency_claim" TEXT NOT NULL DEFAULT 'verified',
    "run_id" UUID NOT NULL,
    "evidence" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL,
    "decided_by" TEXT NOT NULL DEFAULT 'ai',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_skill_claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_decisions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "claim_id" UUID NOT NULL,
    "source" TEXT NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "reasoning" TEXT,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "run_id" UUID NOT NULL,
    "agent_fk_id" UUID NOT NULL,
    "agent_name" TEXT NOT NULL,
    "template_name" TEXT,
    "score" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "issued_by" UUID,
    "data_hash" TEXT NOT NULL,
    "snapshot" JSONB,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "run_question_scores_run_id_idx" ON "run_question_scores"("run_id");

-- CreateIndex
CREATE UNIQUE INDEX "run_question_scores_run_id_question_index_key" ON "run_question_scores"("run_id", "question_index");

-- CreateIndex
CREATE INDEX "agent_skill_claims_agent_fk_id_idx" ON "agent_skill_claims"("agent_fk_id");

-- CreateIndex
CREATE INDEX "agent_skill_claims_owner_user_id_idx" ON "agent_skill_claims"("owner_user_id");

-- CreateIndex
CREATE INDEX "agent_skill_claims_status_idx" ON "agent_skill_claims"("status");

-- CreateIndex
CREATE UNIQUE INDEX "agent_skill_claims_agent_fk_id_owner_user_id_skill_id_key" ON "agent_skill_claims"("agent_fk_id", "owner_user_id", "skill_id");

-- CreateIndex
CREATE INDEX "claim_decisions_claim_id_idx" ON "claim_decisions"("claim_id");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_run_id_key" ON "certificates"("run_id");

-- CreateIndex
CREATE INDEX "certificates_agent_fk_id_idx" ON "certificates"("agent_fk_id");

-- CreateIndex
CREATE INDEX "certificates_status_idx" ON "certificates"("status");

-- AddForeignKey
ALTER TABLE "run_question_scores" ADD CONSTRAINT "run_question_scores_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_skill_claims" ADD CONSTRAINT "agent_skill_claims_agent_fk_id_fkey" FOREIGN KEY ("agent_fk_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_skill_claims" ADD CONSTRAINT "agent_skill_claims_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_skill_claims" ADD CONSTRAINT "agent_skill_claims_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_decisions" ADD CONSTRAINT "claim_decisions_claim_id_fkey" FOREIGN KEY ("claim_id") REFERENCES "agent_skill_claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_agent_fk_id_fkey" FOREIGN KEY ("agent_fk_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_issued_by_fkey" FOREIGN KEY ("issued_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
