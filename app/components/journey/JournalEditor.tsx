import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { JournalEntry } from '../../types';
import { IconChevronLeft, IconCheck, IconTrash } from '../Icons';

interface JournalEditorProps {
    selectedEntry: JournalEntry | null;
    onCancel: () => void;
    onSave: (category: string) => void;
    title: string;
    setTitle: (t: string) => void;
    content: string;
    setContent: (c: string) => void;
    onDelete?: () => void;
}

const CATEGORIES = ['Devotion', 'Prayer', 'Fasting', 'Sermon Reflection', 'Life Lesson'] as const;
type Category = typeof CATEGORIES[number];

export const JournalEditor: React.FC<JournalEditorProps> = ({
    selectedEntry,
    onCancel,
    onSave,
    title,
    setTitle,
    content,
    setContent,
    onDelete,
}) => {
    const [activeCategory, setActiveCategory] = useState<Category>((selectedEntry?.category as Category) || 'Devotion');

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={onCancel} style={styles.backButton}>
                    <IconChevronLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{selectedEntry ? 'Edit Reflection' : 'New Reflection'}</Text>
                <View style={styles.headerActions}>
                    {selectedEntry && onDelete && (
                        <TouchableOpacity onPress={onDelete} style={styles.deleteAction}>
                            <IconTrash size={20} color="#666666" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => onSave(activeCategory)} style={styles.saveAction}>
                        <IconCheck size={20} color="#E8503A" />
                        <Text style={styles.saveActionText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.inputWrapper}>
                    <Text style={styles.sectionLabel}>TITLE</Text>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Give your reflection a title..."
                        placeholderTextColor="rgba(255, 255, 255, 0.2)"
                        value={title}
                        onChangeText={setTitle}
                        selectionColor="#E8503A"
                    />
                </View>

                <View style={styles.categorySection}>
                    <Text style={styles.sectionLabel}>CATEGORY</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setActiveCategory(cat)}
                                style={[
                                    styles.categoryChip,
                                    activeCategory === cat && styles.categoryChipActive
                                ]}
                            >
                                <Text style={[
                                    styles.categoryChipText,
                                    activeCategory === cat && styles.categoryChipTextActive
                                ]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.inputWrapper}>
                    <Text style={styles.sectionLabel}>REFLECTIONS</Text>
                    <TextInput
                        style={styles.contentInput}
                        placeholder="What's on your heart? Share your journey..."
                        placeholderTextColor="rgba(255, 255, 255, 0.15)"
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                        selectionColor="#E8503A"
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0D0D',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    saveAction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    saveActionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#E8503A',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    deleteAction: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 24,
        paddingBottom: 40,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#E8503A',
        letterSpacing: 1.5,
        marginBottom: 12,
        opacity: 0.9,
    },
    inputWrapper: {
        marginBottom: 32,
    },
    titleInput: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
        paddingVertical: 10,
    },
    categorySection: {
        marginBottom: 32,
    },
    categoryScroll: {
        marginLeft: -4,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: '#1A1A1A',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    categoryChipActive: {
        backgroundColor: '#FFD35A',
        borderColor: '#FFD35A',
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#999999',
    },
    categoryChipTextActive: {
        color: '#000000',
    },
    contentInput: {
        fontSize: 17,
        color: '#E0E0E0',
        lineHeight: 28,
        minHeight: 400,
        paddingTop: 8,
    },
});
