import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Animated, Modal, TouchableWithoutFeedback, Alert, ActivityIndicator } from 'react-native';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { JournalEntry } from '../../types';
import { IconChevronLeft, IconCheck, IconTrash, IconMic, IconBold, IconItalic, IconListBullet, IconUnderline, IconStrikethrough, IconFormat, IconQuote } from '../Icons';
import { authService } from '../../services/auth';
import { API_BASE_URL } from '../../services/apiConfig';

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

const CATEGORIES = ['Devotion', 'Prayer', 'Fasting', 'Sermon Reflection', 'Life Lesson', 'Others'] as const;
type Category = typeof CATEGORIES[number];

type FormatType = 'title' | 'heading' | 'subheading' | 'body' | 'monostyled' | 'bullet' | 'dashed' | 'numbered' | 'quote' | 'bold' | 'italic' | 'underline' | 'strike';

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
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [showFormatMenu, setShowFormatMenu] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);

    // Audio Recorder
    const recorder = useAudioRecorder({
        ...RecordingPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
    });
    const recorderState = useAudioRecorderState(recorder, 100);

    const applyFormat = (type: FormatType) => {
        const { start, end } = selection;
        const selectedText = content.substring(start, end);
        let newContent = content;
        let prefix = '';
        let suffix = '';

        switch (type) {
            case 'bold': prefix = '**'; suffix = '**'; break;
            case 'italic': prefix = '_'; suffix = '_'; break;
            case 'underline': prefix = '<u>'; suffix = '</u>'; break;
            case 'strike': prefix = '~~'; suffix = '~~'; break;
            case 'title': prefix = '# '; break;
            case 'heading': prefix = '## '; break;
            case 'subheading': prefix = '### '; break;
            case 'monostyled': prefix = '`'; suffix = '`'; break;
            case 'bullet': prefix = '• '; break;
            case 'dashed': prefix = '- '; break;
            case 'numbered': prefix = '1. '; break;
            case 'quote': prefix = '> '; break;
            case 'body': prefix = ''; suffix = ''; break;
        }

        if (['title', 'heading', 'subheading', 'bullet', 'dashed', 'numbered', 'quote', 'body'].includes(type)) {
            const lines = content.split('\n');
            let currentSelectionPos = 0;
            const newLines = lines.map(line => {
                const lineStart = currentSelectionPos;
                const lineEnd = currentSelectionPos + line.length;
                currentSelectionPos += line.length + 1;

                if (start >= lineStart && start <= lineEnd) {
                    const cleanLine = line.replace(/^(#+ |• |- |\d+\. |> )/, '');
                    return type === 'body' ? cleanLine : prefix + cleanLine;
                }
                return line;
            });
            newContent = newLines.join('\n');
        } else {
            newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
        }

        setContent(newContent);
        if (!['bold', 'italic', 'underline', 'strike'].includes(type)) {
            setShowFormatMenu(false);
        }
    };

    const toggleVoiceTyping = async () => {
        if (recorderState.isRecording) {
            try {
                await recorder.stop();
                handleTranscription();
            } catch (err) {
                console.error('Failed to stop recording', err);
            }
        } else {
            try {
                const { granted } = await requestRecordingPermissionsAsync();
                if (!granted) {
                    Alert.alert('Permission Required', 'Microphone permission is needed for voice typing.');
                    return;
                }

                await setAudioModeAsync({
                    allowsRecording: true,
                    playsInSilentMode: true,
                    interruptionMode: 'doNotMix',
                });

                await recorder.prepareToRecordAsync();
                recorder.record();
            } catch (err) {
                console.error('Failed to start recording', err);
                Alert.alert('Error', 'Could not start recording. Please check microphone permissions.');
            }
        }
    };

    const handleTranscription = async () => {
        if (!recorder.uri) return;
        setIsTranscribing(true);

        try {
            const token = await authService.getToken();
            const formData = new FormData();
            formData.append('audio', {
                uri: Platform.OS === 'ios' ? recorder.uri.replace('file://', '') : recorder.uri,
                type: 'audio/m4a',
                name: 'transcription.m4a',
            } as any);

            const response = await fetch(`${API_BASE_URL}transcribe`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const result = await response.json();
            if (response.ok && result.text) {
                const newText = result.text.trim();
                const updatedContent = content
                    ? content.endsWith(' ') ? content + newText : content + ' ' + newText
                    : newText;
                setContent(updatedContent);
            } else {
                console.warn('Transcription failed', result);
            }
        } catch (err) {
            console.error('Transcription system error', err);
        } finally {
            setIsTranscribing(false);
        }
    };

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
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[1]}
            >
                {/* Title Section */}
                <View style={styles.titleSection}>
                    <TextInput
                        style={styles.titleInput}
                        placeholder="Note Title"
                        placeholderTextColor="rgba(255, 255, 255, 0.2)"
                        value={title}
                        onChangeText={setTitle}
                        selectionColor="#E8503A"
                    />
                    <Text style={styles.dateText}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </Text>
                </View>

                {/* Toolbar Section */}
                <View style={styles.toolbarContainer}>
                    {/* Top Row: Scrollable Categories */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryScroller}
                        contentContainerStyle={styles.categoryScrollerContent}
                    >
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

                    <View style={styles.toolbarDivider} />

                    {/* Bottom Row: Fixed Format Icons */}
                    <View style={styles.formatIconRow}>
                        <TouchableOpacity
                            style={[styles.toolBtn, showFormatMenu && styles.toolBtnActive]}
                            onPress={() => setShowFormatMenu(true)}
                        >
                            <IconFormat size={20} color="#FFFFFF" />
                        </TouchableOpacity>

                        <View style={styles.formatIconGroup}>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => applyFormat('bold')}>
                                <IconBold size={18} color="#FFFFFF" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.toolBtn} onPress={() => applyFormat('italic')}>
                                <IconItalic size={18} color="#FFFFFF" />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.toolBtn} onPress={() => applyFormat('bullet')}>
                                <IconListBullet size={18} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.toolBtn, recorderState.isRecording && styles.micBtnActive]}
                            onPress={toggleVoiceTyping}
                        >
                            <IconMic size={18} color={recorderState.isRecording ? '#FF4444' : '#FFFFFF'} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Editor Section */}
                <View style={styles.editorSection}>
                    {isTranscribing && (
                        <View style={styles.statusIndicator}>
                            <ActivityIndicator size="small" color="#E8503A" />
                            <Text style={styles.statusText}>Converting voice to text...</Text>
                        </View>
                    )}
                    {recorderState.isRecording && (
                        <View style={styles.statusIndicator}>
                            <View style={styles.recordingPulse} />
                            <Text style={styles.statusText}>Listening...</Text>
                        </View>
                    )}
                    <TextInput
                        style={styles.contentInput}
                        placeholder="Start typing your reflection..."
                        placeholderTextColor="rgba(255, 255, 255, 0.1)"
                        value={content}
                        onChangeText={setContent}
                        onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                        multiline
                        textAlignVertical="top"
                        selectionColor="#E8503A"
                        autoFocus={!selectedEntry}
                    />
                </View>
            </ScrollView>

            {/* Apple Notes Style Format Menu */}
            <Modal visible={showFormatMenu} transparent animationType="fade" onRequestClose={() => setShowFormatMenu(false)}>
                <TouchableWithoutFeedback onPress={() => setShowFormatMenu(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.formatMenu}>
                            <View style={styles.menuHeader}>
                                <TouchableOpacity onPress={() => applyFormat('bold')} style={styles.headerTool}><IconBold size={18} color="#FFF" /></TouchableOpacity>
                                <TouchableOpacity onPress={() => applyFormat('italic')} style={styles.headerTool}><IconItalic size={18} color="#FFF" /></TouchableOpacity>
                                <TouchableOpacity onPress={() => applyFormat('underline')} style={styles.headerTool}><IconUnderline size={18} color="#FFF" /></TouchableOpacity>
                                <TouchableOpacity onPress={() => applyFormat('strike')} style={styles.headerTool}><IconStrikethrough size={18} color="#FFF" /></TouchableOpacity>
                            </View>
                            <View style={styles.menuDivider} />
                            <TouchableOpacity onPress={() => applyFormat('title')} style={styles.menuItem}><Text style={styles.menuItemTitle}>Title</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => applyFormat('heading')} style={styles.menuItem}><Text style={styles.menuItemHeading}>Heading</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => applyFormat('subheading')} style={styles.menuItem}><Text style={styles.menuItemSubheading}>Subheading</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => applyFormat('body')} style={styles.menuItem}><Text style={styles.menuItemBody}>Body</Text></TouchableOpacity>
                            <View style={styles.menuDivider} />
                            <TouchableOpacity onPress={() => applyFormat('bullet')} style={styles.menuItem}><Text style={styles.menuItemText}>• Bulleted List</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => applyFormat('numbered')} style={styles.menuItem}><Text style={styles.menuItemText}>1. Numbered List</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => applyFormat('quote')} style={styles.menuItem}><Text style={styles.menuItemText}>| Block Quote</Text></TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#050505',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 20,
        paddingBottom: 16,
        backgroundColor: '#050505',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerSubtitle: {
        fontSize: 10,
        fontWeight: '800',
        color: '#E8503A',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#111111',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveAction: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8503A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteAction: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 100,
    },
    titleSection: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    titleInput: {
        fontSize: 34,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1,
        marginBottom: 8,
    },
    dateText: {
        fontSize: 13,
        color: '#444444',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    toolbarContainer: {
        backgroundColor: '#0D0D0D',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        paddingVertical: 8,
    },
    categoryScroller: {
        marginBottom: 8,
    },
    categoryScrollerContent: {
        paddingHorizontal: 16,
    },
    toolbarDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 8,
    },
    formatIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
    },
    formatIconGroup: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    toolBtn: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toolBtnActive: {
        backgroundColor: 'rgba(232, 80, 58, 0.15)',
    },
    micBtnActive: {
        backgroundColor: 'rgba(255, 68, 68, 0.2)',
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#161616',
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(232, 80, 58, 0.3)',
    },
    categoryChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666666',
    },
    categoryChipTextActive: {
        color: '#E8503A',
        fontWeight: '700',
    },
    editorSection: {
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(232, 80, 58, 0.05)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    statusText: {
        fontSize: 13,
        color: '#E8503A',
        fontWeight: '700',
    },
    recordingPulse: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF4444',
    },
    contentInput: {
        fontSize: 19,
        color: '#E0E0E0',
        lineHeight: 32,
        minHeight: 500,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
        paddingBottom: 100,
        alignItems: 'center',
    },
    formatMenu: {
        width: '85%',
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 16,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    headerTool: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#262626',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginVertical: 4,
    },
    menuItem: {
        paddingVertical: 14,
    },
    menuItemTitle: { fontSize: 28, fontWeight: '900', color: '#FFF' },
    menuItemHeading: { fontSize: 22, fontWeight: '800', color: '#FFF' },
    menuItemSubheading: { fontSize: 18, fontWeight: '700', color: '#FFF' },
    menuItemBody: { fontSize: 18, color: '#FFF' },
    menuItemText: { fontSize: 18, color: '#FFF' },
});
