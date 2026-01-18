import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Switch } from 'react-native';
import { IconClock, IconPlus, IconChevronLeft, IconDots, IconCheck, IconShare, IconHeart } from '../Icons';

type FastingView = 'DASHBOARD' | 'ACTIVE' | 'GROUP_DETAIL';

interface FastingProps {
    onBack: () => void;
}

export const Fasting: React.FC<FastingProps> = ({ onBack }) => {
    const [view, setView] = useState<FastingView>('DASHBOARD');
    const [isFasting, setIsFasting] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'FEED' | 'INFO'>('FEED');

    const groups = [
        { id: '1', title: '21 Days of Prayer', subtext: 'Annual church-wide fast.', members: '1240', joined: true },
        { id: '2', title: 'Youth Ministry Fast', subtext: 'Wednesday partial fast.', members: '450', joined: false },
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isFasting) {
            interval = setInterval(() => {
                setElapsedSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isFasting]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return {
            h: hours.toString().padStart(2, '0'),
            m: minutes.toString().padStart(2, '0'),
            s: seconds.toString().padStart(2, '0')
        };
    };

    const renderDashboard = () => (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconChevronLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Fasting</Text>
                <TouchableOpacity style={styles.headerAction}>
                    <IconPlus size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Fasting Card */}
            <View style={styles.card}>
                <View style={styles.clockIconContainer}>
                    <IconClock size={32} color="#999999" />
                </View>
                <Text style={styles.cardTitle}>Ready to Fast?</Text>
                <Text style={styles.cardSubtitle}>Select a preset or start a custom timer to begin your journey.</Text>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                        setIsFasting(true);
                        setView('ACTIVE');
                    }}
                >
                    <Text style={styles.primaryButtonText}>Start Fast</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Community Groups</Text>
            {groups.map(group => (
                <TouchableOpacity
                    key={group.id}
                    style={styles.groupCard}
                    onPress={() => {
                        setSelectedGroup(group);
                        setView('GROUP_DETAIL');
                    }}
                >
                    <View style={styles.groupInfo}>
                        <Text style={styles.groupTitle}>{group.title}</Text>
                        <Text style={styles.groupSubtext}>{group.subtext}</Text>
                        <View style={styles.memberBadge}>
                            <Text style={styles.memberText}>{group.members} members</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={[styles.joinButton, group.joined && styles.joinedButton]}>
                        <Text style={[styles.joinButtonText, group.joined && styles.joinedButtonText]}>
                            {group.joined ? 'Joined' : 'Join'}
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderActiveFast = () => {
        const time = formatTime(elapsedSeconds);
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setView('DASHBOARD')} style={styles.backButton}>
                        <IconChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Fasting</Text>
                    <TouchableOpacity style={styles.headerAction}>
                        <IconPlus size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, styles.activeCard]}>
                    <IconClock size={32} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.activeLabel}>CURRENT FAST</Text>
                    <Text style={styles.activeTitle}>Custom Fast</Text>

                    <View style={styles.timerRow}>
                        <View style={styles.timerBlock}>
                            <Text style={styles.timerValue}>{time.h}</Text>
                            <Text style={styles.timerLabel}>Hours</Text>
                        </View>
                        <Text style={styles.timerColon}>:</Text>
                        <View style={styles.timerBlock}>
                            <Text style={styles.timerValue}>{time.m}</Text>
                            <Text style={styles.timerLabel}>Mins</Text>
                        </View>
                        <Text style={styles.timerColon}>:</Text>
                        <View style={styles.timerBlock}>
                            <Text style={styles.timerValue}>{time.s}</Text>
                            <Text style={styles.timerLabel}>Secs</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => {
                            setIsFasting(false);
                            setElapsedSeconds(0);
                            setView('DASHBOARD');
                        }}
                    >
                        <Text style={styles.secondaryButtonText}>End Fast</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Community Groups</Text>
                {/* Simplified list check */}
                <View style={{ opacity: 0.5 }}>
                    {groups.slice(0, 1).map(group => (
                        <View key={group.id} style={styles.groupCard}>
                            <View style={styles.groupInfo}>
                                <Text style={styles.groupTitle}>{group.title}</Text>
                                <Text style={styles.groupSubtext}>{group.subtext}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderGroupDetail = () => {
        if (!selectedGroup) return null;
        return (
            <View style={styles.container}>
                <View style={styles.groupHero}>
                    <View style={styles.groupHeader}>
                        <TouchableOpacity onPress={() => setView('DASHBOARD')} style={styles.backButton}>
                            <IconChevronLeft size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerAction}>
                            <IconDots size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.groupHeroContent}>
                        <Text style={styles.groupHeroTitle}>{selectedGroup.title}</Text>
                        <Text style={styles.groupHeroStats}>{selectedGroup.members} Members • Joined</Text>
                    </View>
                </View>

                <View style={styles.tabsRow}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'FEED' && styles.activeTab]}
                        onPress={() => setActiveTab('FEED')}
                    >
                        <Text style={[styles.tabText, activeTab === 'FEED' && styles.activeTabText]}>Community Feed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'INFO' && styles.activeTab]}
                        onPress={() => setActiveTab('INFO')}
                    >
                        <Text style={[styles.tabText, activeTab === 'INFO' && styles.activeTabText]}>Group Info</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'FEED' ? (
                    <ScrollView style={styles.feedScroll} showsVerticalScrollIndicator={false}>
                        <View style={styles.postInput}>
                            <View style={styles.avatarPlaceholder} />
                            <Text style={styles.postInputText}>Share encouragement, scripture, or prayer...</Text>
                        </View>

                        <View style={styles.postCard}>
                            <View style={styles.postHeader}>
                                <View style={styles.postAvatar}><Text style={styles.avatarText}>S</Text></View>
                                <View>
                                    <Text style={styles.postAuthor}>Sarah Jenkins</Text>
                                    <Text style={styles.postTime}>2h ago</Text>
                                </View>
                                <TouchableOpacity style={styles.postMore}><IconDots size={18} color="#666666" /></TouchableOpacity>
                            </View>
                            <View style={styles.postContent}>
                                <View style={styles.quoteLine} />
                                <View style={styles.quoteContent}>
                                    <Text style={styles.quoteText}>"Is not this the kind of fasting I have chosen: to loose the chains of injustice and untie the cords of the yoke..."</Text>
                                    <Text style={styles.quoteRef}>Isaiah 58:6</Text>
                                </View>
                            </View>
                            <View style={styles.postActions}>
                                <TouchableOpacity style={styles.postAction}>
                                    <IconHeart size={18} color="#666666" />
                                    <Text style={styles.actionCount}>24</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.postAction}>
                                    <IconShare size={18} color="#666666" />
                                    <Text style={styles.actionCount}>Share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.postCard}>
                            <View style={styles.postHeader}>
                                <View style={[styles.postAvatar, { backgroundColor: '#3B82F6' }]}><Text style={styles.avatarText}>M</Text></View>
                                <View>
                                    <Text style={styles.postAuthor}>Pastor Mike</Text>
                                    <Text style={styles.postTime}>4h ago</Text>
                                </View>
                                <TouchableOpacity style={styles.postMore}><IconDots size={18} color="#666666" /></TouchableOpacity>
                            </View>
                            <View style={styles.postContent}>
                                <Text style={styles.textContent}>Remember to keep your hearts focused on the Lord during this season of sacrifice. He is our true bread.</Text>
                            </View>
                            <View style={styles.postActions}>
                                <TouchableOpacity style={styles.postAction}>
                                    <IconHeart size={18} color="#666666" />
                                    <Text style={styles.actionCount}>56</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.postAction}>
                                    <IconShare size={18} color="#666666" />
                                    <Text style={styles.actionCount}>Share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                ) : (
                    <ScrollView style={styles.feedScroll} showsVerticalScrollIndicator={false}>
                        <View style={styles.infoSection}>
                            <Text style={styles.infoTitle}>About this Group</Text>
                            <Text style={styles.infoText}>{selectedGroup.subtext}</Text>
                            <View style={styles.infoMeta}>
                                <IconClock size={16} color="#666666" />
                                <Text style={styles.metaLabel}>Created Oct 1, 2023</Text>
                            </View>
                        </View>

                        <View style={styles.infoSection}>
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
                            <Switch value={true} trackColor={{ true: '#E8503A' }} />
                        </View>
                    </ScrollView>
                )}
            </View>
        );
    };

    return (
        <View style={styles.mainWrapper}>
            {view === 'DASHBOARD' && renderDashboard()}
            {view === 'ACTIVE' && renderActiveFast()}
            {view === 'GROUP_DETAIL' && renderGroupDetail()}
        </View>
    );
};

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerAction: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#161616',
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
        marginBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    clockIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 12,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#999999',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    primaryButton: {
        backgroundColor: '#E8503A',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 16,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    groupCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#161616',
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    groupInfo: {
        flex: 1,
    },
    groupTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    groupSubtext: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 8,
    },
    memberBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    memberText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#999999',
    },
    joinButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
    },
    joinedButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    joinButtonText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#000000',
    },
    joinedButtonText: {
        color: '#FFFFFF',
    },
    // Active View
    activeCard: {
        backgroundColor: '#E8503A',
        borderColor: 'transparent',
    },
    activeLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 16,
        letterSpacing: 1.5,
    },
    activeTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 32,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 32,
    },
    timerBlock: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        width: 70,
        height: 70,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    timerLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '600',
        marginTop: 2,
    },
    timerColon: {
        fontSize: 24,
        fontWeight: '900',
        color: 'rgba(255, 255, 255, 0.3)',
        marginBottom: 16,
    },
    secondaryButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 20,
    },
    secondaryButtonText: {
        color: '#E8503A',
        fontWeight: '800',
        fontSize: 14,
    },
    // Group Detail Hero
    groupHero: {
        height: 200,
        justifyContent: 'space-between',
        paddingBottom: 24,
        marginBottom: 8,
    },
    groupHeroContent: {
        marginTop: 'auto',
    },
    groupHeroTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    groupHeroStats: {
        fontSize: 14,
        color: '#FFD35A',
        fontWeight: '700',
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tabsRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 20,
    },
    tab: {
        paddingVertical: 12,
        paddingRight: 24,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#E8503A',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#666666',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    feedScroll: {
        flex: 1,
    },
    postInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#161616',
        borderRadius: 16,
        padding: 12,
        marginBottom: 24,
        gap: 12,
    },
    avatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2A2A2A',
    },
    postInputText: {
        fontSize: 14,
        color: '#666666',
        fontWeight: '500',
    },
    postCard: {
        backgroundColor: '#161616',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    postAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8503A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    postAuthor: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    postTime: {
        fontSize: 12,
        color: '#666666',
    },
    postMore: {
        marginLeft: 'auto',
    },
    postContent: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    quoteLine: {
        width: 3,
        backgroundColor: '#FFD35A',
        marginRight: 12,
        borderRadius: 1.5,
    },
    quoteContent: {
        flex: 1,
    },
    quoteText: {
        fontSize: 15,
        color: '#FFFFFF',
        lineHeight: 22,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    quoteRef: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFD35A',
    },
    textContent: {
        fontSize: 15,
        color: '#FFFFFF',
        lineHeight: 22,
    },
    postActions: {
        flexDirection: 'row',
        gap: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        paddingTop: 16,
    },
    postAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionCount: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666666',
    },
    // Info styling
    infoSection: {
        backgroundColor: '#161616',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 12,
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
        fontSize: 13,
        color: '#666666',
        fontWeight: '500',
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
        color: '#FFFFFF',
        lineHeight: 20,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#161616',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    settingSub: {
        fontSize: 12,
        color: '#666666',
    }
});
