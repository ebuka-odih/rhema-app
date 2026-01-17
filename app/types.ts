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
  category: 'Devotion' | 'Prayer' | 'Fasting' | 'Sermon Reflection' | 'Life Lesson';
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
