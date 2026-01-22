import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

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
                importance: Notifications.AndroidImportance.DEFAULT,
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
            // Check for any variations of the title or the specific identifier
            if (
                notification.content.title === "Daily Affirmation" ||
                notification.content.title === "Daily Word of Affirmation" ||
                notification.identifier === 'daily-affirmation'
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
                title: "Daily Word of Affirmation",
                body: `Remember: ${affirmation}\n\nToday's Verse: ${scripture}`,
                data: { screen: 'HOME' }
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
            },
        });
    },

    async sendImmediateDailyAffirmation(scripture: string, affirmation: string) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Daily Word of Affirmation",
                body: `Remember: ${affirmation}\n\nToday's Verse: ${scripture}`,
                data: { screen: 'HOME' },
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null,
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

    async cancelAllReminders() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
};
