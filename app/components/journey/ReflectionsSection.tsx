import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconPen } from '../Icons';
import { JournalEntry } from '../../types';
import { commonStyles } from './JourneyStyles';

interface ReflectionsSectionProps {
    journalEntries: JournalEntry[];
    onViewAllReflections: () => void;
    onNewReflection: () => void;
    onSelectEntry: (entry: JournalEntry) => void;
}

export const ReflectionsSection: React.FC<ReflectionsSectionProps> = ({
    journalEntries,
    onViewAllReflections,
    onNewReflection,
    onSelectEntry,
}) => {
    return (
        <View style={commonStyles.section}>
            <View style={commonStyles.sectionHeader}>
                <Text style={commonStyles.sectionTitle}>Recent Reflections</Text>
                <TouchableOpacity onPress={onViewAllReflections}>
                    <Text style={commonStyles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>

            {journalEntries.length === 0 ? (
                <TouchableOpacity style={commonStyles.emptyState} onPress={onNewReflection}>
                    <IconPen size={32} color="rgba(255, 255, 255, 0.1)" />
                    <Text style={commonStyles.emptyText}>Start your first reflection</Text>
                </TouchableOpacity>
            ) : (
                <View style={commonStyles.entriesList}>
                    {journalEntries.slice(0, 5).map((entry, idx) => (
                        <TouchableOpacity
                            key={entry.id}
                            style={[
                                commonStyles.entryItem,
                                idx === 4 && { borderBottomWidth: 0 }
                            ]}
                            onPress={() => onSelectEntry(entry)}
                        >
                            <Text style={commonStyles.entryTitle} numberOfLines={1}>{entry.title || 'Untitled Reflection'}</Text>
                            <View style={commonStyles.entryMeta}>
                                <Text style={commonStyles.entryDate}>{entry.date}</Text>
                                <Text style={commonStyles.entryPreview} numberOfLines={1}>
                                    {entry.content || 'No additional text'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};
