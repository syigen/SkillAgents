/*
  Warnings:

  - You are about to drop the column `grading_history` on the `run_steps` table. All the data in the column will be lost.
  - You are about to drop the column `evaluation` on the `runs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "run_steps" DROP COLUMN "grading_history";

-- AlterTable
ALTER TABLE "runs" DROP COLUMN "evaluation";

-- CreateTable
CREATE TABLE "run_step_grades" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "step_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "reasoning" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_elected" BOOLEAN NOT NULL DEFAULT false,
    "given_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "elected_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "run_step_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "run_evaluations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "run_id" UUID NOT NULL,
    "overall" INTEGER NOT NULL,
    "pass_threshold" INTEGER NOT NULL,
    "skill_threshold" INTEGER NOT NULL,
    "model" TEXT,
    "version" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "run_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "run_evaluation_skill_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "evaluation_id" UUID NOT NULL,
    "skill" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "run_evaluation_skill_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "run_evaluation_per_question" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "evaluation_id" UUID NOT NULL,
    "question_index" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL,
    "feedback" TEXT,

    CONSTRAINT "run_evaluation_per_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "run_evaluation_question_skill_scores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question_id" UUID NOT NULL,
    "skill" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "run_evaluation_question_skill_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "run_step_grades_step_id_idx" ON "run_step_grades"("step_id");

-- CreateIndex
CREATE UNIQUE INDEX "run_evaluations_run_id_key" ON "run_evaluations"("run_id");

-- CreateIndex
CREATE INDEX "run_evaluations_run_id_idx" ON "run_evaluations"("run_id");

-- CreateIndex
CREATE INDEX "run_evaluation_skill_scores_evaluation_id_idx" ON "run_evaluation_skill_scores"("evaluation_id");

-- CreateIndex
CREATE UNIQUE INDEX "run_evaluation_skill_scores_evaluation_id_skill_key" ON "run_evaluation_skill_scores"("evaluation_id", "skill");

-- CreateIndex
CREATE INDEX "run_evaluation_per_question_evaluation_id_idx" ON "run_evaluation_per_question"("evaluation_id");

-- CreateIndex
CREATE UNIQUE INDEX "run_evaluation_per_question_evaluation_id_question_index_key" ON "run_evaluation_per_question"("evaluation_id", "question_index");

-- CreateIndex
CREATE INDEX "run_evaluation_question_skill_scores_question_id_idx" ON "run_evaluation_question_skill_scores"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "run_evaluation_question_skill_scores_question_id_skill_key" ON "run_evaluation_question_skill_scores"("question_id", "skill");

-- AddForeignKey
ALTER TABLE "run_step_grades" ADD CONSTRAINT "run_step_grades_step_id_fkey" FOREIGN KEY ("step_id") REFERENCES "run_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_evaluations" ADD CONSTRAINT "run_evaluations_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_evaluation_skill_scores" ADD CONSTRAINT "run_evaluation_skill_scores_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "run_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_evaluation_per_question" ADD CONSTRAINT "run_evaluation_per_question_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "run_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_evaluation_question_skill_scores" ADD CONSTRAINT "run_evaluation_question_skill_scores_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "run_evaluation_per_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
