import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sermon } from '../../types/sermon';
import { IconMic, IconCalendar, IconChevronRight } from '../Icons';

interface SermonCardProps {
    sermon: Sermon;
    onPress: () => void;
}

export const SermonCard: React.FC<SermonCardProps> = ({ sermon, onPress }) => (
    <TouchableOpacity
        style={styles.sermonCard}
        onPress={onPress}
    >
        <View style={styles.sermonCardContent}>
            <View style={styles.sermonIcon}>
                <IconMic size={20} color="#E8503A" />
            </View>
            <View style={styles.sermonInfo}>
                <Text style={styles.sermonTitle}>{sermon.title}</Text>
                <View style={styles.sermonMeta}>
                    <IconCalendar size={12} color="#999999" />
                    <Text style={styles.sermonDate}>{sermon.date}</Text>
                    <Text style={styles.sermonDot}>•</Text>
                    <Text style={styles.sermonDuration}>{sermon.duration}</Text>
                </View>
            </View>
            <IconChevronRight size={20} color="#666666" />
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    sermonCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    sermonCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sermonIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sermonInfo: {
        flex: 1,
        gap: 4,
    },
    sermonTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    sermonMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    sermonDate: {
        fontSize: 12,
        color: '#999999',
    },
    sermonDot: {
        fontSize: 12,
        color: '#333333',
    },
    sermonDuration: {
        fontSize: 12,
        color: '#999999',
    },
});
