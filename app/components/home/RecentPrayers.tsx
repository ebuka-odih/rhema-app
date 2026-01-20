import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconCheck } from '../Icons';

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

export const RecentPrayers: React.FC<RecentPrayersProps> = ({ prayers, onViewAll }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prayer Reminders</Text>
            <TouchableOpacity onPress={onViewAll}>
                <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.list}>
            {prayers.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No recent prayer reminders</Text>
                </View>
            ) : (
                prayers.slice(0, 3).map((prayer) => (
                    <TouchableOpacity key={prayer.id} style={styles.prayerCard}>
                        <View style={styles.iconContainer}>
                            <IconCheck size={16} color={prayer.status === 'answered' ? '#4CAF50' : '#666666'} />
                        </View>
                        <View style={styles.content}>
                            <Text style={styles.request} numberOfLines={1}>{prayer.request}</Text>
                            <Text style={styles.status}>
                                {prayer.status === 'answered' ? 'Answered' : 'Praying...'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </View>
    </View>
);

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
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    viewAll: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#E8503A',
    },
    list: {
        paddingHorizontal: 24,
        gap: 12,
    },
    prayerCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    request: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    status: {
        fontSize: 11,
        color: '#999999',
        marginTop: 2,
    },
    emptyCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    emptyText: {
        color: '#666666',
        fontSize: 14,
    },
});
