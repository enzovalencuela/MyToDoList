-- CreateTable
CREATE TABLE "streak_history" (
    "id" UUID NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "activity_date" DATE NOT NULL,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "streak_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "streak_history_id_usuario_activity_date_idx" ON "streak_history"("id_usuario", "activity_date");

-- CreateIndex
CREATE UNIQUE INDEX "streak_history_id_usuario_activity_date_key" ON "streak_history"("id_usuario", "activity_date");

-- AddForeignKey
ALTER TABLE "streak_history"
ADD CONSTRAINT "streak_history_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
