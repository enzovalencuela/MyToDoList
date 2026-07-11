"use server";

import {
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationSettingsState,
} from "@/lib/notification-settings";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";

function serializeSettings(settings: NotificationSettingsState) {
  return {
    agendaReminders: settings.agendaReminders,
    taskDeadlines: settings.taskDeadlines,
    aiInactivityAlerts: settings.aiInactivityAlerts,
  };
}

export async function getNotificationSettings(): Promise<NotificationSettingsState> {
  const userId = await getUsuarioId();

  if (!userId) {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }

  const settings = await prisma.notificationSettings.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      ...DEFAULT_NOTIFICATION_SETTINGS,
    },
  });

  return serializeSettings(settings);
}

export async function updateNotificationSettings(
  settings: Partial<NotificationSettingsState>,
): Promise<NotificationSettingsState> {
  const userId = await getUsuarioId();

  if (!userId) {
    throw new Error("Nao autorizado");
  }

  const updatedSettings = await prisma.notificationSettings.upsert({
    where: { userId },
    update: {
      agendaReminders: settings.agendaReminders,
      taskDeadlines: settings.taskDeadlines,
      aiInactivityAlerts: settings.aiInactivityAlerts,
    },
    create: {
      userId,
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...settings,
    },
  });

  return serializeSettings(updatedSettings);
}
