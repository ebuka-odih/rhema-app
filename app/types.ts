export interface Verse {
  reference: string;
  text: string;
  version: string;
}

export interface Note {
  id: string;
  title: string;
  preview: string;
  date: string;
  tags?: string[];
}

export interface FastingGroup {
  id: string;
  name: string;
  members: number;
  description: string;
  joined: boolean;
  code?: string;
  created_by?: string;
  is_admin?: boolean;
}

export interface FastingSession {
  id: string;
  user_id: string;
  duration_hours: number;
  start_time: string;
  end_time?: string;
  recommend_verses: boolean;
  reminder_interval?: number;
  status: 'active' | 'completed' | 'cancelled';
  recommended_verse?: {
    text: string;
    ref: string;
  };
}

export interface Recording {
  id: string;
  title: string;
  date: string;
  duration: string; // formatted string like "45:02"
  transcription?: string;
  summary?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
}

export interface Prayer {
  id: string;
  request: string;
  time: string;
  reminder_enabled: boolean;
  status: 'active' | 'done';
  created_at?: string;
}

export interface BibleHighlight {
  id?: string;
  user_id?: string;
  version_id: string;
  book: string;
  chapter: number;
  verse: number;
  color: string;
  note?: string;
}

export interface BibleBookmark {
  id?: string;
  user_id?: string;
  version_id: string;
  book: string;
  chapter: number;
  verse: number;
  text?: string;
  created_at?: string;
}

export interface ActivityItem {
  id: string;
  type: 'devotion' | 'journal' | 'sermon' | 'prayer' | 'fasting';
  title: string;
  timestamp: string;
}

export enum Tab {
  HOME = 'Home',
  BIBLE = 'Read',
  RECORD = 'Record',
  JOURNEY = 'Journey',
  MORE = 'More'
}
