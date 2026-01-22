import { useState } from 'react';
import { Alert, Platform } from 'react-native';

interface UseVoiceTranscriptionProps {
    setContent: (update: string | ((prev: string) => string)) => void;
    editorRef: React.RefObject<any>;
}

export const useVoiceTranscription = ({ setContent, editorRef }: UseVoiceTranscriptionProps) => {
    const [interimText, setInterimText] = useState('');
    const [isListeningContinuous, setIsListeningContinuous] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [voiceLevel, setVoiceLevel] = useState(0);

    const toggleVoiceTyping = async () => {
        // For now, show a message that voice typing will be available in a future update
        // Native speech recognition requires additional native modules that need to be configured
        Alert.alert(
            'Voice Typing',
            'Voice typing for journal entries will be available in the next update. For now, please use the keyboard to type your reflections.\n\nNote: Voice transcription is available for sermon recordings.',
            [{ text: 'OK' }]
        );
    };

    return {
        interimText,
        isListeningContinuous,
        isTranscribing,
        voiceLevel,
        toggleVoiceTyping
    };
};
