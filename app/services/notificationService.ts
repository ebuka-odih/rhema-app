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
            await Notifications.setNotificationChannelAsync('prayer-reminders', {
                name: 'Urgent Prayer Reminders',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 1000, 500, 1000, 500, 1000, 500, 2000],
                lightColor: '#E8503A',
                sound: 'default', // Using default system sound
                lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
                bypassDnd: true, // Try to bypass Do Not Disturb for urgent prayers
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

    async scheduleDailyAffirmation(hour: number, minute: number, scripture: string, affirmation: string) {
        await Notifications.cancelAllScheduledNotificationsAsync();

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Daily Affirmation",
                body: `${affirmation}\n\n"${scripture}"`,
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
            },
            trigger: null,
        });
    },

    async schedulePrayerReminder(hour: number, minute: number, request: string) {
        // Schedule the primary alarm
        await Notifications.scheduleNotificationAsync({
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

    async cancelAllReminders() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
};
