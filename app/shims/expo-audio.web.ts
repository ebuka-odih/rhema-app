import { useEffect, useRef, useState } from 'react';

export type AudioRecorder = {
  uri: string | null;
  _isRecording: boolean;
  _startedAt: number;
  prepareToRecordAsync: () => Promise<void>;
  record: () => void;
  stop: () => Promise<void>;
};

export const RecordingPresets = {
  HIGH_QUALITY: {},
} as const;

const createRecorder = (): AudioRecorder => ({
  uri: null,
  _isRecording: false,
  _startedAt: 0,
  async prepareToRecordAsync() {},
  record() {
    this._isRecording = true;
    this._startedAt = Date.now();
  },
  async stop() {
    this._isRecording = false;
    this.uri = 'data:audio/m4a;base64,';
  },
});

export function useAudioRecorder(_options?: Record<string, any>): AudioRecorder {
  const recorderRef = useRef<AudioRecorder | null>(null);
  if (!recorderRef.current) {
    recorderRef.current = createRecorder();
  }
  return recorderRef.current;
}

export function useAudioRecorderState(recorder: AudioRecorder, intervalMs = 100) {
  const [state, setState] = useState({
    isRecording: recorder._isRecording,
    durationMillis: 0,
    metering: -60,
  });

  useEffect(() => {
    const id = setInterval(() => {
      const durationMillis = recorder._isRecording && recorder._startedAt ? Date.now() - recorder._startedAt : 0;
      setState({
        isRecording: recorder._isRecording,
        durationMillis,
        metering: -35,
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [recorder, intervalMs]);

  return state;
}

export async function setAudioModeAsync(_options: Record<string, any>): Promise<void> {}

export async function requestRecordingPermissionsAsync(): Promise<{ granted: true; status: 'granted' }> {
  return { granted: true, status: 'granted' };
}
