import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { IconChevronLeft, IconChevronRight, IconPlay } from '../Icons';

interface FloatingControlsProps {
    onPrev: () => void;
    onNext: () => void;
    onPlay?: () => void;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
    onPrev,
    onNext,
    onPlay
}) => (
    <View style={styles.floatingControls}>
        <TouchableOpacity
            onPress={onPrev}
            style={styles.floatingBtn}
        >
            <IconChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.playBtn} onPress={onPlay}>
            <IconPlay size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
            onPress={onNext}
            style={styles.floatingBtn}
        >
            <IconChevronRight size={24} color="#FFFFFF" />
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    floatingControls: {
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 24,
    },
    floatingBtn: {
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
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
