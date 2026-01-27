import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconCheck, IconClock } from '../Icons';

interface Prayer {
    id: number | string;
    request: string;
    status: string;
    time: string;
}

interface RecentPrayersProps {
    prayers: Prayer[];
    onViewAll?: () => void;
}



export const RecentPrayers: React.FC<RecentPrayersProps> = ({ prayers, onViewAll }) => {
    // Only show active prayers on the homepage
    const displayPrayers = prayers
        .filter(p => p.status !== 'done' && p.status !== 'answered')
        .slice(0, 3);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Prayer Reminders</Text>
                <TouchableOpacity onPress={onViewAll}>
                    <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.list}>
                {displayPrayers.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No active prayer reminders</Text>
                    </View>
                ) : (
                    displayPrayers.map((prayer) => {
                        const isDone = prayer.status === 'done' || prayer.status === 'answered';
                        return (
                            <TouchableOpacity
                                key={prayer.id}
                                style={[
                                    styles.prayerCard,
                                    isDone && styles.prayerCardDone
                                ]}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.iconBox,
                                    isDone ? styles.iconBoxDone : styles.iconBoxActive
                                ]}>
                                    {isDone ? (
                                        <IconCheck size={18} color="#4CAF50" />
                                    ) : (
                                        <IconClock size={18} color="#E8503A" />
                                    )}
                                </View>

                                <View style={styles.content}>
                                    <Text
                                        style={[
                                            styles.requestText,
                                            isDone && styles.requestTextDone
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {prayer.request}
                                    </Text>
                                    <Text style={styles.timeText}>
                                        {prayer.time || 'Daily'}
                                    </Text>
                                </View>

                                {/* Status Badge */}
                                <View style={[
                                    styles.statusBadge,
                                    isDone ? styles.statusBadgeDone : styles.statusBadgeActive
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        isDone ? styles.statusTextDone : styles.statusTextActive
                                    ]}>
                                        {isDone ? 'Done' : 'Active'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    viewAll: {
        fontSize: 12,
        fontWeight: '600',
        color: '#E8503A',
        letterSpacing: 0.5,
    },
    list: {
        paddingHorizontal: 24,
        gap: 12,
    },
    prayerCard: {
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        padding: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    prayerCardDone: {
        backgroundColor: 'rgba(30, 30, 30, 0.5)',
        borderColor: 'rgba(255, 255, 255, 0.03)',
        shadowOpacity: 0,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBoxActive: {
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(232, 80, 58, 0.2)',
    },
    iconBoxDone: {
        backgroundColor: 'rgba(76, 175, 80, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.1)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    requestText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
        letterSpacing: 0.2,
    },
    requestTextDone: {
        color: '#777777',
        textDecorationLine: 'line-through',
    },
    timeText: {
        fontSize: 12,
        color: '#888888',
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusBadgeActive: {
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        borderColor: 'rgba(232, 80, 58, 0.3)',
    },
    statusBadgeDone: {
        backgroundColor: 'rgba(76, 175, 80, 0.05)',
        borderColor: 'rgba(76, 175, 80, 0.2)',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    statusTextActive: {
        color: '#E8503A',
    },
    statusTextDone: {
        color: '#4CAF50',
    },
    emptyCard: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 16,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#333',
    },
    emptyText: {
        color: '#666666',
        fontSize: 14,
        fontWeight: '500',
    },
});
