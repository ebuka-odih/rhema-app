import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconFire } from '../Icons';

interface DashboardSectionProps {
    onViewGrowth: () => void;
    journalEntriesCount: number;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ onViewGrowth, journalEntriesCount }) => {
    return (
        <View style={styles.dashboardContainer}>
            <TouchableOpacity
                style={styles.streakCard}
                onPress={onViewGrowth}
                activeOpacity={0.9}
            >
                <View style={styles.streakHeader}>
                    <View style={styles.streakHeaderLeft}>
                        <View style={styles.fireIconContainer}>
                            <IconFire size={20} color="#FFFFFF" />
                        </View>
                        <View>
                            <Text style={styles.streakTitle}>Consistency</Text>
                            <Text style={styles.streakSubtitle}>Keep your spirit active</Text>
                        </View>
                    </View>
                    <View style={styles.streakBadge}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.streakBadgeText}>ON TRACK</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>-</Text>
                        <Text style={styles.statLabel}>Days</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{journalEntriesCount}</Text>
                        <Text style={styles.statLabel}>Notes</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>-</Text>
                        <Text style={styles.statLabel}>Fasts</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    dashboardContainer: {
        marginBottom: 32,
    },
    streakCard: {
        backgroundColor: '#111111',
        borderRadius: 28,
        padding: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.03)',
    },
    streakHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
    },
    streakHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingLeft: 4,
    },
    fireIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#E8503A',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#E8503A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    streakTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    streakSubtitle: {
        fontSize: 13,
        color: '#666666',
        fontWeight: '500',
    },
    streakBadge: {
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    streakBadgeText: {
        color: '#E8503A',
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    pulseDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
        marginRight: 6,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        padding: 20,
        borderRadius: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 10,
        color: '#555555',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
});
