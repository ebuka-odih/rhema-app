import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Prayer } from '../types';

// Configure how notifications should be handled when the app is open
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const notificationService = {
    async registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'General',
                importance: Notifications.AndroidImportance.HIGH,
                sound: 'default',
            });

            await Notifications.setNotificationChannelAsync('prayer-reminders', {
                name: 'Urgent Prayer Reminders',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 1000, 500, 1000, 500, 1000, 500, 2000],
                lightColor: '#E8503A',
                sound: 'default',
                lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
                bypassDnd: true,
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                return;
            }
        }

        return token;
    },

    async clearAllDailyAffirmations() {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notification of scheduled) {
            const title = notification.content.title || "";
            // Be more aggressive in clearing anything that looks like a daily affirmation
            if (
                title.includes("Affirmation") ||
                title.includes("Daily") ||
                notification.identifier === 'daily-affirmation' ||
                notification.identifier.startsWith('test-affirmation-')
            ) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            }
        }
    },

    async scheduleDailyAffirmation(hour: number, minute: number, scripture: string, affirmation: string) {
        const identifier = 'daily-affirmation';

        // Clear existing ones first to ensure no duplicates
        await this.clearAllDailyAffirmations();

        // Schedule the new one with the consistent identifier
        await Notifications.scheduleNotificationAsync({
            identifier,
            content: {
                title: "🕊️ Daily Affirmation",
                body: `${affirmation}\n\n${scripture}`,
                data: { screen: 'HOME' },
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            },
        });
    },

    async sendImmediateNotification(title: string, body: string) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null,
        });
    },

    async schedulePrayerReminder(id: string | number, hour: number, minute: number, request: string) {
        // Ensure we don't end up with stale/duplicate schedules for the same prayer
        await Notifications.cancelScheduledNotificationAsync(`prayer-${id}`);

        // Schedule the primary alarm with a consistent ID for this specific prayer
        await Notifications.scheduleNotificationAsync({
            identifier: `prayer-${id}`,
            content: {
                title: "🚨 Prayer Session Beginning",
                body: request || "It's time for your scheduled prayer session. Your soul awaits.",
                sound: true,
                priority: Notifications.AndroidNotificationPriority.MAX,
                vibrate: [0, 1000, 500, 1000, 500, 1000, 500, 3000, 500, 3000] as any,
                autoDismiss: false,
                sticky: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
                channelId: 'prayer-reminders',
            },
        });
    },

    async cancelPrayerReminder(id: string | number) {
        await Notifications.cancelScheduledNotificationAsync(`prayer-${id}`);
    },

    async syncPrayerReminders(prayers: Prayer[]) {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        const prayerMap = new Map(prayers.map((p) => [p.id.toString(), p]));

        for (const notif of scheduled) {
            const identifier = notif.identifier || "";
            if (!identifier.startsWith('prayer-')) continue;

            const prayerId = identifier.replace('prayer-', '');
            const prayer = prayerMap.get(prayerId);

            // Cancel anything that no longer exists or shouldn't be scheduled
            if (!prayer || !prayer.reminder_enabled || prayer.status !== 'active') {
                await Notifications.cancelScheduledNotificationAsync(identifier);
                continue;
            }

            const time = prayer.time || '';
            const [timePart, period] = time.split(' ');
            const [rawHour, rawMinute] = (timePart || '').split(':').map(Number);
            if (Number.isNaN(rawHour) || Number.isNaN(rawMinute)) {
                // Invalid time format: cancel to avoid stale notifications
                await Notifications.cancelScheduledNotificationAsync(identifier);
                continue;
            }

            let hour = rawHour;
            if (period === 'PM' && hour < 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;

            const expectedBody = prayer.request || "It's time for your scheduled prayer session. Your soul awaits.";
            const trigger: any = notif.trigger || {};

            const needsReschedule =
                trigger.hour !== hour ||
                trigger.minute !== rawMinute ||
                notif.content?.body !== expectedBody;

            if (needsReschedule) {
                await this.schedulePrayerReminder(prayer.id, hour, rawMinute, prayer.request);
            }
        }
    },

    async cancelAllReminders() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    },

    async scheduleFastingReminder(intervalHours: number) {
        // 1. Cancel existing fasting notifications first
        await this.cancelFastingReminder();

        // 2. Send Immediate "Start" Notification
        await Notifications.scheduleNotificationAsync({
            identifier: 'fasting-start',
            content: {
                title: "🔥 Fasting Journey Started",
                body: "Your fast has officially begun. May this be a time of deep spiritual strength and focus. God is with you!",
                priority: Notifications.AndroidNotificationPriority.HIGH,
                sound: true,
            },
            trigger: null, // Send immediately
        });

        // 3. Define Predefined Messages for intervals
        const messages = [
            "Stay strong. Each moment of hunger is an invitation to prayer. 💪",
            "God is your sustainer. Remember to stay hydrated and focused on Him. 💧",
            "Your spirit is being strengthened through this sacrifice. Keep going! ✨",
            "You are more than a conqueror. The Lord is with you in this journey. 🕊️",
            "A time of fasting is a time of renewal. Peace be with you. 🌿",
            "In your weakness, His strength is made perfect. Trust in Him. 🛡️"
        ];

        // 4. Schedule multiple unique reminders for the next 48 hours
        const totalHours = 48;
        const count = Math.floor(totalHours / intervalHours);

        for (let i = 1; i <= count; i++) {
            const message = messages[(i - 1) % messages.length];
            await Notifications.scheduleNotificationAsync({
                identifier: `fasting-interval-${i}`,
                content: {
                    title: "⏳ Fasting Check-in",
                    body: message,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: i * intervalHours * 3600,
                    repeats: false,
                },
            });
        }
    },

    async cancelFastingReminder() {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notif of scheduled) {
            if (notif.identifier === 'fasting-start' || notif.identifier.startsWith('fasting-interval-')) {
                await Notifications.cancelScheduledNotificationAsync(notif.identifier);
            }
        }
        // Also cancel the old legacy identifier if it exists
        await Notifications.cancelScheduledNotificationAsync('fasting-reminder');
    },

    async showRecordingNotification() {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('recording-status', {
                name: 'Recording Status',
                importance: Notifications.AndroidImportance.LOW, // Use LOW to avoid sound/interruption but stay in tray
            });
        }

        await Notifications.scheduleNotificationAsync({
            identifier: 'active-recording',
            content: {
                title: "🔴 Sermon Recording Active",
                body: "WordFlow is currently recording your sermon. Don't worry, we're capturing every word!",
                priority: Notifications.AndroidNotificationPriority.LOW,
                sticky: true, // Android: Prevent user from swiping away
                autoDismiss: false,
            },
            trigger: null, // Immediate
        });
    },

    async hideRecordingNotification() {
        await Notifications.cancelScheduledNotificationAsync('active-recording');
    }
};
