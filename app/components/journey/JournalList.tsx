import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { IconArrowLeft, IconPlus } from '../Icons';
import { JournalEntry } from '../../types';

interface JournalListProps {
    entries: JournalEntry[];
    onBack: () => void;
    onSelectEntry: (entry: JournalEntry) => void;
    onNewReflection: () => void;
}

export const JournalList: React.FC<JournalListProps> = ({
    entries,
    onBack,
    onSelectEntry,
    onNewReflection
}) => (
    <View style={styles.fullView}>
        <View style={styles.viewHeader}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <IconArrowLeft size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.viewTitle}>Reflections</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.entriesList}>
                {entries.map(entry => (
                    <TouchableOpacity
                        key={entry.id}
                        style={styles.entryCard}
                        onPress={() => onSelectEntry(entry)}
                    >
                        <View style={styles.entryHeader}>
                            <Text style={styles.entryCategory}>{entry.category}</Text>
                            <Text style={styles.entryDate}>{entry.date}</Text>
                        </View>
                        <Text style={styles.entryTitle}>{entry.title}</Text>
                        <Text style={styles.entryPreview} numberOfLines={2}>{entry.content}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>

        <TouchableOpacity
            style={styles.fab}
            onPress={onNewReflection}
        >
            <IconPlus size={24} color="#FFFFFF" />
        </TouchableOpacity>
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
    entriesList: {
        gap: 12,
    },
    entryCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FFD35A',
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    entryCategory: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFD35A',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    entryDate: {
        fontSize: 12,
        color: '#999999',
    },
    entryTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    entryPreview: {
        fontSize: 12,
        color: '#999999',
        lineHeight: 18,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E8503A',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#E8503A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
});
