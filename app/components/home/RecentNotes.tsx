import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Note {
    id: string;
    title: string;
    preview: string;
    date: string;
}

interface RecentNotesProps {
    notes: Note[];
    onViewAll?: () => void;
}

export const RecentNotes: React.FC<RecentNotesProps> = ({ notes, onViewAll }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Notes</Text>
            <TouchableOpacity onPress={onViewAll}>
                <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.notesList}>
            {notes.map((note) => (
                <TouchableOpacity key={note.id} style={styles.noteCard}>
                    <View style={styles.noteHeader}>
                        <Text style={styles.noteTitle}>{note.title}</Text>
                        <Text style={styles.noteDate}>{note.date}</Text>
                    </View>
                    <Text style={styles.notePreview} numberOfLines={2}>{note.preview}</Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    viewAll: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#E8503A',
    },
    notesList: {
        paddingHorizontal: 24,
        gap: 12,
    },
    noteCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#E8503A',
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    noteTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
        flex: 1,
    },
    noteDate: {
        fontSize: 12,
        color: '#999999',
    },
    notePreview: {
        fontSize: 12,
        color: '#999999',
        lineHeight: 18,
    },
});
