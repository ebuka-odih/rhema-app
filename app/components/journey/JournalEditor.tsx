import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { JournalEntry } from '../../types';
import { IconChevronLeft, IconCheck, IconTrash } from '../Icons';
import { styles } from './JournalEditor.styles';

// Sub-components
import { MarkdownPreview } from './editor/MarkdownPreview';
import { FormatMenuModal } from './editor/FormatMenuModal';
import { EditorToolbar } from './editor/EditorToolbar';

// Hooks
import { useVoiceTranscription } from '../../hooks/journey/useVoiceTranscription';
import { useTextFormatting } from '../../hooks/journey/useTextFormatting';

interface JournalEditorProps {
    selectedEntry: JournalEntry | null;
    onSave: (category: string) => void;
    onCancel: () => void;
    onDelete?: () => void;
    title: string;
    setTitle: (title: string) => void;
    content: string;
    setContent: (content: string | ((prev: string) => string)) => void;
}

const CATEGORIES = ['Reflections', 'Prayers', 'Bible Study', 'Gratitude', 'Sermon Notes', 'Others'];

export const JournalEditor: React.FC<JournalEditorProps> = ({
    selectedEntry,
    onSave,
    onCancel,
    onDelete,
    title,
    setTitle,
    content,
    setContent,
}) => {
    const [activeCategory, setActiveCategory] = useState(selectedEntry?.category || 'Reflections');
    const [isEditing, setIsEditing] = useState(!selectedEntry);

    const editorRef = useRef<TextInput>(null);
    const scrollRef = useRef<ScrollView>(null);

    // Custom Hooks
    const {
        applyFormat,
        handleSelectionChange,
        showFormatMenu,
        setShowFormatMenu
    } = useTextFormatting({
        content,
        setContent: (c) => setContent(c),
        editorRef
    });

    const {
        interimText,
        isListeningContinuous,
        isTranscribing,
        voiceLevel,
        toggleVoiceTyping
    } = useVoiceTranscription({
        setContent,
        editorRef
    });

    // Auto-scroll to end when content or transcribing changes
    useEffect(() => {
        if (isTranscribing || isListeningContinuous) {
            scrollRef.current?.scrollToEnd({ animated: true });
        }
    }, [content, isTranscribing, isListeningContinuous]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={onCancel} style={styles.backButton}>
                    <IconChevronLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerSubtitle}>{activeCategory}</Text>
                    <Text style={styles.headerTitle}>{selectedEntry ? 'Edit Note' : 'New Note'}</Text>
                </View>
                <View style={styles.headerActions}>
                    {selectedEntry && onDelete && (
                        <TouchableOpacity onPress={onDelete} style={styles.deleteAction}>
                            <IconTrash size={20} color="#FF4444" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => onSave(activeCategory)} style={styles.saveAction}>
                        <IconCheck size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                ref={scrollRef}
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.titleSection}>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Title"
                        placeholderTextColor="rgba(255, 255, 255, 0.2)"
                        value={title}
                        onChangeText={(text) => {
                            if (Platform.OS !== 'web') {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }
                            setTitle(text);
                        }}
                        multiline
                    />
                    <Text style={styles.dateText}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                </View>

                <EditorToolbar
                    categories={CATEGORIES}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                    showFormatMenu={showFormatMenu}
                    setShowFormatMenu={setShowFormatMenu}
                    applyFormat={applyFormat}
                    toggleVoiceTyping={toggleVoiceTyping}
                    isListening={isListeningContinuous}
                    voiceLevel={voiceLevel}
                />

                <View style={styles.editorSection}>
                    {isListeningContinuous && (
                        <View style={styles.statusIndicator}>
                            <View style={styles.recordingPulse} />
                            <Text style={styles.statusText}>Continuous Listening Mode...</Text>
                        </View>
                    )}
                    {isTranscribing && (
                        <View style={styles.statusIndicator}>
                            <ActivityIndicator size="small" color="#E8503A" />
                            <Text style={styles.statusText}>Transcribing...</Text>
                        </View>
                    )}

                    {!isEditing && !isListeningContinuous ? (
                        <MarkdownPreview
                            content={content}
                            interimText={interimText}
                            onPress={() => setIsEditing(true)}
                        />
                    ) : (
                        <View style={{ flex: 1 }}>
                            <TextInput
                                ref={editorRef}
                                style={styles.contentInput}
                                placeholder="Start typing your reflection..."
                                placeholderTextColor="rgba(255, 255, 255, 0.1)"
                                value={content}
                                onChangeText={(text) => {
                                    if (Platform.OS !== 'web' && Math.abs(text.length - content.length) < 2) {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }
                                    setContent(text);
                                }}
                                onSelectionChange={handleSelectionChange}
                                onBlur={() => setIsEditing(false)}
                                multiline
                                textAlignVertical="top"
                                selectionColor="#E8503A"
                                autoFocus={true}
                                blurOnSubmit={false}
                                autoCapitalize="sentences"
                                autoCorrect={true}
                            />
                        </View>
                    )}
                </View>
            </ScrollView>

            <FormatMenuModal
                visible={showFormatMenu}
                onClose={() => setShowFormatMenu(false)}
                onApply={applyFormat}
            />
        </KeyboardAvoidingView>
    );
};
