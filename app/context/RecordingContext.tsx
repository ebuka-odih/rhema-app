import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, setAudioModeAsync, requestRecordingPermissionsAsync, AudioRecorder } from 'expo-audio';
import { notificationService } from '../services/notificationService';
import { useKeepAwake } from 'expo-keep-awake';
import { useSession } from '../services/auth';

interface RecordingContextType {
    recorder: AudioRecorder;
    isRecording: boolean;
    duration: number;
    levels: number[];
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<void>;
    resetRecorder: () => void;
    isNewRecording: boolean;
    setIsNewRecording: (val: boolean) => void;
}

const RecordingContext = createContext<RecordingContextType | undefined>(undefined);

export const RecordingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { data: session } = useSession();
    const isPro = session?.user?.is_pro || false;
    const MAX_DURATION = isPro ? 3000 : 600;

    const recorder = useAudioRecorder({
        ...RecordingPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
    });
    const recorderState = useAudioRecorderState(recorder, 50);

    const [duration, setDuration] = useState(0);
    const [levels, setLevels] = useState<number[]>(new Array(40).fill(-60));
    const [isNewRecording, setIsNewRecording] = useState(true);

    useKeepAwake();

    useEffect(() => {
        if (recorderState.isRecording) {
            setDuration(Math.floor(recorderState.durationMillis / 1000));
            if (recorderState.metering !== undefined) {
                setLevels(prev => {
                    const newLevel = recorderState.metering!;
                    const next = [...prev];
                    next.shift();
                    next.push(newLevel);
                    return next;
                });
            }
        }
    }, [recorderState.durationMillis, recorderState.isRecording, recorderState.metering]);

    // Global Limit Enforcement
    useEffect(() => {
        if (recorderState.isRecording && duration >= MAX_DURATION) {
            stopRecording();
            Alert.alert(
                'Limit Reached',
                `Your recording has reached the ${MAX_DURATION / 60} minute limit for your account.`
            );
        }
    }, [duration, recorderState.isRecording, MAX_DURATION]);

    const startRecording = async () => {
        try {
            await setAudioModeAsync({
                allowsRecording: true,
                playsInSilentMode: true,
                interruptionMode: 'doNotMix',
            });

            const status = await requestRecordingPermissionsAsync();
            if (!status.granted) {
                Alert.alert('Permission Denied', 'Microphone permission is required to record.');
                return;
            }

            await recorder.prepareToRecordAsync();
            recorder.record();
            setDuration(0);
            setIsNewRecording(false);
            await notificationService.showRecordingNotification();
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'Failed to start recording. Please try again.');
        }
    };

    const stopRecording = async () => {
        if (!recorderState.isRecording) return;
        try {
            await recorder.stop();
            await notificationService.hideRecordingNotification();
        } catch (err) {
            console.error('Failed to stop recording', err);
        }
    };

    const resetRecorder = () => {
        setDuration(0);
        setIsNewRecording(true);
        setLevels(new Array(40).fill(-60));
    };

    return (
        <RecordingContext.Provider value={{
            recorder,
            isRecording: recorderState.isRecording,
            duration,
            levels,
            startRecording,
            stopRecording,
            resetRecorder,
            isNewRecording,
            setIsNewRecording
        }}>
            {children}
        </RecordingContext.Provider>
    );
};

export const useRecording = () => {
    const context = useContext(RecordingContext);
    if (!context) {
        throw new Error('useRecording must be used within a RecordingProvider');
    }
    return context;
};
