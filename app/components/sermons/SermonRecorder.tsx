import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { IconArrowLeft, IconMic, IconTrash, IconCheck, IconEdit } from '../Icons';
import { AudioVisualizer } from './AudioVisualizer';
import { TabNavigator } from './TabNavigator';
import { BibleReferenceHandler } from '../bible/BibleReferenceHandler';
import { BibleVerseModal } from '../bible/BibleVerseModal';

interface SermonRecorderProps {
    isRecording: boolean;
    duration: number;
    levels: number[];
    isNewRecording: boolean;
    isProcessing: boolean;
    transcription: string | null;
    summary: string | null;
    error: string | null;
    sermonTitle: string;
    activeTab: 'SUMMARY' | 'TRANSCRIPTION';
    maxDuration: number;
    isPro: boolean;
    formatTime: (secs: number) => string;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onReset: () => void;
    onProcess: () => void;
    onSaveAndFinish: () => void;
    onTitleChange: (title: string) => void;
    onTabChange: (tab: 'SUMMARY' | 'TRANSCRIPTION') => void;
    onBack: () => void;
    onNavigateToBible?: (book: string, chapter: number) => void;
}

export const SermonRecorder: React.FC<SermonRecorderProps> = ({
    isRecording,
    duration,
    levels,
    isNewRecording,
    isProcessing,
    transcription,
    summary,
    error,
    sermonTitle,
    activeTab,
    maxDuration,
    isPro,
    formatTime,
    onStartRecording,
    onStopRecording,
    onReset,
    onProcess,
    onSaveAndFinish,
    onTitleChange,
    onTabChange,
    onBack,
    onNavigateToBible,
}) => {
    const isOverLimit = duration >= maxDuration;
    const [selectedVerse, setSelectedVerse] = React.useState<string | null>(null);

    const handleReferencePress = (reference: string) => {
        setSelectedVerse(reference);
    };

    const handleReadFull = () => {
        if (!selectedVerse || !onNavigateToBible) return;
        const parts = selectedVerse.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
        if (parts) {
            const [_, book, chapter] = parts;
            onNavigateToBible(book, parseInt(chapter));
            setSelectedVerse(null);
        }
    };

    // Auto-stop if over limit
    React.useEffect(() => {
        if (isRecording && duration >= maxDuration) {
            onStopRecording();
        }
    }, [duration, isRecording, maxDuration, onStopRecording]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.viewContainer}
        >
            <View style={styles.recordHeader}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconArrowLeft size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.recordTitle}>New Recording</Text>
            </View>

            <ScrollView style={styles.recordContent} contentContainerStyle={styles.recordContentPadding} showsVerticalScrollIndicator={false}>
                {/* Recording Area */}
                <View style={styles.recordingCard}>
                    {isRecording && <AudioVisualizer levels={levels} />}

                    <View style={styles.timerDisplay}>
                        <Text style={[styles.timerText, isOverLimit && { color: '#E8503A' }]}>
                            {formatTime(duration)}
                        </Text>
                        {isOverLimit && (
                            <Text style={styles.limitWarning}>
                                Max {maxDuration / 60}m reached for {isPro ? 'Pro' : 'Free'}
                            </Text>
                        )}
                    </View>

                    {!isRecording && isNewRecording && (
                        <TouchableOpacity style={styles.recordButton} onPress={onStartRecording}>
                            <IconMic size={32} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}

                    {isRecording && (
                        <TouchableOpacity style={styles.stopButton} onPress={onStopRecording}>
                            <View style={styles.stopIcon} />
                        </TouchableOpacity>
                    )}

                    {!isRecording && !isNewRecording && !transcription && (
                        <View style={styles.recordActions}>
                            <TouchableOpacity onPress={onReset} style={styles.deleteButton}>
                                <IconTrash size={24} color="#999999" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={onProcess}
                                disabled={isProcessing}
                                style={[styles.processButton, isProcessing && styles.processButtonDisabled]}
                            >
                                {isProcessing ? (
                                    <Text style={styles.processButtonText}>Processing...</Text>
                                ) : (
                                    <>
                                        <IconCheck size={20} color="#FFFFFF" />
                                        <Text style={styles.processButtonText}>Analyze Sermon</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>



                {error && (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Results */}
                {(transcription || summary) && (
                    <View style={styles.resultsContainer}>
                        <View style={styles.resultsHeader}>
                            <Text style={styles.resultsTitle}>AI Analysis Complete</Text>
                            <View style={styles.resultsActions}>
                                <TouchableOpacity
                                    onPress={onReset}
                                    style={styles.resultsDeleteButton}
                                >
                                    <IconTrash size={18} color="#999999" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={onSaveAndFinish}
                                    style={styles.saveButton}
                                >
                                    <IconCheck size={14} color="#FFFFFF" />
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.titleEditCard}>
                            <Text style={styles.cardLabel}>SERMON TITLE</Text>
                            <View style={styles.titleInputContainer}>
                                <TextInput
                                    style={styles.titleInput}
                                    value={sermonTitle}
                                    onChangeText={onTitleChange}
                                    placeholder="Enter sermon title..."
                                    placeholderTextColor="#666666"
                                />
                                <IconEdit size={18} color="#666666" />
                            </View>
                        </View>

                        <TabNavigator activeTab={activeTab} onTabChange={onTabChange} />

                        {activeTab === 'SUMMARY' ? (
                            <View style={styles.summaryCard}>
                                <Text style={styles.cardLabel}>SUMMARY & KEY TAKEAWAYS</Text>
                                <BibleReferenceHandler
                                    text={summary || ''}
                                    onReferencePress={handleReferencePress}
                                />
                            </View>
                        ) : (
                            <View style={styles.transcriptionCard}>
                                <Text style={styles.cardLabel}>SERMON TRANSCRIPT</Text>
                                <BibleReferenceHandler
                                    text={transcription || ''}
                                    onReferencePress={handleReferencePress}
                                />
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            <BibleVerseModal
                visible={!!selectedVerse}
                reference={selectedVerse || ''}
                onClose={() => setSelectedVerse(null)}
                onReadFull={handleReadFull}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    viewContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 0,
    },
    recordHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        gap: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: -8,
    },
    recordTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    recordContent: {
        flex: 1,
    },
    recordContentPadding: {
        paddingBottom: 120,
    },
    recordingCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
        marginBottom: 24,
        overflow: 'hidden',
    },
    timerDisplay: {
        marginBottom: 32,
        alignItems: 'center',
        zIndex: 10,
    },
    timerText: {
        fontSize: 56,
        fontWeight: '300',
        color: '#FFFFFF',
        fontVariant: ['tabular-nums'],
    },
    limitWarning: {
        color: '#E8503A',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 8,
    },
    recordButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8503A',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#E8503A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    stopButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    stopIcon: {
        width: 32,
        height: 32,
        backgroundColor: '#E8503A',
        borderRadius: 4,
    },
    recordActions: {
        flexDirection: 'row',
        gap: 24,
        alignItems: 'center',
    },
    deleteButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#222222',
        justifyContent: 'center',
        alignItems: 'center',
    },
    processButton: {
        flex: 1,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E8503A',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 24,
    },
    processButtonDisabled: {
        opacity: 0.6,
    },
    processButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    errorCard: {
        backgroundColor: 'rgba(232, 80, 58, 0.1)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(232, 80, 58, 0.2)',
    },
    errorText: {
        color: '#E8503A',
        fontSize: 14,
        textAlign: 'center',
    },
    resultsContainer: {
        gap: 16,
    },
    resultsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    resultsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    saveButton: {
        backgroundColor: '#E8503A',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    titleEditCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 16,
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#E8503A',
        letterSpacing: 1,
        marginBottom: 8,
    },
    titleInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    titleInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        padding: 0,
        marginRight: 12,
    },
    resultsActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    resultsDeleteButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 16,
    },
    transcriptionCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    summaryText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#CCCCCC',
    },
    transcriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#CCCCCC',
    },
});
