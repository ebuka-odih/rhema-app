type ScheduledNotification = {
  identifier: string;
  content: Record<string, any>;
  trigger: Record<string, any> | null;
};

let notificationHandler: any = null;
const scheduled: ScheduledNotification[] = [];

export const AndroidImportance = {
  LOW: 2,
  HIGH: 4,
  MAX: 5,
} as const;

export const AndroidNotificationPriority = {
  LOW: 'low',
  HIGH: 'high',
  MAX: 'max',
} as const;

export const AndroidNotificationVisibility = {
  PUBLIC: 'public',
} as const;

export const SchedulableTriggerInputTypes = {
  DAILY: 'daily',
  TIME_INTERVAL: 'timeInterval',
} as const;

export function setNotificationHandler(handler: any): void {
  notificationHandler = handler;
}

export async function setNotificationChannelAsync(_id: string, _config: Record<string, any>): Promise<void> {}

export async function getPermissionsAsync(): Promise<{ status: 'granted'; granted: true }> {
  return { status: 'granted', granted: true };
}

export async function requestPermissionsAsync(): Promise<{ status: 'granted'; granted: true }> {
  return { status: 'granted', granted: true };
}

export async function scheduleNotificationAsync(input: {
  identifier?: string;
  content: Record<string, any>;
  trigger: Record<string, any> | null;
}): Promise<string> {
  const identifier = input.identifier ?? `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const idx = scheduled.findIndex((n) => n.identifier === identifier);
  const item: ScheduledNotification = { identifier, content: input.content, trigger: input.trigger };
  if (idx >= 0) scheduled[idx] = item;
  else scheduled.push(item);
  return identifier;
}

export async function getAllScheduledNotificationsAsync(): Promise<ScheduledNotification[]> {
  return [...scheduled];
}

export async function cancelScheduledNotificationAsync(identifier: string): Promise<void> {
  const idx = scheduled.findIndex((n) => n.identifier === identifier);
  if (idx >= 0) scheduled.splice(idx, 1);
}

export async function cancelAllScheduledNotificationsAsync(): Promise<void> {
  scheduled.length = 0;
}

export { notificationHandler };
