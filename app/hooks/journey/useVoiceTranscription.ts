import { useState, useRef, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { authService } from '../../services/auth';
import { API_BASE_URL } from '../../services/apiConfig';

interface UseVoiceTranscriptionProps {
    setContent: (update: string | ((prev: string) => string)) => void;
    editorRef: React.RefObject<any>;
}

export const useVoiceTranscription = ({ setContent, editorRef }: UseVoiceTranscriptionProps) => {
    const [interimText, setInterimText] = useState('');
    const [isListeningContinuous, setIsListeningContinuous] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [voiceLevel, setVoiceLevel] = useState(0);

    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(recorder);
    const chunkTimerRef = useRef<NodeJS.Timeout | null>(null);
    const recognitionRef = useRef<any>(null);
    const activeRequests = useRef(0);

    // Sync voice level for animation
    useEffect(() => {
        if (isListeningContinuous && recorderState?.metering !== undefined) {
            const level = Math.max(0, (recorderState.metering + 160) / 160);
            setVoiceLevel(level);
        } else {
            setVoiceLevel(0);
        }
    }, [recorderState?.metering, isListeningContinuous]);

    const toggleVoiceTyping = async () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            if (isListeningContinuous) {
                stopNativeRecognition();
            } else {
                startNativeRecognition(SpeechRecognition);
            }
            return;
        }

        if (isListeningContinuous) {
            stopContinuousListening();
        } else {
            // Minimal Setup: Focus and switch mode
            setTimeout(() => editorRef.current?.focus(), 100);
            startContinuousListening();
        }
    };

    const startNativeRecognition = (SpeechRecognition: any) => {
        setIsListeningContinuous(true);

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let finalizedText = '';
            let currentInterim = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalizedText += (finalizedText ? ' ' : '') + transcript;
                } else {
                    currentInterim += (currentInterim ? ' ' : '') + transcript;
                }
            }

            if (finalizedText) {
                const textToAppend = finalizedText.trim();
                setContent(prev => {
                    const separator = prev ? '\n\n' : '';
                    return prev + separator + textToAppend;
                });
                setTimeout(() => {
                    editorRef.current?.setNativeProps({ selection: { start: 99999, end: 99999 } });
                }, 50);
            }
            setInterimText(currentInterim);
        };

        recognition.onend = () => {
            if (isListeningContinuous && recognitionRef.current) {
                try { recognition.start(); } catch (e) { }
            }
        };

        recognition.onerror = (err: any) => {
            console.error('Speech recognition error', err);
            if (err.error === 'no-speech') return;
            setIsListeningContinuous(false);
            setInterimText('');
        };

        recognition.start();
        recognitionRef.current = recognition;
    };

    const stopNativeRecognition = () => {
        setIsListeningContinuous(false);
        setInterimText('');
        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
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
            await startNextChunk();
        } catch (err) {
            console.error('Failed to start listening', err);
            Alert.alert('Error', 'Could not start recording.');
        }
    };

    const startNextChunk = async () => {
        if (!isListeningContinuous) return;
        try {
            await recorder.prepareToRecordAsync();
            recorder.record();

            chunkTimerRef.current = setTimeout(async () => {
                if (isListeningContinuous) {
                    await processChunkAndContinue();
                }
            }, 1200);
        } catch (err) {
            console.error('Next chunk error', err);
        }
    };

    const processChunkAndContinue = async () => {
        try {
            await recorder.stop();
            const uri = recorder.uri;
            await new Promise(resolve => setTimeout(resolve, 30));

            let safePath = null;
            if (uri) {
                setIsTranscribing(true);
                try {
                    const info = await FileSystem.getInfoAsync(uri);
                    // Legacy API returns { exists, size, ... } or just throws if not found
                    if (info && (info as any).exists !== false && (info as any).size > 0) {
                        safePath = `${FileSystem.cacheDirectory}chunk_${Date.now()}.m4a`;
                        await FileSystem.copyAsync({ from: uri, to: safePath });
                    }
                } catch (fileErr) {
                    console.log('File info check failed, skipping chunk:', fileErr);
                }
            }

            if (isListeningContinuous) {
                startNextChunk();
            }

            if (safePath) {
                performTranscription(safePath);
            }
        } catch (err) {
            console.error('Process chunk error', err);
        }
    };

    const stopContinuousListening = async () => {
        setIsListeningContinuous(false);
        setInterimText('');
        if (chunkTimerRef.current) {
            clearTimeout(chunkTimerRef.current);
            chunkTimerRef.current = null;
        }

        try {
            await recorder.stop();
            await new Promise(resolve => setTimeout(resolve, 100));

            const finalUri = recorder.uri;
            if (finalUri) {
                setIsTranscribing(true);
                try {
                    const info = await FileSystem.getInfoAsync(finalUri);
                    if (info && (info as any).exists !== false && (info as any).size > 0) {
                        const safePath = `${FileSystem.cacheDirectory}chunk_${Date.now()}.m4a`;
                        await FileSystem.copyAsync({ from: finalUri, to: safePath });
                        performTranscription(safePath);
                    }
                } catch (fileErr) {
                    console.log('Final file info check failed:', fileErr);
                }
            }
        } catch (err) {
            console.error('Stop listening error', err);
        }
    };

    const performTranscription = async (tokenUri: string) => {
        activeRequests.current++;
        setIsTranscribing(true);

        try {
            const token = await authService.getToken();
            const formData = new FormData();
            formData.append('audio', {
                uri: tokenUri,
                type: 'audio/m4a',
                name: `chunk_${Date.now()}.m4a`,
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
                if (newText && newText.length > 1) {
                    setContent(prev => {
                        const separator = prev ? '\n\n' : '';
                        return prev + separator + newText;
                    });
                    setTimeout(() => {
                        editorRef.current?.setNativeProps({ selection: { start: 99999, end: 99999 } });
                    }, 10);
                }
            }
            await FileSystem.deleteAsync(tokenUri, { idempotent: true });
        } catch (err) {
            console.error('Transcription chunk error', err);
        } finally {
            activeRequests.current--;
            if (activeRequests.current <= 0) {
                setIsTranscribing(false);
            }
        }
    };

    return {
        interimText,
        isListeningContinuous,
        isTranscribing,
        voiceLevel,
        toggleVoiceTyping
    };
};
