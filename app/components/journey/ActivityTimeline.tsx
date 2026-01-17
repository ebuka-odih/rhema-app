import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { IconArrowLeft, IconCalendar, IconPen, IconMic, IconActivity, IconClose } from '../Icons';
import { ActivityItem } from '../../types';

interface ActivityTimelineProps {
    onBack: () => void;
    activities: ActivityItem[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ onBack, activities }) => (
    <View style={styles.fullView}>
        <View style={styles.viewHeader}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <IconArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.viewTitle}>Activity Timeline</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.timelineList}>
                {activities.map((item, idx) => (
                    <View key={idx} style={styles.timelineRow}>
                        <View style={styles.timelineIconContainer}>
                            <View style={styles.timelineIconCircle}>
                                {item.type === 'devotion' && <IconCalendar size={14} color="#FFFFFF" />}
                                {item.type === 'journal' && <IconPen size={14} color="#FFFFFF" />}
                                {item.type === 'sermon' && <IconMic size={14} color="#FFFFFF" />}
                                {item.type === 'prayer' && <IconActivity size={14} color="#FFFFFF" />}
                                {item.type === 'fasting' && <IconClose size={14} color="#FFFFFF" />}
                            </View>
                            {idx !== activities.length - 1 && <View style={styles.timelineLine} />}
                        </View>
                        <View style={styles.timelineItemContent}>
                            <Text style={styles.timelineItemTitle}>{item.title}</Text>
                            <Text style={styles.timelineItemTime}>{item.timestamp}</Text>
                        </View>
                    </View>
                ))}
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
    timelineList: {
        gap: 24,
    },
    timelineRow: {
        flexDirection: 'row',
        gap: 16,
    },
    timelineIconContainer: {
        alignItems: 'center',
    },
    timelineIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 4,
    },
    timelineItemContent: {
        flex: 1,
        paddingBottom: 24,
    },
    timelineItemTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    timelineItemTime: {
        fontSize: 12,
        color: '#999999',
    },
});
