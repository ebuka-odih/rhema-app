import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { IconArrowLeft, IconBell, IconClock, IconMessage, IconActivity } from '../../components/Icons';
import { useSession, authService } from '../../services/auth';

interface NotificationToggleProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    isEnabled: boolean;
    onToggle: () => void;
}

const NotificationToggle: React.FC<NotificationToggleProps> = ({ icon, title, description, isEnabled, onToggle }) => (
    <View style={styles.toggleItem}>
        <View style={styles.toggleLeft}>
            <View style={styles.iconContainer}>{icon}</View>
            <View style={styles.textContainer}>
                <Text style={styles.toggleTitle}>{title}</Text>
                <Text style={styles.toggleDescription}>{description}</Text>
            </View>
        </View>
        <Switch
            trackColor={{ false: '#333333', true: '#E8503A' }}
            thumbColor={isEnabled ? '#FFFFFF' : '#999999'}
            ios_backgroundColor="#333333"
            onValueChange={onToggle}
            value={isEnabled}
        />
    </View>
);

const NotificationSettingsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { data: session } = useSession();
    const user = session?.user;

    const [settings, setSettings] = React.useState({
        dailyAffirmations: user?.settings?.dailyAffirmations ?? true,
        prayerReminders: user?.settings?.prayerReminders ?? true,
        journalPrompts: user?.settings?.journalPrompts ?? false,
        appUpdates: user?.settings?.appUpdates ?? true,
        marketing: user?.settings?.marketing ?? false,
    });
    const [loading, setLoading] = React.useState(false);

    const toggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setLoading(true);
        const { data, error } = await authService.updateUser({ settings });
        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'Preferences saved successfully');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionHeader}>Daily Engagement</Text>
                <View style={styles.card}>
                    <NotificationToggle
                        icon={<IconBell size={20} color="#E8503A" />}
                        title="Daily Affirmations"
                        description="Receive your morning scripture and affirmation"
                        isEnabled={settings.dailyAffirmations}
                        onToggle={() => toggle('dailyAffirmations')}
                    />
                    <View style={styles.divider} />
                    <NotificationToggle
                        icon={<IconClock size={20} color="#E8503A" />}
                        title="Prayer Reminders"
                        description="Alerts for your scheduled prayer times"
                        isEnabled={settings.prayerReminders}
                        onToggle={() => toggle('prayerReminders')}
                    />
                    <View style={styles.divider} />
                    <NotificationToggle
                        icon={<IconActivity size={20} color="#E8503A" />}
                        title="Journal Prompts"
                        description="Get inspired to reflect on your day"
                        isEnabled={settings.journalPrompts}
                        onToggle={() => toggle('journalPrompts')}
                    />
                </View>

                <Text style={styles.sectionHeader}>System & Marketing</Text>
                <View style={styles.card}>
                    <NotificationToggle
                        icon={<IconMessage size={20} color="#E8503A" />}
                        title="App Updates"
                        description="Important news about features and fixes"
                        isEnabled={settings.appUpdates}
                        onToggle={() => toggle('appUpdates')}
                    />
                    <View style={styles.divider} />
                    <NotificationToggle
                        icon={<IconActivity size={20} color="#E8503A" />}
                        title="Marketing & Tips"
                        description="Personalized growth tips and offers"
                        isEnabled={settings.marketing}
                        onToggle={() => toggle('marketing')}
                    />
                </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Preferences</Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#111111',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    content: {
        padding: 20,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666666',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#111111',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 24,
    },
    toggleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 16,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        gap: 2,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    toggleDescription: {
        fontSize: 12,
        color: '#666666',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        marginLeft: 68,
    },
    saveButton: {
        backgroundColor: '#E8503A',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default NotificationSettingsScreen;
