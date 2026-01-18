import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { IconBible, IconMic } from '../Icons';
import { Tab } from '../../types';

const { width } = Dimensions.get('window');

interface QuickActionsProps {
    onNavigate: (screen: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <TouchableOpacity
                    style={[styles.actionCard, styles.bibleCard]}
                    onPress={() => onNavigate(Tab.BIBLE)}
                    activeOpacity={0.8}
                >
                    <View style={styles.iconCircle}>
                        <IconBible size={24} color="#FFFFFF" />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>Bible</Text>
                        <Text style={styles.cardSubtitle}>Study Word</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionCard, styles.recordCard]}
                    onPress={() => onNavigate(Tab.RECORD)}
                    activeOpacity={0.8}
                >
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                        <IconMic size={24} color="#3B82F6" />
                    </View>
                    <View>
                        <Text style={styles.cardTitle}>Record</Text>
                        <Text style={styles.cardSubtitle}>Sermon</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    actionCard: {
        flex: 1,
        height: 140,
        borderRadius: 24,
        padding: 20,
        justifyContent: 'space-between',
    },
    bibleCard: {
        backgroundColor: '#E8503A',
        shadowColor: '#E8503A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    recordCard: {
        backgroundColor: '#161616',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '600',
    },
});
