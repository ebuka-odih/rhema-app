import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { IconArrowLeft, IconShield, IconLock } from '../../components/Icons';
import { useSession, authService } from '../../services/auth';

const PrivacyScreen: React.FC<{
    onBack: () => void;
    onToS?: () => void;
    onPrivacy?: () => void;
}> = ({ onBack, onToS, onPrivacy }) => {
    const { data: session } = useSession();
    const user = session?.user;

    const [settings, setSettings] = React.useState({
        publicProfile: user?.settings?.publicProfile ?? true,
        shareActivity: user?.settings?.shareActivity ?? false,
        aiPersonalization: user?.settings?.aiPersonalization ?? true,
    });
    const [loading, setLoading] = React.useState(false);

    const toggle = async (key: keyof typeof settings) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);

        // Auto-save on toggle
        setLoading(true);
        try {
            await authService.updateUser({
                settings: { ...user?.settings, ...newSettings }
            });
        } catch (error) {
            console.error("Failed to update privacy setting:", error);
            Alert.alert("Error", "Failed to update setting. Please try again.");
            // Revert local state if update fails
            setSettings(settings);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy</Text>
                <View style={{ width: 40 }}>
                    {loading && <ActivityIndicator size="small" color="#E8503A" />}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionHeader}>Data Visibility</Text>
                <View style={styles.card}>
                    <View style={styles.item}>
                        <View style={styles.itemLeft}>
                            <View>
                                <Text style={styles.itemText}>Public Profile</Text>
                                <Text style={styles.itemSubtext}>Allow others to find you in prayer groups</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#333333', true: '#E8503A' }}
                            thumbColor="#FFFFFF"
                            onValueChange={() => toggle('publicProfile')}
                            value={settings.publicProfile}
                        />
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.item}>
                        <View style={styles.itemLeft}>
                            <View>
                                <Text style={styles.itemText}>Share Activity</Text>
                                <Text style={styles.itemSubtext}>Show your growth progress to friends</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#333333', true: '#E8503A' }}
                            thumbColor="#FFFFFF"
                            onValueChange={() => toggle('shareActivity')}
                            value={settings.shareActivity}
                        />
                    </View>
                </View>

                <Text style={styles.sectionHeader}>External Services</Text>
                <View style={styles.card}>
                    <View style={styles.item}>
                        <View style={styles.itemLeft}>
                            <View>
                                <Text style={styles.itemText}>Personalized Experience</Text>
                                <Text style={styles.itemSubtext}>Use AI to suggest relevant scriptures</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#333333', true: '#E8503A' }}
                            thumbColor="#FFFFFF"
                            onValueChange={() => toggle('aiPersonalization')}
                            value={settings.aiPersonalization}
                        />
                    </View>
                </View>

                <Text style={styles.sectionHeader}>Account Data</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.item}>
                        <Text style={styles.itemText}>Export My Data</Text>
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.item}>
                        <Text style={[styles.itemText, { color: '#E8503A' }]}>Delete Account</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity onPress={onPrivacy}>
                        <Text style={styles.linkText}>Privacy Policy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onToS}>
                        <Text style={styles.linkText}>Terms of Service</Text>
                    </TouchableOpacity>
                </View>
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
        padding: 24,
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
    item: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    itemText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    itemSubtext: {
        fontSize: 12,
        color: '#666666',
        marginTop: 2,
        maxWidth: '85%',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        marginLeft: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginTop: 20,
        paddingBottom: 40,
    },
    linkText: {
        color: '#666666',
        fontSize: 14,
        fontWeight: '500',
    },
});

export default PrivacyScreen;
