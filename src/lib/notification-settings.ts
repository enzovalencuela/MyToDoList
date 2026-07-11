export interface NotificationSettingsState {
  agendaReminders: boolean;
  taskDeadlines: boolean;
  aiInactivityAlerts: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsState = {
  agendaReminders: true,
  taskDeadlines: true,
  aiInactivityAlerts: false,
};
