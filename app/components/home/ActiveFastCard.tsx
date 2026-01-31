import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconFire, IconClock } from '../Icons';
import { FastingSession } from '../../types';

interface ActiveFastCardProps {
    session: FastingSession;
    onPress?: () => void;
}

export const ActiveFastCard: React.FC<ActiveFastCardProps> = ({ session, onPress }) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (!session.start_time) return;

        const calculateElapsed = () => {
            const startTimeStr = session.start_time.includes(' ') ? session.start_time.replace(' ', 'T') : session.start_time;
            const start = new Date(startTimeStr).getTime();
            setElapsedSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
        };

        calculateElapsed();
        const interval = setInterval(calculateElapsed, 1000);
        return () => clearInterval(interval);
    }, [session.start_time]);

    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    const progress = Math.min(1, elapsedSeconds / (session.duration_hours * 3600));

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Current Fast</Text>
            </View>

            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={onPress}
            >
                <View style={styles.content}>
                    <View style={styles.iconBox}>
                        <IconFire size={24} color="#E8503A" />
                    </View>

                    <View style={styles.info}>
                        <Text style={styles.label}>You've been fasting for</Text>
                        <Text style={styles.timer}>
                            {hours.toString().padStart(2, '0')}:
                            {minutes.toString().padStart(2, '0')}:
                            {seconds.toString().padStart(2, '0')}
                        </Text>
                    </View>

                    <View style={styles.goalInfo}>
                        <Text style={styles.goalLabel}>Goal</Text>
                        <Text style={styles.goalValue}>{session.duration_hours}h</Text>
                    </View>
                </View>

                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    card: {
        marginHorizontal: 24,
        backgroundColor: '#1E1E1E',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(232, 80, 58, 0.2)',
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(232, 80, 58, 0.2)',
    },
    info: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: '#888888',
        fontWeight: '500',
        marginBottom: 4,
    },
    timer: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontVariant: ['tabular-nums'],
    },
    goalInfo: {
        alignItems: 'flex-end',
    },
    goalLabel: {
        fontSize: 10,
        color: '#666666',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    goalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E8503A',
    },
    progressContainer: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#E8503A',
        borderRadius: 3,
    },
});
