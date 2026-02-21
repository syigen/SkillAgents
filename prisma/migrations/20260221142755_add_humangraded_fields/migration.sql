-- AlterTable
ALTER TABLE "run_steps" ADD COLUMN     "grading_history" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "human_note" TEXT,
ADD COLUMN     "is_human_graded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "score" INTEGER;
