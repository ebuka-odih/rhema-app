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
                name: 'Prayer Reminders',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 500, 200, 500],
                lightColor: '#E8503A',
                sound: 'default', // Using default system sound
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
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Time to Pray 🙏",
                body: request || "It's time for your scheduled prayer session.",
                sound: true,
                vibrate: [0, 500, 200, 500] as any, // Explicitly define vibration pattern
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
