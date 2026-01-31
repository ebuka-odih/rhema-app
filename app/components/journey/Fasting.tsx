import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Platform, Switch, Dimensions, TextInput, PanResponder,
    ActivityIndicator, Alert, Modal
} from 'react-native';
import {
    IconClock, IconPlus, IconChevronLeft, IconHeart,
    IconShare, IconDots, IconClose, IconFire, IconCheck
} from '../Icons';
import { FastingGroup, FastingSession } from '../../types';
import { fastingService } from '../../services/fastingService';
import { notificationService } from '../../services/notificationService';

const { width } = Dimensions.get('window');

interface FeedItem {
    id: string;
    user: {
        name: string;
        avatar_color: string;
    };
    type: 'scripture' | 'prayer' | 'milestone';
    content: string;
    meta?: string;
    time: string;
    likes: number;
}

interface FastingProps {
    onBack: () => void;
}

// Custom Slider Component
const DurationSlider = ({ value, onChange, min = 1, max = 100 }: { value: number, onChange: (v: number) => void, min?: number, max?: number }) => {
    const sliderWidth = width - 80;
    const [localX, setLocalX] = useState(((value - min) / (max - min)) * sliderWidth);

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
            let newX = Math.max(0, Math.min(sliderWidth, gestureState.moveX - 40));
            setLocalX(newX);
            const newValue = Math.round(min + (newX / sliderWidth) * (max - min));
            onChange(newValue);
        },
    }), [sliderWidth, min, max, onChange]);

    return (
        <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: localX }]} />
            </View>
            <View
                {...panResponder.panHandlers}
                style={[styles.sliderThumb, { transform: [{ translateX: localX - 12 }] }]}
            >
                <View style={styles.thumbInner} />
            </View>
        </View>
    );
};

export const Fasting: React.FC<FastingProps> = ({ onBack }) => {
    // Fasting Timer State
    const [isFasting, setIsFasting] = useState(false);
    const [activeSession, setActiveSession] = useState<FastingSession | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Settings State
    const [durationHours, setDurationHours] = useState(24);
    const [recommendVerses, setRecommendVerses] = useState(true);
    const [reminderInterval, setReminderInterval] = useState(4);

    // Group State
    const [groups, setGroups] = useState<FastingGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGroup, setSelectedGroup] = useState<FastingGroup | null>(null);
    const [activeGroupTab, setActiveGroupTab] = useState<'feed' | 'info'>('feed');

    // UI State
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [mainTab, setMainTab] = useState<'current' | 'history'>('current');
    const [history, setHistory] = useState<FastingSession[]>([]);
    const [groupName, setGroupName] = useState('');
    const [groupDesc, setGroupDesc] = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [isGroupPrivate, setIsGroupPrivate] = useState(false);
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [fastSummary, setFastSummary] = useState<{ duration: number, goal: number } | null>(null);

    // Data Fetching
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [session, historyData, allGroups, userGroups] = await Promise.all([
                fastingService.getActiveSession(),
                fastingService.getFastingHistory(),
                fastingService.getGroups(),
                fastingService.getUserGroups()
            ]);

            if (session && session.start_time) {
                setActiveSession(session);
                setIsFasting(true);
                // Robust date parsing to avoid NaN on some platforms
                const startTimeStr = session.start_time.includes(' ') ? session.start_time.replace(' ', 'T') : session.start_time;
                const start = new Date(startTimeStr).getTime();
                setElapsedSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
            }

            setHistory(historyData.filter(h => h.status !== 'active'));

            const merged = allGroups.map(g => ({
                ...g,
                joined: userGroups.some(ug => ug.id === g.id)
            }));
            setGroups(merged);
        } catch (e) {
            console.error('Load data error:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const fetchActiveFast = useCallback(async () => {
        const session = await fastingService.getActiveSession();
        if (session && session.start_time) {
            setActiveSession(session);
            setIsFasting(true);
            const startTimeStr = session.start_time.includes(' ') ? session.start_time.replace(' ', 'T') : session.start_time;
            const start = new Date(startTimeStr).getTime();
            setElapsedSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
        }
    }, []);

    // Timer Interval
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isFasting) {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isFasting]);

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#E8503A" />
            </View>
        );
    }

    const handleStartFast = async () => {
        try {
            const session = await fastingService.startFast(durationHours, recommendVerses, reminderInterval);
            setActiveSession(session);
            setIsFasting(true);

            if (session.start_time) {
                const startTimeStr = (session.start_time as string).includes(' ') ? (session.start_time as string).replace(' ', 'T') : (session.start_time as string);
                const start = new Date(startTimeStr).getTime();
                setElapsedSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
            } else {
                setElapsedSeconds(0);
            }

            if (reminderInterval) {
                await notificationService.scheduleFastingReminder(reminderInterval);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleEndFast = async () => {
        if (!activeSession) return;
        try {
            await fastingService.endFast(activeSession.id, 'completed');

            // Store results for summary modal before clearing
            const finalElapsed = elapsedSeconds;
            setFastSummary({
                duration: finalElapsed,
                goal: activeSession.duration_hours
            });

            setIsFasting(false);
            setActiveSession(null);
            setElapsedSeconds(0);
            await notificationService.cancelFastingReminder();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleJoinGroup = async () => {
        if (!joinCode) return;
        setIsJoining(true);
        try {
            const group = await fastingService.joinGroup(joinCode);
            setJoinCode('');
            setIsCreatingGroup(false);
            loadData();
            Alert.alert('Success', `Joined ${group.name}`);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsJoining(false);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName) return;
        try {
            // Note: Privacy is handled by showing/hiding code in UI for this v1
            await fastingService.createGroup(groupName, groupDesc);
            setGroupName('');
            setGroupDesc('');
            setIsCreatingGroup(false);
            loadData();
            Alert.alert('Success', 'Group created! Invite others with your unique code.');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const handleEnterGroup = (group: FastingGroup) => {
        Alert.alert(
            "Community Notice",
            "You are entering a community fasting group. Please be respectful, supportive, and follow the group guidelines. Continue?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Enter Group", onPress: () => setSelectedGroup(group) }
            ]
        );
    };

    const handleLeaveGroup = async (groupId: string) => {
        try {
            await fastingService.leaveGroup(groupId);
            setSelectedGroup(null);
            loadData();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return { hours, minutes, seconds };
    };

    const timerDisplay = formatTime(elapsedSeconds);

    // Mock Feed
    const groupFeed: FeedItem[] = [
        {
            id: '1',
            user: { name: 'Sarah Jenkins', avatar_color: '#A855F7' },
            type: 'scripture',
            content: '“Is not this the kind of fasting I have chosen: to loose the chains of injustice and untie the cords of the yoke...”',
            meta: 'Isaiah 58:6',
            time: '2h ago',
            likes: 24
        }
    ];

    // --- Render Functions ---

    const renderGroupInfoContent = (group: FastingGroup) => (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.infoContent}>
            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>About this Group</Text>
                <Text style={styles.infoText}>{group.description}</Text>
                <View style={styles.infoMeta}>
                    <IconClock size={14} color="#999999" />
                    <Text style={styles.metaLabel}>Fasting Together</Text>
                </View>
            </View>

            {group.code && (
                <View style={[styles.infoCard, { backgroundColor: 'rgba(232, 80, 58, 0.05)', borderColor: 'rgba(232, 80, 58, 0.2)', borderWidth: 1 }]}>
                    <Text style={[styles.infoTitle, { color: '#E8503A' }]}>Invite Others</Text>
                    <Text style={styles.infoText}>Share this unique code for others to join your fasting community.</Text>
                    <TouchableOpacity
                        style={styles.codeBadge}
                        onPress={() => Alert.alert('Code Copied', `Invite code ${group.code} ready to share!`)}
                    >
                        <Text style={styles.codeBadgeText}>{group.code}</Text>
                        <IconShare size={16} color="#FFF" />
                    </TouchableOpacity>
                </View>
            )}

            <View style={[styles.infoCard, { opacity: 0.5 }]}>
                <Text style={styles.infoTitle}>Admin Settings</Text>
                <Text style={styles.infoText}>Manage member roles, group privacy, and community guidelines (Coming Soon).</Text>
            </View>

            <TouchableOpacity
                style={styles.leaveButton}
                onPress={() => Alert.alert('Leave Group', 'Are you sure?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Leave', style: 'destructive', onPress: () => handleLeaveGroup(group.id) }
                ])}
            >
                <Text style={styles.leaveButtonText}>Leave Group</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    const renderFeedContent = () => (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.feedContent}>
            <TouchableOpacity
                style={styles.postInput}
                onPress={() => Alert.alert("Coming Soon", "The community feed for sharing encouragement will be available soon!")}
            >
                <View style={styles.avatarMini} />
                <Text style={styles.postInputText}>Share encouragement...</Text>
            </TouchableOpacity>

            {groupFeed.map(item => (
                <View key={item.id} style={styles.postCard}>
                    <View style={styles.postHeader}>
                        <View style={styles.authorRow}>
                            <View style={[styles.avatar, { backgroundColor: item.user.avatar_color }]}>
                                <Text style={styles.avatarText}>{item.user.name[0]}</Text>
                            </View>
                            <View>
                                <Text style={styles.authorName}>{item.user.name}</Text>
                                <Text style={styles.postTime}>{item.time}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.postBody}>
                        <Text style={styles.scriptureText}>{item.content}</Text>
                    </View>
                </View>
            ))}
        </ScrollView>
    );

    const renderGroupDetail = (group: FastingGroup) => (
        <View style={styles.fullScreenContainer}>
            <View style={styles.groupHero}>
                <View style={styles.heroOverlay} />
                <View style={styles.heroHeader}>
                    <TouchableOpacity onPress={() => setSelectedGroup(null)} style={styles.heroIconButton}>
                        <IconChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
                <View style={styles.heroBottom}>
                    <Text style={styles.heroTitle}>{group.name}</Text>
                    <Text style={styles.heroSubtext}>{group.members} Members • {group.code}</Text>
                </View>
            </View>

            <View style={styles.tabsContainer}>
                <TouchableOpacity onPress={() => setActiveGroupTab('feed')} style={[styles.tabButton, activeGroupTab === 'feed' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeGroupTab === 'feed' && styles.activeTabText]}>Feed</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setActiveGroupTab('info')} style={[styles.tabButton, activeGroupTab === 'info' && styles.activeTab]}>
                    <Text style={[styles.tabText, activeGroupTab === 'info' && styles.activeTabText]}>Info</Text>
                </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
                {activeGroupTab === 'feed' ? renderFeedContent() : renderGroupInfoContent(group)}
            </View>
        </View>
    );

    const renderMainScreen = () => (
        <ScrollView style={styles.container} contentContainerStyle={styles.mainContent}>
            <View style={styles.mainHeader}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconChevronLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.mainTitle}>Fasting</Text>
                <TouchableOpacity onPress={() => setIsCreatingGroup(true)} style={styles.headerPlus}>
                    <IconPlus size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.mainTabs}>
                <TouchableOpacity
                    style={[styles.mainTab, mainTab === 'current' && styles.activeMainTab]}
                    onPress={() => setMainTab('current')}
                >
                    <Text style={[styles.mainTabText, mainTab === 'current' && styles.activeMainTabText]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.mainTab, mainTab === 'history' && styles.activeMainTab]}
                    onPress={() => setMainTab('history')}
                >
                    <Text style={[styles.mainTabText, mainTab === 'history' && styles.activeMainTabText]}>History</Text>
                </TouchableOpacity>
            </View>

            {mainTab === 'current' ? (
                <>
                    {!isFasting ? (
                        <View style={styles.startCard}>
                            <Text style={styles.startTitle}>Start Your Fast</Text>
                            <Text style={styles.durationValue}>{durationHours} Hours</Text>

                            <DurationSlider
                                value={durationHours}
                                onChange={setDurationHours}
                                min={1}
                                max={100}
                            />

                            <View style={styles.optionsContainer}>
                                <View style={styles.optionRow}>
                                    <Text style={styles.optionLabel}>Recommend Bible Verses</Text>
                                    <Switch
                                        value={recommendVerses}
                                        onValueChange={setRecommendVerses}
                                        trackColor={{ false: '#333', true: '#E8503A' }}
                                    />
                                </View>
                                <View style={styles.optionRow}>
                                    <Text style={styles.optionLabel}>Reminders (Hours)</Text>
                                    <View style={styles.reminderSelector}>
                                        {[2, 4, 8, 12].map(h => (
                                            <TouchableOpacity
                                                key={h}
                                                onPress={() => setReminderInterval(h)}
                                                style={[styles.reminderBtn, reminderInterval === h && styles.reminderBtnActive]}
                                            >
                                                <Text style={[styles.reminderText, reminderInterval === h && styles.reminderTextActive]}>{h}h</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity onPress={handleStartFast} style={styles.startButton}>
                                <Text style={styles.startButtonText}>Begin Fast</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.activeCard}>
                            <Text style={styles.activeLabel}>ACTIVE FAST</Text>
                            <View style={styles.timerRow}>
                                <View style={styles.timerBlock}>
                                    <Text style={styles.timerValue}>{timerDisplay.hours.toString().padStart(2, '0')}</Text>
                                    <Text style={styles.timerBlockLabel}>Hrs</Text>
                                </View>
                                <Text style={styles.timerDivider}>:</Text>
                                <View style={styles.timerBlock}>
                                    <Text style={styles.timerValue}>{timerDisplay.minutes.toString().padStart(2, '0')}</Text>
                                    <Text style={styles.timerBlockLabel}>Min</Text>
                                </View>
                                <Text style={styles.timerDivider}>:</Text>
                                <View style={styles.timerBlock}>
                                    <Text style={styles.timerValue}>{timerDisplay.seconds.toString().padStart(2, '0')}</Text>
                                    <Text style={styles.timerBlockLabel}>Sec</Text>
                                </View>
                            </View>

                            {activeSession?.recommended_verse && (
                                <View style={styles.verseRecommendation}>
                                    <Text style={styles.verseText}>"{activeSession.recommended_verse.text}"</Text>
                                    <Text style={styles.verseRef}>{activeSession.recommended_verse.ref}</Text>
                                </View>
                            )}

                            <TouchableOpacity onPress={handleEndFast} style={styles.endButton}>
                                <Text style={styles.endButtonText}>Complete Fast</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.groupsSection}>
                        <Text style={styles.sectionHeading}>Community Groups</Text>
                        {isLoading ? (
                            <ActivityIndicator color="#E8503A" />
                        ) : (
                            groups.map(group => (
                                <TouchableOpacity
                                    key={group.id}
                                    onPress={() => group.joined && handleEnterGroup(group)}
                                    style={styles.groupItem}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.groupName}>{group.name}</Text>
                                        <Text style={styles.groupDesc} numberOfLines={1}>{group.description}</Text>
                                    </View>
                                    {!group.joined && (
                                        <TouchableOpacity
                                            style={styles.joinBtn}
                                            onPress={() => {
                                                setJoinCode(group.code || '');
                                                handleJoinGroup();
                                            }}
                                        >
                                            <Text style={styles.joinBtnText}>Join</Text>
                                        </TouchableOpacity>
                                    )}
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </>
            ) : (
                <View style={styles.historySection}>
                    {history.length === 0 ? (
                        <View style={styles.emptyHistory}>
                            <IconClock size={48} color="#333" />
                            <Text style={styles.emptyHistoryText}>No completed fasts yet.</Text>
                            <TouchableOpacity
                                style={styles.emptyHistoryBtn}
                                onPress={() => setMainTab('current')}
                            >
                                <Text style={styles.emptyHistoryBtnText}>Start your first fast</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        history.map((item) => {
                            const start = new Date(item.start_time.replace(' ', 'T'));
                            const end = item.end_time ? new Date(item.end_time.replace(' ', 'T')) : null;
                            const duration = end ? Math.floor((end.getTime() - start.getTime()) / 1000) : 0;
                            const { hours, minutes } = formatTime(duration);

                            return (
                                <View key={item.id} style={styles.historyItem}>
                                    <View style={styles.historyIcon}>
                                        <IconFire size={20} color={item.status === 'completed' ? '#E8503A' : '#666'} />
                                    </View>
                                    <View style={styles.historyInfo}>
                                        <View style={styles.historyHeader}>
                                            <Text style={styles.historyDate}>
                                                {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </Text>
                                            <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                                                <Text style={[styles.statusTabText, { color: item.status === 'completed' ? '#22c55e' : '#ef4444' }]}>
                                                    {item.status.toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.historyDetails}>
                                            Duration: {hours}h {minutes}m • Goal: {item.duration_hours}h
                                        </Text>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
            )}

            <Modal
                visible={isCreatingGroup}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsCreatingGroup(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Join or Create Group</Text>

                        <View style={styles.modalSection}>
                            <Text style={styles.modalSubLabel}>Join Existing Group</Text>
                            <TextInput
                                placeholder="Enter 6-digit code"
                                placeholderTextColor="#666"
                                style={styles.modalInput}
                                value={joinCode}
                                onChangeText={setJoinCode}
                                autoCapitalize="characters"
                                maxLength={6}
                            />
                            <TouchableOpacity
                                onPress={handleJoinGroup}
                                style={styles.modalButton}
                                disabled={isJoining}
                            >
                                {isJoining ? <ActivityIndicator color="#FFF" /> : <Text style={styles.modalButtonText}>Join Group</Text>}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalDivider} />

                        <View style={styles.modalSection}>
                            <Text style={styles.modalSubLabel}>Start New Community</Text>
                            <TextInput
                                placeholder="Group Name (e.g. Morning Prayer)"
                                placeholderTextColor="#666"
                                style={styles.modalInput}
                                value={groupName}
                                onChangeText={setGroupName}
                            />
                            <TextInput
                                placeholder="Brief Description"
                                placeholderTextColor="#666"
                                style={styles.modalInput}
                                value={groupDesc}
                                onChangeText={setGroupDesc}
                                multiline
                            />

                            <View style={styles.privacyRow}>
                                <Text style={styles.modalSubLabel}>Private Group (Invite Only)</Text>
                                <Switch
                                    value={isGroupPrivate}
                                    onValueChange={setIsGroupPrivate}
                                    trackColor={{ false: '#333', true: '#E8503A' }}
                                />
                            </View>

                            {isGroupPrivate && (
                                <Text style={styles.privacyNote}>* A unique 6-digit code will be generated for you to share.</Text>
                            )}

                            <TouchableOpacity
                                onPress={handleCreateGroup}
                                style={[styles.modalButton, { backgroundColor: '#333', marginTop: 10 }]}
                            >
                                <Text style={styles.modalButtonText}>Create Group</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => setIsCreatingGroup(false)} style={styles.modalClose}>
                            <IconClose size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={!!fastSummary}
                animationType="fade"
                transparent={true}
                onRequestClose={() => {
                    setFastSummary(null);
                    loadData();
                    setMainTab('history');
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { alignItems: 'center', paddingVertical: 40 }]}>
                        <View style={styles.summaryIconContainer}>
                            <IconCheck size={40} color="#FFF" />
                        </View>

                        <Text style={[styles.modalTitle, { marginBottom: 10 }]}>Fast Completed!</Text>
                        <Text style={styles.summarySubtext}>Well done! Your spirit is strengthened.</Text>

                        <View style={styles.summaryStatsBox}>
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryStatLabel}>Actual Time</Text>
                                <Text style={styles.summaryStatValue}>
                                    {Math.floor((fastSummary?.duration || 0) / 3600)}h {Math.floor(((fastSummary?.duration || 0) % 3600) / 60)}m
                                </Text>
                            </View>
                            <View style={styles.summaryDividerVertical} />
                            <View style={styles.summaryStat}>
                                <Text style={styles.summaryStatLabel}>Goal</Text>
                                <Text style={styles.summaryStatValue}>{fastSummary?.goal}h</Text>
                            </View>
                        </View>

                        <Text style={styles.summaryQuote}>
                            "Man shall not live by bread alone, but by every word that proceeds from the mouth of God."
                        </Text>

                        <TouchableOpacity
                            style={[styles.modalButton, { width: '100%', marginTop: 20 }]}
                            onPress={() => {
                                setFastSummary(null);
                                loadData();
                                setMainTab('history');
                            }}
                        >
                            <Text style={styles.modalButtonText}>View History</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );

    return selectedGroup ? renderGroupDetail(selectedGroup) : renderMainScreen();
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    fullScreenContainer: { flex: 1, backgroundColor: '#0D0D0D' },
    mainContent: { padding: 20, paddingTop: 60, paddingBottom: 100 },
    mainHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    backButton: { width: 40 },
    mainTitle: { fontSize: 24, fontWeight: '900', color: '#FFF' },
    headerPlus: { backgroundColor: '#222', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    startCard: { backgroundColor: '#161616', borderRadius: 24, padding: 24, alignItems: 'center' },
    startTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    durationValue: { color: '#E8503A', fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
    sliderContainer: { width: '100%', height: 40, justifyContent: 'center', marginVertical: 20 },
    sliderTrack: { height: 4, backgroundColor: '#333', borderRadius: 2, width: '100%' },
    sliderFill: { height: 4, backgroundColor: '#E8503A', borderRadius: 2, position: 'absolute' },
    sliderThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', position: 'absolute', justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2 },
    thumbInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E8503A' },
    optionsContainer: { width: '100%', marginTop: 20 },
    optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    optionLabel: { color: '#999', fontSize: 14 },
    reminderSelector: { flexDirection: 'row', gap: 10 },
    reminderBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#222' },
    reminderBtnActive: { backgroundColor: '#E8503A' },
    reminderText: { color: '#666', fontSize: 12 },
    reminderTextActive: { color: '#FFF' },
    startButton: { backgroundColor: '#E8503A', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30, marginTop: 10 },
    startButtonText: { color: '#FFF', fontWeight: 'bold' },
    activeCard: { backgroundColor: '#E8503A', borderRadius: 24, padding: 30, alignItems: 'center' },
    activeLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 'bold', marginBottom: 20 },
    timerRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 30 },
    timerBlock: { alignItems: 'center' },
    timerValue: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
    timerBlockLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
    timerDivider: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
    endButton: { backgroundColor: '#FFF', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
    endButtonText: { color: '#E8503A', fontWeight: 'bold' },
    groupsSection: { marginTop: 40 },
    sectionHeading: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
    groupItem: { backgroundColor: '#111', padding: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    groupName: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    groupDesc: { color: '#666', fontSize: 12, marginTop: 4 },
    joinBtn: { backgroundColor: '#222', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10 },
    joinBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 20, zIndex: 100 },
    modalContent: { backgroundColor: '#161616', borderRadius: 24, padding: 24, position: 'relative' },
    modalTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    modalInput: { backgroundColor: '#0D0D0D', borderRadius: 12, padding: 15, color: '#FFF', marginBottom: 15 },
    modalButton: { backgroundColor: '#E8503A', padding: 15, borderRadius: 12, alignItems: 'center' },
    modalButtonText: { color: '#FFF', fontWeight: 'bold' },
    modalDivider: { height: 1, backgroundColor: '#333', marginVertical: 20 },
    modalClose: { position: 'absolute', top: 20, right: 20 },
    groupHero: { height: 250, position: 'relative', justifyContent: 'flex-end' },
    heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#E8503A', opacity: 0.1 },
    heroHeader: { position: 'absolute', top: 60, left: 20 },
    heroIconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    heroBottom: { padding: 24 },
    heroTitle: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
    heroSubtext: { color: '#999', fontSize: 14, marginTop: 5 },
    tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#222' },
    tabButton: { flex: 1, paddingVertical: 15, alignItems: 'center' },
    activeTab: { borderBottomWidth: 2, borderBottomColor: '#E8503A' },
    tabText: { color: '#666', fontWeight: 'bold' },
    activeTabText: { color: '#FFF' },
    scrollContainer: { flex: 1 },
    infoContent: { padding: 20 },
    infoCard: { backgroundColor: '#111', padding: 20, borderRadius: 16, marginBottom: 20 },
    infoTitle: { color: '#FFF', fontWeight: 'bold', marginBottom: 10 },
    infoText: { color: '#999', lineHeight: 20 },
    infoMeta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 15 },
    metaLabel: { color: '#666', fontSize: 12 },
    leaveButton: { borderColor: '#ef4444', borderWidth: 1, padding: 15, borderRadius: 12, alignItems: 'center' },
    leaveButtonText: { color: '#ef4444', fontWeight: 'bold' },
    feedContent: { padding: 20 },
    postInput: { backgroundColor: '#111', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    avatarMini: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#333' },
    postInputText: { color: '#666' },
    postCard: { backgroundColor: '#111', borderRadius: 20, padding: 20, marginBottom: 20 },
    postHeader: { flexDirection: 'row', marginBottom: 15 },
    authorRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#FFF', fontWeight: 'bold' },
    authorName: { color: '#FFF', fontWeight: 'bold' },
    postTime: { color: '#666', fontSize: 12 },
    postBody: {},
    scriptureText: { color: '#DDD', lineHeight: 22, fontStyle: 'italic' },
    verseRecommendation: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 12, marginHorizontal: 20, marginBottom: 25, alignItems: 'center' },
    verseText: { color: '#FFF', fontSize: 13, fontStyle: 'italic', textAlign: 'center', lineHeight: 18, marginBottom: 5 },
    verseRef: { color: '#FFD35A', fontSize: 11, fontWeight: 'bold' },
    mainTabs: { flexDirection: 'row', backgroundColor: '#111', borderRadius: 12, padding: 4, marginBottom: 24 },
    mainTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    activeMainTab: { backgroundColor: '#222' },
    mainTabText: { color: '#666', fontWeight: 'bold', fontSize: 14 },
    activeMainTabText: { color: '#E8503A' },
    historySection: { gap: 16 },
    historyItem: { backgroundColor: '#111', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
    historyIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
    historyInfo: { flex: 1, gap: 4 },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    historyDate: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusTabText: { fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 },
    historyDetails: { color: '#666', fontSize: 13 },
    emptyHistory: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 16 },
    emptyHistoryText: { color: '#666', fontSize: 15 },
    emptyHistoryBtn: { backgroundColor: 'rgba(232, 80, 58, 0.1)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
    emptyHistoryBtnText: { color: '#E8503A', fontWeight: 'bold', fontSize: 14 },
    modalSection: { gap: 10 },
    modalSubLabel: { color: '#888', fontSize: 13, fontWeight: 'bold', marginBottom: 5 },
    privacyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    privacyNote: { color: '#666', fontSize: 11, fontStyle: 'italic', marginTop: 8 },
    codeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#333', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, marginTop: 15, gap: 10, alignSelf: 'flex-start' },
    codeBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 2 },
    summaryIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8503A', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    summarySubtext: { color: '#888', marginBottom: 30, textAlign: 'center' },
    summaryStatsBox: { flexDirection: 'row', backgroundColor: '#0D0D0D', borderRadius: 20, padding: 20, width: '100%', marginBottom: 30, alignItems: 'center' },
    summaryStat: { flex: 1, alignItems: 'center' },
    summaryStatLabel: { color: '#555', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 },
    summaryStatValue: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    summaryDividerVertical: { width: 1, height: 30, backgroundColor: '#222' },
    summaryQuote: { color: '#666', fontStyle: 'italic', textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
});
