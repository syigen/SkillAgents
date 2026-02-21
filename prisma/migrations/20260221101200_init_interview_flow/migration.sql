/*
  Warnings:

  - You are about to drop the column `type` on the `templates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "templates" DROP COLUMN "type",
ALTER COLUMN "status" SET DEFAULT 'draft';

-- CreateTable
CREATE TABLE "agent_invites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_user_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "max_uses" INTEGER,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "agent_id" TEXT NOT NULL,
    "owner_user_id" UUID,
    "client_request_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "fingerprint" TEXT NOT NULL DEFAULT '',
    "fingerprint_method" TEXT NOT NULL DEFAULT 'none',
    "tool_access" JSONB NOT NULL DEFAULT '[]',
    "skill_md_hash" TEXT NOT NULL DEFAULT '',
    "workspace_files" TEXT,
    "api_key_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_user_id" UUID NOT NULL,
    "agent_fk_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "invite_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'running',
    "score" INTEGER,
    "questions" JSONB NOT NULL DEFAULT '[]',
    "question_source" TEXT NOT NULL DEFAULT 'static',
    "template_name" TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "run_steps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "run_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "run_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agent_invites_token_hash_key" ON "agent_invites"("token_hash");

-- CreateIndex
CREATE INDEX "agent_invites_owner_user_id_idx" ON "agent_invites"("owner_user_id");

-- CreateIndex
CREATE INDEX "agent_invites_template_id_idx" ON "agent_invites"("template_id");

-- CreateIndex
CREATE INDEX "agent_invites_status_idx" ON "agent_invites"("status");

-- CreateIndex
CREATE UNIQUE INDEX "agents_agent_id_key" ON "agents"("agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_agent_owner_clientreq" ON "agents"("owner_user_id", "client_request_id");

-- CreateIndex
CREATE INDEX "runs_owner_user_id_idx" ON "runs"("owner_user_id");

-- CreateIndex
CREATE INDEX "runs_agent_fk_id_idx" ON "runs"("agent_fk_id");

-- CreateIndex
CREATE INDEX "runs_template_id_idx" ON "runs"("template_id");

-- CreateIndex
CREATE INDEX "run_steps_run_id_idx" ON "run_steps"("run_id");

-- AddForeignKey
ALTER TABLE "agent_invites" ADD CONSTRAINT "agent_invites_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_invites" ADD CONSTRAINT "agent_invites_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_agent_fk_id_fkey" FOREIGN KEY ("agent_fk_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "runs" ADD CONSTRAINT "runs_invite_id_fkey" FOREIGN KEY ("invite_id") REFERENCES "agent_invites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_steps" ADD CONSTRAINT "run_steps_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
