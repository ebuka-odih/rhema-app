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
    setContent: React.Dispatch<React.SetStateAction<string>>;
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
    const editorRef = useRef<TextInput>(null);
    const selectionRef = useRef({ start: 0, end: 0 });
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [showFormatMenu, setShowFormatMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(!selectedEntry);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isListeningContinuous, setIsListeningContinuous] = useState(false);
    const chunkTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Audio Recorder
    const recorder = useAudioRecorder({
        ...RecordingPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
    });
    const recorderState = useAudioRecorderState(recorder, 100);

    const applyFormat = (type: FormatType) => {
        const { start, end } = selectionRef.current;

        // If nothing is selected, we apply to current line or word
        const isLineFormat = ['title', 'heading', 'subheading', 'bullet', 'dashed', 'numbered', 'quote', 'body'].includes(type);

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

        let newContent = content;
        if (isLineFormat) {
            const lines = content.split('\n');
            let currentPos = 0;
            const newLines = lines.map(line => {
                const lineStart = currentPos;
                const lineEnd = currentPos + line.length;
                currentPos += line.length + 1;

                // Check if this line is part of the selection
                const isSelected = (start === end && start >= lineStart && start <= lineEnd) ||
                    (start < lineEnd && end > lineStart);

                if (isSelected) {
                    const cleanLine = line.replace(/^(#+ |• |- |\d+\. |> )/, '');
                    return type === 'body' ? cleanLine : prefix + cleanLine;
                }
                return line;
            });
            newContent = newLines.join('\n');
        } else {
            const selectedText = content.substring(start, end);
            newContent = content.substring(0, start) + prefix + selectedText + suffix + content.substring(end);
        }

        setContent(newContent);

        // Focus back to input
        setTimeout(() => {
            editorRef.current?.focus();
        }, 100);

        if (!['bold', 'italic', 'underline', 'strike'].includes(type)) {
            setShowFormatMenu(false);
        }
    };

    const recognitionRef = useRef<any>(null);

    const toggleVoiceTyping = async () => {
        // 1. Try Native Web Speech API first (Works directly, no AI service needed)
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            if (isListeningContinuous) {
                stopNativeRecognition();
            } else {
                startNativeRecognition(SpeechRecognition);
            }
            return;
        }

        // 2. Fallback to Continuous Chunking (if native is not supported)
        if (isListeningContinuous) {
            stopContinuousListening();
        } else {
            startContinuousListening();
        }
    };

    const startNativeRecognition = (SpeechRecognition: any) => {
        setIsListeningContinuous(true);
        setIsEditing(true);

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const text = event.results[i][0].transcript;
                    setContent(prev => {
                        const spacer = prev && !prev.endsWith(' ') ? ' ' : '';
                        return prev + spacer + text;
                    });
                }
            }
        };

        recognition.onend = () => {
            if (isListeningContinuous) recognition.start(); // Keep listening
        };

        recognition.onerror = (err: any) => {
            console.error('Speech recognition error', err);
            setIsListeningContinuous(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
    };

    const stopNativeRecognition = () => {
        setIsListeningContinuous(false);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
    };

    const startContinuousListening = async () => {
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

            setIsListeningContinuous(true);
            setIsEditing(true); // Switch to edit mode so user sees text appear

            await startNextChunk();
        } catch (err) {
            console.error('Failed to start listening', err);
            Alert.alert('Error', 'Could not start recording.');
        }
    };

    const startNextChunk = async () => {
        try {
            await recorder.prepareToRecordAsync();
            recorder.record();

            // Record for 4 seconds, then process and start next
            chunkTimerRef.current = setTimeout(async () => {
                if (isListeningContinuous) {
                    await processChunkAndContinue();
                }
            }, 4000);
        } catch (err) {
            console.error('Next chunk error', err);
        }
    };

    const processChunkAndContinue = async () => {
        try {
            const uri = recorder.uri;
            await recorder.stop();

            // Immediately start next chunk recording to minimize gaps
            if (isListeningContinuous) {
                startNextChunk();
            }

            if (uri) {
                performTranscription(uri);
            }
        } catch (err) {
            console.error('Process chunk error', err);
        }
    };

    const stopContinuousListening = async () => {
        setIsListeningContinuous(false);
        if (chunkTimerRef.current) {
            clearTimeout(chunkTimerRef.current);
            chunkTimerRef.current = null;
        }

        try {
            const uri = recorder.uri;
            await recorder.stop();
            if (uri) {
                performTranscription(uri);
            }
        } catch (err) {
            console.error('Stop listening error', err);
        }
    };

    const performTranscription = async (uri: string) => {
        setIsTranscribing(true);
        try {
            const token = await authService.getToken();
            const formData = new FormData();
            formData.append('audio', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                type: 'audio/m4a',
                name: 'chunk.m4a',
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
                if (newText) {
                    setContent(prev => {
                        const spacer = prev && !prev.endsWith(' ') ? ' ' : '';
                        return prev + spacer + newText;
                    });
                }
            }
        } catch (err) {
            console.error('Transcription chunk error', err);
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleSelectionChange = (e: any) => {
        const newSelection = e.nativeEvent.selection;
        selectionRef.current = newSelection;
        setSelection(newSelection);
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

                        <View style={{ flex: 1 }} />

                        <View style={styles.verticalDivider} />

                        <TouchableOpacity
                            style={[styles.micBtn, isListeningContinuous && styles.micBtnActive]}
                            onPress={toggleVoiceTyping}
                        >
                            <IconMic size={22} color={isListeningContinuous ? '#FF4444' : '#FFFFFF'} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Editor Section */}
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
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setIsEditing(true)}
                            style={styles.previewContainer}
                        >
                            {content ? content.split('\n').map((line, i) => {
                                if (line.startsWith('# ')) return <Text key={i} style={styles.previewTitle}>{line.substring(2)}</Text>;
                                if (line.startsWith('## ')) return <Text key={i} style={styles.previewHeading}>{line.substring(3)}</Text>;
                                if (line.startsWith('### ')) return <Text key={i} style={styles.previewSubheading}>{line.substring(4)}</Text>;
                                if (line.startsWith('• ')) return <Text key={i} style={styles.previewListItem}>• {line.substring(2)}</Text>;
                                if (line.startsWith('> ')) return <View key={i} style={styles.previewQuote}><Text style={styles.previewQuoteText}>{line.substring(2)}</Text></View>;
                                return <Text key={i} style={styles.previewBody}>{line || ' '}</Text>;
                            }) : (
                                <Text style={styles.placeholderText}>Start typing your reflection...</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TextInput
                            ref={editorRef}
                            style={styles.contentInput}
                            placeholder="Start typing your reflection..."
                            placeholderTextColor="rgba(255, 255, 255, 0.1)"
                            value={content}
                            onChangeText={setContent}
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
                    )}
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
    previewToggle: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginRight: 12,
    },
    previewToggleText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#E8503A',
        textTransform: 'uppercase',
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
    micBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#161616',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    micBtnActive: {
        backgroundColor: 'rgba(255, 68, 68, 0.15)',
        borderColor: 'rgba(255, 68, 68, 0.3)',
    },
    verticalDivider: {
        width: 1,
        height: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        marginHorizontal: 8,
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
    placeholderText: {
        fontSize: 19,
        color: 'rgba(255, 255, 255, 0.1)',
        lineHeight: 32,
        fontStyle: 'italic',
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
    previewContainer: {
        flex: 1,
    },
    previewTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    previewHeading: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 12,
        marginTop: 16,
    },
    previewSubheading: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 10,
        marginTop: 14,
    },
    previewBody: {
        fontSize: 18,
        lineHeight: 28,
        color: '#E0E0E0',
        marginBottom: 12,
    },
    previewListItem: {
        fontSize: 18,
        lineHeight: 28,
        color: '#E0E0E0',
        marginBottom: 8,
        paddingLeft: 10,
    },
    previewQuote: {
        borderLeftWidth: 4,
        borderLeftColor: '#E8503A',
        paddingLeft: 16,
        marginVertical: 16,
        backgroundColor: 'rgba(232, 80, 58, 0.05)',
        paddingVertical: 12,
        borderRadius: 4,
    },
    previewQuoteText: {
        fontSize: 18,
        fontStyle: 'italic',
        lineHeight: 28,
        color: '#E0E0E0',
    },
});
