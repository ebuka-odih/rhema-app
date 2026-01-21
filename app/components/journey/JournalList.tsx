import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.entriesList}>
                {entries.map((entry, index) => (
                    <TouchableOpacity
                        key={entry.id}
                        style={[
                            styles.entryItem,
                            index === entries.length - 1 && { borderBottomWidth: 0 }
                        ]}
                        onPress={() => onSelectEntry(entry)}
                    >
                        <Text style={styles.entryTitle} numberOfLines={1}>{entry.title || 'Untitled Reflection'}</Text>
                        <View style={styles.entryMeta}>
                            <Text style={styles.entryDate}>{entry.date}</Text>
                            <Text style={styles.entryPreview} numberOfLines={1}>
                                {entry.content || 'No additional text'}
                            </Text>
                        </View>
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
        backgroundColor: '#000000',
    },
    viewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        backgroundColor: '#000000',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#111111',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    viewTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    entriesList: {
        paddingHorizontal: 20,
    },
    entryItem: {
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    entryTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    entryMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    entryDate: {
        fontSize: 14,
        color: '#666666',
        marginRight: 10,
    },
    entryPreview: {
        flex: 1,
        fontSize: 14,
        color: '#444444',
    },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E8503A',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#E8503A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
});
