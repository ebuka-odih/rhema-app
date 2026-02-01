import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconPen, IconActivity, IconClock } from '../Icons';

interface QuickActionsSectionProps {
    onNewReflection: () => void;
    onLogPrayer: () => void;
    onViewFasting: () => void;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
    onNewReflection,
    onLogPrayer,
    onViewFasting
}) => {
    return (
        <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionCard} onPress={onNewReflection}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#3B82F6' }]}>
                    <IconPen size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Reflect</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={onLogPrayer}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#F59E0B' }]}>
                    <IconActivity size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Pray</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={onViewFasting}>
                <View style={[styles.actionIconContainer, { backgroundColor: '#EF4444' }]}>
                    <IconClock size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Fasting</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        gap: 12,
    },
    actionCard: {
        flex: 1,
        backgroundColor: '#0D0D0D',
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.04)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    actionIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: -0.2,
    },
});
