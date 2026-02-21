-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "skills" JSONB NOT NULL DEFAULT '[]',
    "difficulty" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'private',
    "last_updated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_criteria" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "template_id" UUID NOT NULL,
    "prompt" TEXT NOT NULL,
    "expected" TEXT NOT NULL,
    "min_score" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "templates_owner_user_id_idx" ON "templates"("owner_user_id");

-- CreateIndex
CREATE INDEX "templates_status_idx" ON "templates"("status");

-- CreateIndex
CREATE INDEX "template_criteria_template_id_idx" ON "template_criteria"("template_id");

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_criteria" ADD CONSTRAINT "template_criteria_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
