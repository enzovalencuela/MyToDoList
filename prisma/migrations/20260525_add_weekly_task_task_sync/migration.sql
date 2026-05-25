ALTER TABLE "weekly_task"
ADD COLUMN "show_in_tasks" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "weekly_task_todo_sync" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "weekly_task_id" UUID NOT NULL,
  "id_tarefa" INTEGER NOT NULL,
  "scheduled_date" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "weekly_task_todo_sync_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "weekly_task_todo_sync_id_tarefa_key" UNIQUE ("id_tarefa"),
  CONSTRAINT "weekly_task_todo_sync_weekly_task_id_scheduled_date_key" UNIQUE ("weekly_task_id", "scheduled_date"),
  CONSTRAINT "weekly_task_todo_sync_weekly_task_id_fkey" FOREIGN KEY ("weekly_task_id") REFERENCES "weekly_task"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "weekly_task_todo_sync_id_tarefa_fkey" FOREIGN KEY ("id_tarefa") REFERENCES "tarefa"("id_tarefa") ON DELETE CASCADE ON UPDATE CASCADE
);
