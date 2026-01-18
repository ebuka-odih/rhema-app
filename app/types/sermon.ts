export interface Sermon {
    id: string;
    title: string;
    date: string;
    duration: string;
    transcription?: string;
    summary?: string;
}

export type ViewState = 'LIST' | 'DETAIL' | 'RECORD';
