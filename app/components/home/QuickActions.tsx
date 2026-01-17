import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconBible, IconPlay, IconMic } from '../Icons';

interface QuickActionsProps {
    onNavigate: (screen: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => (
    <View style={styles.quickActions}>
        {/* Start Devotional */}
        <TouchableOpacity
            style={styles.primaryAction}
            onPress={() => onNavigate('BIBLE')}
        >
            <View style={styles.primaryActionBg}>
                <IconBible size={100} color="rgba(255, 255, 255, 0.1)" />
            </View>

            <View style={styles.primaryActionIcon}>
                <IconPlay size={24} color="#FFFFFF" />
            </View>

            <View style={styles.primaryActionContent}>
                <Text style={styles.primaryActionTitle}>Start Devotional</Text>
                <Text style={styles.primaryActionSubtitle}>Daily Reading</Text>
            </View>
        </TouchableOpacity>

        {/* Sermons */}
        <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => onNavigate('RECORD')}
        >
            <View style={styles.secondaryActionGlow} />

            <View style={styles.secondaryActionIcon}>
                <IconMic size={24} color="#3B82F6" />
            </View>

            <View style={styles.secondaryActionContent}>
                <Text style={styles.secondaryActionTitle}>Sermons</Text>
                <Text style={styles.secondaryActionSubtitle}>Library & Recording</Text>
            </View>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    quickActions: {
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 24,
        marginBottom: 32,
        height: 160,
    },
    primaryAction: {
        flex: 1,
        backgroundColor: '#E8503A',
        borderRadius: 24,
        padding: 20,
        justifyContent: 'space-between',
        overflow: 'hidden',
        shadowColor: '#E8503A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryActionBg: {
        position: 'absolute',
        right: -16,
        top: -16,
        transform: [{ rotate: '12deg' }],
    },
    primaryActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryActionContent: {
        zIndex: 10,
    },
    primaryActionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    primaryActionSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
    },
    secondaryAction: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        padding: 20,
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    secondaryActionGlow: {
        position: 'absolute',
        bottom: -32,
        right: -32,
        width: 128,
        height: 128,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderRadius: 64,
    },
    secondaryActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    secondaryActionContent: {
        zIndex: 10,
    },
    secondaryActionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    secondaryActionSubtitle: {
        fontSize: 12,
        color: '#999999',
    },
});
