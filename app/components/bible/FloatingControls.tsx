import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { IconChevronLeft, IconChevronRight, IconPlay } from '../Icons';

interface FloatingControlsProps {
    onPrev: () => void;
    onNext: () => void;
    onPlay?: () => void;
    isPro?: boolean;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
    onPrev,
    onNext,
    onPlay,
    isPro = false
}) => (
    <View style={styles.floatingControls}>
        <TouchableOpacity
            onPress={onPrev}
            style={styles.floatingBtn}
        >
            <IconChevronLeft size={28} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>

        {isPro && (
            <TouchableOpacity style={styles.playBtn} onPress={onPlay}>
                <IconPlay size={32} color="#FFFFFF" fill="#FFFFFF" />
            </TouchableOpacity>
        )}

        <TouchableOpacity
            onPress={onNext}
            style={styles.floatingBtn}
        >
            <IconChevronRight size={28} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    floatingControls: {
        position: 'absolute',
        bottom: 32, // Slightly higher for comfort
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    floatingBtn: {
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        width: 60, // Slightly larger for easier reach
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    playBtn: {
        backgroundColor: '#E8503A',
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#E8503A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
});
