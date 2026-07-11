ALTER TABLE "usuario"
ADD COLUMN "last_active_at" TIMESTAMP(3);

CREATE TABLE "notification_settings" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "id_usuario" INTEGER NOT NULL,
  "agenda_reminders" BOOLEAN NOT NULL DEFAULT true,
  "task_deadlines" BOOLEAN NOT NULL DEFAULT true,
  "ai_inactivity_alerts" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_settings_id_usuario_key" UNIQUE ("id_usuario"),
  CONSTRAINT "notification_settings_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "notification_delivery" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "id_usuario" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "reference_key" TEXT NOT NULL,
  "delivered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notification_delivery_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_delivery_id_usuario_type_reference_key_key" UNIQUE ("id_usuario", "type", "reference_key"),
  CONSTRAINT "notification_delivery_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "notification_delivery_type_delivered_at_idx"
ON "notification_delivery"("type", "delivered_at");
