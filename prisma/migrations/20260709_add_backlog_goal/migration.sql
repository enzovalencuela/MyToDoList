CREATE TABLE "backlog_goal" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "id_usuario" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "backlog_goal_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "backlog_goal_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "backlog_goal_id_usuario_status_priority_idx"
ON "backlog_goal"("id_usuario", "status", "priority");
