import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { JournalEntry } from '../../types';

interface JournalEditorProps {
    selectedEntry: JournalEntry | null;
    onCancel: () => void;
    onSave: () => void;
    title: string;
    setTitle: (t: string) => void;
    content: string;
    setContent: (c: string) => void;
}

export const JournalEditor: React.FC<JournalEditorProps> = ({
    selectedEntry,
    onCancel,
    onSave,
    title,
    setTitle,
    content,
    setContent
}) => (
    <View style={styles.fullView}>
        <View style={styles.editorHeader}>
            <TouchableOpacity onPress={onCancel}>
                <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.editorTitle}>{selectedEntry ? 'Edit Reflection' : 'New Reflection'}</Text>
            <TouchableOpacity onPress={onSave}>
                <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.editorContent}>
            <TextInput
                style={styles.titleInput}
                placeholder="Title..."
                placeholderTextColor="rgba(197, 197, 197, 0.5)"
                value={title}
                onChangeText={setTitle}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {['Devotion', 'Prayer', 'Fasting', 'Sermon Reflection', 'Life Lesson'].map(cat => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.categoryChip,
                            selectedEntry?.category === cat && styles.categoryChipActive
                        ]}
                    >
                        <Text style={[
                            styles.categoryChipText,
                            selectedEntry?.category === cat && styles.categoryChipTextActive
                        ]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TextInput
                style={styles.contentInput}
                placeholder="Write what God is teaching you today..."
                placeholderTextColor="rgba(197, 197, 197, 0.3)"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
            />
        </ScrollView>
    </View>
);

const styles = StyleSheet.create({
    fullView: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 100,
    },
    editorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    cancelButton: {
        fontSize: 16,
        color: '#999999',
    },
    editorTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    saveButton: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E8503A',
    },
    scrollView: {
        flex: 1,
    },
    editorContent: {
        paddingBottom: 24,
    },
    titleInput: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    categoryScroll: {
        marginBottom: 16,
    },
    categoryChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: '#FFD35A',
        borderColor: '#FFD35A',
    },
    categoryChipText: {
        fontSize: 12,
        color: '#999999',
    },
    categoryChipTextActive: {
        color: '#000000',
        fontWeight: 'bold',
    },
    contentInput: {
        flex: 1,
        fontSize: 16,
        color: '#CCCCCC',
        lineHeight: 24,
        minHeight: 300,
    },
});
