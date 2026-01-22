import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    IconHome, IconMic, IconBible, IconMore, IconJourney
} from './components/Icons';
import { Tab } from './types';

// Screens
import WelcomeScreen from './screens/WelcomeScreen';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import JourneyScreen from './screens/JourneyScreen';
import RecordScreen from './screens/RecordScreen';
import BibleScreen from './screens/BibleScreen';
import MoreScreen from './screens/MoreScreen';
import * as Notifications from 'expo-notifications';
import { useSession } from './services/auth';
import { notificationService } from './services/notificationService';
import { bibleService } from './services/bibleService';

type AppState = 'WELCOME' | 'AUTH_LOGIN' | 'AUTH_SIGNUP' | 'MAIN';

const AppContent: React.FC = () => {
    // Navigation State
    const [appState, setAppState] = useState<AppState>('WELCOME');
    const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
    const [bibleNavState, setBibleNavState] = useState<{ book?: string; chapter?: number }>({});
    const [isJournalEditorOpen, setIsJournalEditorOpen] = useState(false);
    const { data: session, isPending } = useSession();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (isPending) return;

        // Register notification listeners
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data?.screen === 'HOME') {
                setActiveTab(Tab.HOME);
            }
        });

        const setupNotifications = async () => {
            try {
                const status = await notificationService.registerForPushNotificationsAsync();

                const affirmation = await bibleService.getAffirmation();
                if (affirmation) {
                    // SEND IT IMMEDIATELY FOR TESTING (As requested by user)
                    await notificationService.sendImmediateDailyAffirmation(
                        affirmation.scripture,
                        affirmation.affirmation
                    );

                    if (session?.user?.settings?.dailyAffirmations !== false) {
                        // Also schedule for 8:00 AM every day
                        await notificationService.scheduleDailyAffirmation(
                            8, 0,
                            affirmation.scripture,
                            affirmation.affirmation
                        );
                    }
                } else {
                    // Fallback test if backend fails
                    await notificationService.sendImmediateNotification(
                        'System Sync Test',
                        'Backend affirmation call failed, but notification system is working.'
                    );
                }
            } catch (err) {
                console.error('setupNotifications error:', err);
            }
        };
        setupNotifications();

        return () => subscription.remove();
    }, [session, isPending]);

    useEffect(() => {
        if (!isPending) {
            if (session) {
                setAppState('MAIN');
            } else if (appState === 'MAIN') {
                setAppState('WELCOME');
            }
        }
    }, [session, isPending]);

    const handleAuthenticated = () => {
        setAppState('MAIN');
    };

    const renderMainApp = () => {
        const renderScreen = () => {
            switch (activeTab) {
                case Tab.HOME: return <HomeScreen onNavigate={(screen) => setActiveTab(screen as Tab)} />;
                case Tab.BIBLE: return <BibleScreen initialBook={bibleNavState.book} initialChapter={bibleNavState.chapter} />;
                case Tab.RECORD: return (
                    <RecordScreen
                        onNavigateToBible={(book, chapter) => {
                            setBibleNavState({ book, chapter });
                            setActiveTab(Tab.BIBLE);
                        }}
                    />
                );
                case Tab.JOURNEY: return <JourneyScreen onNavigateGlobal={(screen) => setActiveTab(screen as Tab)} onEditorStateChange={setIsJournalEditorOpen} />;
                case Tab.MORE: return <MoreScreen />;
                default: return <HomeScreen onNavigate={(screen) => setActiveTab(screen as Tab)} />;
            }
        };

        return (
            <View style={styles.mainContainer}>
                {/* Main Content Area */}
                <View style={styles.contentArea}>
                    {renderScreen()}
                </View>

                {/* Bottom Navigation - Hidden when journal editor is open */}
                {!isJournalEditorOpen && (
                    <View style={[
                        styles.bottomNav,
                        { paddingBottom: Math.max(insets.bottom, 16) }
                    ]}>
                        <NavButton
                            active={activeTab === Tab.HOME}
                            icon={<IconHome size={24} color={activeTab === Tab.HOME ? '#E8503A' : '#666666'} />}
                            label="Home"
                            onPress={() => setActiveTab(Tab.HOME)}
                        />

                        <NavButton
                            active={activeTab === Tab.BIBLE}
                            icon={<IconBible size={24} color={activeTab === Tab.BIBLE ? '#E8503A' : '#666666'} />}
                            label="Read"
                            onPress={() => setActiveTab(Tab.BIBLE)}
                        />

                        {/* Central Action Button (Record/Mic) */}
                        <View style={styles.centralButtonContainer}>
                            <TouchableOpacity
                                onPress={() => setActiveTab(Tab.RECORD)}
                                style={[
                                    styles.centralButton,
                                    activeTab === Tab.RECORD ? styles.centralButtonActive : styles.centralButtonInactive
                                ]}
                            >
                                <IconMic size={28} color={activeTab === Tab.RECORD ? '#FFFFFF' : '#999999'} />
                            </TouchableOpacity>
                        </View>

                        <NavButton
                            active={activeTab === Tab.JOURNEY}
                            icon={<IconJourney size={24} color={activeTab === Tab.JOURNEY ? '#E8503A' : '#666666'} />}
                            label="Journey"
                            onPress={() => setActiveTab(Tab.JOURNEY)}
                        />

                        <NavButton
                            active={activeTab === Tab.MORE}
                            icon={<IconMore size={24} color={activeTab === Tab.MORE ? '#E8503A' : '#666666'} />}
                            label="More"
                            onPress={() => setActiveTab(Tab.MORE)}
                        />
                    </View>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.appContainer}>
                {isPending ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#E8503A" />
                    </View>
                ) : (
                    <>
                        {appState === 'WELCOME' && (
                            <WelcomeScreen
                                onGetStarted={() => setAppState('AUTH_SIGNUP')}
                                onLogin={() => setAppState('AUTH_LOGIN')}
                            />
                        )}

                        {(appState === 'AUTH_LOGIN' || appState === 'AUTH_SIGNUP') && (
                            <AuthScreen
                                initialMode={appState === 'AUTH_LOGIN' ? 'login' : 'signup'}
                                onAuthenticated={handleAuthenticated}
                                onBack={() => setAppState('WELCOME')}
                            />
                        )}

                        {appState === 'MAIN' && renderMainApp()}
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

const App: React.FC = () => {
    return (
        <SafeAreaProvider>
            <AppContent />
        </SafeAreaProvider>
    );
};

interface NavButtonProps {
    active: boolean;
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ active, icon, label, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        style={styles.navButton}
        activeOpacity={0.7}
    >
        <View style={styles.navIconContainer}>
            {icon}
            {active && <View style={styles.activeIndicator} />}
        </View>
        <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    appContainer: {
        flex: 1,
        backgroundColor: '#0D0D0D',
        maxWidth: 440,
        alignSelf: 'center',
        width: '100%',
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#0D0D0D',
        position: 'relative',
    },
    contentArea: {
        flex: 1,
        position: 'relative',
    },
    bottomNav: {
        backgroundColor: 'rgba(17, 17, 17, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    navButton: {
        width: 56,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    navIconContainer: {
        position: 'relative',
    },
    activeIndicator: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 6,
        height: 6,
        backgroundColor: '#E8503A',
        borderRadius: 3,
    },
    navLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#666666',
        opacity: 0.6,
    },
    navLabelActive: {
        color: '#E8503A',
        opacity: 1,
    },
    centralButtonContainer: {
        marginTop: -16,
    },
    centralButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    centralButtonActive: {
        backgroundColor: '#E8503A',
    },
    centralButtonInactive: {
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },

});

export default App;
