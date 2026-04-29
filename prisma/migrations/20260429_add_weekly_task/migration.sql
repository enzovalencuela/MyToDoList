CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "weekly_task" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "category" TEXT,
    "id_usuario" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_task_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "weekly_task_id_usuario_dayOfWeek_startTime_idx"
ON "weekly_task"("id_usuario", "dayOfWeek", "startTime");

ALTER TABLE "weekly_task"
ADD CONSTRAINT "weekly_task_id_usuario_fkey"
FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario")
ON DELETE CASCADE ON UPDATE CASCADE;
