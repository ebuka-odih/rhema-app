export interface Sermon {
    id: string;
    title: string;
    date: string;
    duration: string;
    transcription?: string;
    summary?: string;
    status?: 'pending' | 'processing' | 'completed' | 'failed';
}

export type ViewState = 'LIST' | 'DETAIL' | 'RECORD';
