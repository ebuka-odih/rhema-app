import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRecording } from '../../context/RecordingContext';
import { IconMic } from '../Icons';

interface GlobalRecordingBarProps {
    onPress: () => void;
}

export const GlobalRecordingBar: React.FC<GlobalRecordingBarProps> = ({ onPress }) => {
    const { isRecording, duration } = useRecording();
    const pulseAnim = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        if (isRecording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 0.6,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(0.6);
        }
    }, [isRecording]);

    if (!isRecording) return null;

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={styles.container}
        >
            <View style={styles.leftSection}>
                <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
                <Text style={styles.label}>Sermon Recording Active</Text>
            </View>
            <View style={styles.rightSection}>
                <Text style={styles.timer}>{formatTime(duration)}</Text>
                <View style={styles.micIcon}>
                    <IconMic size={14} color="#FFFFFF" />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#E8503A',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 12,
        shadowColor: '#E8503A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
    },
    label: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 0.3,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    timer: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '900',
        fontVariant: ['tabular-nums'],
    },
    micIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
