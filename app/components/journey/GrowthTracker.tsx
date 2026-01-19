import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { IconArrowLeft, IconFire, IconActivity, IconCheck } from '../Icons';

interface GrowthTrackerProps {
    onBack: () => void;
}

export const GrowthTracker: React.FC<GrowthTrackerProps> = ({ onBack }) => (
    <View style={styles.fullView}>
        <View style={styles.viewHeader}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <IconArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.viewTitle}>Growth Tracker</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Metric Cards */}
            <View style={styles.metricsGrid}>
                <View style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                        <Text style={styles.metricLabel}>CURRENT STREAK</Text>
                        <IconFire size={16} color="#F97316" />
                    </View>
                    <Text style={styles.metricValue}>12 <Text style={styles.metricUnit}>days</Text></Text>
                </View>

                <View style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                        <Text style={styles.metricLabel}>PRAYER TIME</Text>
                        <IconActivity size={16} color="#3B82F6" />
                    </View>
                    <Text style={styles.metricValue}>45 <Text style={styles.metricUnit}>min</Text></Text>
                </View>
            </View>

            {/* Milestones */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Milestones</Text>
                <View style={styles.milestoneCard}>
                    <View style={styles.milestoneIcon}>
                        <IconCheck size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.milestoneInfo}>
                        <Text style={styles.milestoneTitle}>7 Day Streak</Text>
                        <Text style={styles.milestoneDate}>Achieved Oct 24</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    </View>
);

const styles = StyleSheet.create({
    fullView: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 100,
    },
    viewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -8,
    },
    viewTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    metricsGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    metricCard: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    metricLabel: {
        fontSize: 12,
        color: '#999999',
        letterSpacing: 0.5,
    },
    metricValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    metricUnit: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#999999',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    milestoneCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(232, 80, 58, 0.2)',
    },
    milestoneIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8503A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    milestoneInfo: {
        flex: 1,
    },
    milestoneTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    milestoneDate: {
        fontSize: 12,
        color: '#999999',
    },
});
