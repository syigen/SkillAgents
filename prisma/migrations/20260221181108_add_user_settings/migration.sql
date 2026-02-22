-- AlterTable
ALTER TABLE "users" ADD COLUMN     "userSettingsId" UUID;

-- CreateTable
CREATE TABLE "user_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "google_ai_key_enc" TEXT,
    "google_ai_key_iv" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_userSettingsId_fkey" FOREIGN KEY ("userSettingsId") REFERENCES "user_settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
