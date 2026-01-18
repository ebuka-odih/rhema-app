import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Switch, Dimensions } from 'react-native';
import {
    IconClock, IconPlus, IconChevronLeft, IconHeart,
    IconShare, IconDots, IconClose, IconFire, IconCheck
} from '../Icons';
import { FastingGroup } from '../../types';

const { width } = Dimensions.get('window');

// Mock types for the internal feed
interface FeedItem {
    id: string;
    user: {
        name: string;
        avatar_color: string;
    };
    type: 'scripture' | 'prayer' | 'milestone';
    content: string;
    meta?: string; // e.g., verse reference
    time: string;
    likes: number;
}

interface FastingProps {
    onBack: () => void;
}

export const Fasting: React.FC<FastingProps> = ({ onBack }) => {
    // Fasting Timer State
    const [isFasting, setIsFasting] = useState(false);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Navigation State
    const [selectedGroup, setSelectedGroup] = useState<FastingGroup | null>(null);
    const [activeGroupTab, setActiveGroupTab] = useState<'feed' | 'info'>('feed');

    // Mock Data
    const groups: FastingGroup[] = [
        { id: '1', name: '21 Days of Prayer', members: 1240, description: 'Annual church-wide fast.', joined: true },
        { id: '2', name: 'Youth Ministry Fast', members: 56, description: 'Wednesday partial fast.', joined: false },
        { id: '3', name: 'Leadership Team', members: 12, description: 'Preparing for the retreat.', joined: true },
    ];

    const groupFeed: FeedItem[] = [
        {
            id: '1',
            user: { name: 'Sarah Jenkins', avatar_color: '#A855F7' }, // Purple
            type: 'scripture',
            content: '“Is not this the kind of fasting I have chosen: to loose the chains of injustice and untie the cords of the yoke...”',
            meta: 'Isaiah 58:6',
            time: '2h ago',
            likes: 24
        },
        {
            id: '2',
            user: { name: 'Pastor Mike', avatar_color: '#3B82F6' }, // Blue
            type: 'milestone',
            content: 'Just completed Day 7! God is moving in incredible ways. Keep pressing in, family!',
            time: '4h ago',
            likes: 156
        },
        {
            id: '3',
            user: { name: 'David L.', avatar_color: '#F97316' }, // Orange
            type: 'prayer',
            content: 'Please join me in praying for clarity in my career direction during this fast.',
            time: '6h ago',
            likes: 12
        }
    ];

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isFasting) {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isFasting]);

    const handleStartFast = () => {
        setIsFasting(true);
        setStartTime(new Date());
        setElapsedSeconds(0);
    };

    const handleEndFast = () => {
        setIsFasting(false);
        setStartTime(null);
        setElapsedSeconds(0);
    };

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return { hours, minutes, seconds };
    };

    const timerDisplay = formatTime(elapsedSeconds);

    // --- Render Views ---

    const renderGroupInfoContent = (group: FastingGroup) => (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.infoContent}>
            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>About this Group</Text>
                <Text style={styles.infoText}>{group.description}</Text>
                <View style={styles.infoMeta}>
                    <IconClock size={14} color="#999999" />
                    <Text style={styles.metaLabel}>Created Oct 1, 2023</Text>
                </View>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Group Guidelines</Text>
                <View style={styles.guidelineRow}>
                    <View style={styles.dot} />
                    <Text style={styles.guidelineText}>Be respectful and encouraging to all members.</Text>
                </View>
                <View style={styles.guidelineRow}>
                    <View style={styles.dot} />
                    <Text style={styles.guidelineText}>Keep posts relevant to the fasting topic.</Text>
                </View>
                <View style={styles.guidelineRow}>
                    <View style={styles.dot} />
                    <Text style={styles.guidelineText}>Share your daily progress and prayer requests.</Text>
                </View>
            </View>

            <View style={styles.settingRow}>
                <View>
                    <Text style={styles.settingLabel}>Notifications</Text>
                    <Text style={styles.settingSub}>Receive updates from this group</Text>
                </View>
                <Switch
                    value={true}
                    trackColor={{ false: '#333', true: 'rgba(232, 80, 58, 0.5)' }}
                    thumbColor="#E8503A"
                />
            </View>

            <TouchableOpacity style={styles.leaveButton}>
                <Text style={styles.leaveButtonText}>Leave Group</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    const renderFeedContent = () => (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.feedContent}>
            {/* Post Input Placeholder */}
            <TouchableOpacity style={styles.postInput}>
                <View style={styles.avatarMini} />
                <Text style={styles.postInputText}>Share encouragement, scripture, or prayer...</Text>
            </TouchableOpacity>

            {groupFeed.map(item => (
                <View key={item.id} style={styles.postCard}>
                    {/* Header */}
                    <View style={styles.postHeader}>
                        <View style={styles.authorRow}>
                            <View style={[styles.avatar, { backgroundColor: item.user.avatar_color }]}>
                                <Text style={styles.avatarText}>{item.user.name.charAt(0)}</Text>
                            </View>
                            <View>
                                <Text style={styles.authorName}>{item.user.name}</Text>
                                <Text style={styles.postTime}>{item.time}</Text>
                            </View>
                        </View>
                        <TouchableOpacity><IconDots size={16} color="#666666" /></TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.postBody}>
                        {item.type === 'scripture' && (
                            <View style={styles.scriptureContainer}>
                                <Text style={styles.scriptureText}>"{item.content}"</Text>
                                <Text style={styles.scriptureMeta}>{item.meta}</Text>
                            </View>
                        )}
                        {item.type === 'milestone' && (
                            <View style={styles.milestoneBox}>
                                <IconFire size={18} color="#E8503A" />
                                <Text style={styles.milestoneText}>{item.content}</Text>
                            </View>
                        )}
                        {item.type === 'prayer' && (
                            <Text style={styles.prayerText}>{item.content}</Text>
                        )}
                    </View>

                    {/* Actions */}
                    <View style={styles.postActions}>
                        <TouchableOpacity style={styles.actionButton}>
                            <IconHeart size={16} color="#666666" />
                            <Text style={styles.actionText}>{item.likes}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton}>
                            <IconShare size={16} color="#666666" />
                            <Text style={styles.actionText}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </ScrollView>
    );

    const renderGroupDetail = (group: FastingGroup) => (
        <View style={styles.fullScreenContainer}>
            {/* Group Header */}
            <View style={styles.groupHero}>
                <View style={styles.heroOverlay} />
                <View style={styles.heroHeader}>
                    <TouchableOpacity
                        onPress={() => setSelectedGroup(null)}
                        style={styles.heroIconButton}
                    >
                        <IconChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.heroIconButton}>
                        <IconDots size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.heroBottom}>
                    <Text style={styles.heroTitle}>{group.name}</Text>
                    <View style={styles.heroSubRow}>
                        <Text style={styles.heroSubtext}>{group.members} Members</Text>
                        <View style={styles.dotSeparator} />
                        <Text style={styles.heroAccent}>{group.joined ? 'Joined' : 'Join Group'}</Text>
                    </View>
                </View>
            </View>

            {/* Action Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    onPress={() => setActiveGroupTab('feed')}
                    style={[styles.tabButton, activeGroupTab === 'feed' && styles.activeTab]}
                >
                    <Text style={[styles.tabText, activeGroupTab === 'feed' && styles.activeTabText]}>Community Feed</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveGroupTab('info')}
                    style={[styles.tabButton, activeGroupTab === 'info' && styles.activeTab]}
                >
                    <Text style={[styles.tabText, activeGroupTab === 'info' && styles.activeTabText]}>Group Info</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
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
                <TouchableOpacity style={styles.headerPlus}>
                    <IconPlus size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Active/Start Fast Card */}
            {!isFasting ? (
                <View style={styles.startCard}>
                    <View style={styles.startIconCircle}>
                        <IconClock size={32} color="#999999" />
                    </View>
                    <Text style={styles.startTitle}>Ready to Fast?</Text>
                    <Text style={styles.startSubtitle}>Select a preset or start a custom timer to begin your journey.</Text>

                    <TouchableOpacity
                        onPress={handleStartFast}
                        style={styles.startButton}
                    >
                        <Text style={styles.startButtonText}>Start Fast</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.activeCard}>
                    <IconClock size={32} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.activeLabel}>CURRENT FAST</Text>
                    <Text style={styles.activeTitle}>Custom Fast</Text>

                    <View style={styles.timerRow}>
                        <View style={styles.timerBlock}>
                            <Text style={styles.timerValue}>{timerDisplay.hours.toString().padStart(2, '0')}</Text>
                            <Text style={styles.timerBlockLabel}>Hours</Text>
                        </View>
                        <Text style={styles.timerDivider}>:</Text>
                        <View style={styles.timerBlock}>
                            <Text style={styles.timerValue}>{timerDisplay.minutes.toString().padStart(2, '0')}</Text>
                            <Text style={styles.timerBlockLabel}>Mins</Text>
                        </View>
                        <Text style={styles.timerDivider}>:</Text>
                        <View style={styles.timerBlock}>
                            <Text style={styles.timerValue}>{timerDisplay.seconds.toString().padStart(2, '0')}</Text>
                            <Text style={styles.timerBlockLabel}>Secs</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleEndFast}
                        style={styles.endButton}
                    >
                        <Text style={styles.endButtonText}>End Fast</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Groups List */}
            <View style={styles.groupsSection}>
                <Text style={styles.sectionHeading}>Community Groups</Text>
                <View style={styles.groupList}>
                    {groups.map(group => (
                        <TouchableOpacity
                            key={group.id}
                            onPress={() => {
                                setSelectedGroup(group);
                                setActiveGroupTab('feed');
                            }}
                            style={styles.groupItem}
                        >
                            <View style={styles.groupInfoCol}>
                                <Text style={styles.groupName}>{group.name}</Text>
                                <Text style={styles.groupDesc} numberOfLines={1}>{group.description}</Text>
                                <View style={styles.memberCountBadge}>
                                    <Text style={styles.memberCountText}>{group.members} members</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={[
                                    styles.joinBtn,
                                    group.joined ? styles.joinedBtn : styles.notJoinedBtn
                                ]}
                            >
                                <Text style={[
                                    styles.joinBtnText,
                                    group.joined ? styles.joinedBtnText : styles.notJoinedBtnText
                                ]}>
                                    {group.joined ? 'Joined' : 'Join'}
                                </Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );

    return selectedGroup ? renderGroupDetail(selectedGroup) : renderMainScreen();
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    mainContent: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 100,
    },
    mainHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    headerPlus: {
        backgroundColor: '#222',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        flex: 1,
    },
    infoContent: {
        padding: 24,
        paddingBottom: 100,
    },
    infoCard: {
        backgroundColor: '#161616',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 24,
    },
    infoTitle: {
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontSize: 16,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#999999',
        lineHeight: 20,
        marginBottom: 16,
    },
    infoMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaLabel: {
        fontSize: 12,
        color: '#666666',
    },
    guidelineRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 12,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E8503A',
        marginTop: 6,
    },
    guidelineText: {
        flex: 1,
        fontSize: 14,
        color: '#999999',
        lineHeight: 20,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#161616',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 24,
    },
    settingLabel: {
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontSize: 14,
    },
    settingSub: {
        fontSize: 12,
        color: '#666666',
    },
    leaveButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        alignItems: 'center',
    },
    leaveButtonText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: 'bold',
    },
    feedContent: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        paddingBottom: 100,
    },
    postInput: {
        backgroundColor: '#161616',
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 24,
    },
    avatarMini: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#333',
    },
    postInputText: {
        color: '#666666',
        fontSize: 14,
        flex: 1,
    },
    postCard: {
        backgroundColor: '#161616',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 24,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    authorName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    postTime: {
        fontSize: 12,
        color: '#666666',
    },
    postBody: {
        marginBottom: 16,
    },
    scriptureContainer: {
        paddingLeft: 16,
        borderLeftWidth: 2,
        borderLeftColor: '#FFD35A',
        marginBottom: 8,
    },
    scriptureText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#D1D5DB',
        lineHeight: 22,
    },
    scriptureMeta: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFD35A',
        marginTop: 4,
    },
    milestoneBox: {
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    milestoneText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
        flex: 1,
    },
    prayerText: {
        fontSize: 14,
        color: '#D1D5DB',
        lineHeight: 22,
    },
    postActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionText: {
        fontSize: 12,
        color: '#666666',
    },
    groupHero: {
        height: 200,
        backgroundColor: '#1A1A1A',
        position: 'relative',
        justifyContent: 'space-between',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(232, 80, 58, 0.05)',
    },
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 48,
    },
    heroIconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroBottom: {
        padding: 24,
        backgroundColor: 'rgba(13, 13, 13, 0.6)',
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    heroSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    heroSubtext: {
        fontSize: 14,
        color: '#999999',
    },
    dotSeparator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#666',
    },
    heroAccent: {
        fontSize: 14,
        color: '#FFD35A',
        fontWeight: 'bold',
    },
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 24,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#E8503A',
    },
    tabText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666666',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    startCard: {
        backgroundColor: '#161616',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 32,
    },
    startIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#0D0D0D',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    startTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    startSubtitle: {
        fontSize: 14,
        color: '#999999',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
        maxWidth: 240,
    },
    startButton: {
        backgroundColor: '#E8503A',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 24,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    activeCard: {
        backgroundColor: '#E8503A',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#E8503A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    activeLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.7)',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    activeTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 24,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    timerBlock: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 64,
    },
    timerValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    timerBlockLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    timerDivider: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    endButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    endButtonText: {
        color: '#E8503A',
        fontWeight: 'bold',
        fontSize: 13,
    },
    groupsSection: {
        marginBottom: 32,
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    groupList: {
        gap: 16,
    },
    groupItem: {
        backgroundColor: '#161616',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    groupInfoCol: {
        flex: 1,
    },
    groupName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    groupDesc: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 8,
    },
    memberCountBadge: {
        backgroundColor: '#222',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    memberCountText: {
        fontSize: 10,
        color: '#999999',
        fontWeight: 'bold',
    },
    joinBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    notJoinedBtn: {
        backgroundColor: '#FFFFFF',
    },
    joinedBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#444',
    },
    joinBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    notJoinedBtnText: {
        color: '#000000',
    },
    joinedBtnText: {
        color: '#666666',
    },
});
