import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { bibleService, BibleVersion, BibleChapter, BibleBook } from '../services/bibleService';
import { IconNote } from '../components/Icons';

// Extracted Components
import { BibleHeader } from '../components/bible/BibleHeader';
import { VersionSelector } from '../components/bible/VersionSelector';
import { BookChapterSelector } from '../components/bible/BookChapterSelector';
import { ReaderView } from '../components/bible/ReaderView';
import { FloatingControls } from '../components/bible/FloatingControls';
import { FontSettingsMenu } from '../components/bible/FontSettingsMenu';
import { HighlightMenu } from '../components/bible/HighlightMenu';
import { useSession } from '../services/auth';
import { BibleHighlight, BibleBookmark } from '../types';

interface BibleScreenProps {
  initialBook?: string;
  initialChapter?: number;
  onNavigateNote?: (content?: string) => void;
}

const BibleScreen: React.FC<BibleScreenProps> = ({ initialBook, initialChapter, onNavigateNote }) => {
  const { data: session } = useSession();
  const isPro = session?.user?.is_pro || false;

  const [fontSize, setFontSize] = useState(18);
  const [chapter, setChapter] = useState(initialChapter || 1);
  const [book, setBook] = useState(initialBook || "Genesis");
  const [version, setVersion] = useState<BibleVersion>({
    id: 'NEW KING JAMES VERSION',
    name: 'NEW KING JAMES VERSION',
    short_name: 'NKJV'
  });

  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showVersionMenu, setShowVersionMenu] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);

  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [currentBookData, setCurrentBookData] = useState<BibleBook | null>(null);
  const [bibleData, setBibleData] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  // Highlighting State
  const [highlights, setHighlights] = useState<BibleHighlight[]>([]);
  const [bookmarks, setBookmarks] = useState<BibleBookmark[]>([]);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

  // Persistence Key
  const BIBLE_STATE_KEY = 'last_read_bible_state';

  // Fetch Versions and Persistence on Mount
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Get versions (Sync if possible)
        let availableVersions = bibleService.getVersionsSync();
        if (!availableVersions) {
          availableVersions = await bibleService.getVersions();
        }
        setVersions(availableVersions || []);

        // 2. Load persisted state
        const savedState = await SecureStore.getItemAsync(BIBLE_STATE_KEY);
        let initialVersion = availableVersions?.[0] || { id: 'NKJV', name: 'NKJV', short_name: 'NKJV' };
        let currentBook = initialBook || "Genesis";
        let currentChapterNum = initialChapter || 1;

        if (savedState && !initialBook && !initialChapter) {
          const parsed = JSON.parse(savedState);
          const versionExists = availableVersions?.find(v => v.id === parsed.versionId);
          if (versionExists) {
            initialVersion = versionExists;
            currentBook = parsed.book || currentBook;
            currentChapterNum = parsed.chapter || currentChapterNum;
          }
        }

        setVersion(initialVersion);
        setBook(currentBook);
        setChapter(currentChapterNum);

        // 3. Try to get everything else Sync first for instant render
        const syncBooks = bibleService.getBooksSync(initialVersion.id);
        const syncChapter = bibleService.getChapterSync(initialVersion.id, currentBook, currentChapterNum);

        if (syncBooks && syncChapter) {
          setBooks(syncBooks);
          const bookData = syncBooks.find(b => b.name === currentBook) || syncBooks[0];
          setCurrentBookData(bookData);
          setBibleData(syncChapter);
          setLoading(false);
          // Still fetch fresh highlights in background
          bibleService.getHighlightsForChapter(initialVersion.id, currentBook, currentChapterNum).then(setHighlights);
        } else {
          // Fallback to Async fetch
          const [availableBooks, initialData, initialHighlights] = await Promise.all([
            bibleService.getBooks(initialVersion.id),
            bibleService.getChapter(initialVersion.id, currentBook, currentChapterNum),
            bibleService.getHighlightsForChapter(initialVersion.id, currentBook, currentChapterNum)
          ]);

          setBooks(availableBooks);
          const bookData = availableBooks.find(b => b.name === currentBook) || availableBooks[0];
          setCurrentBookData(bookData);
          setBibleData(initialData);
          setHighlights(initialHighlights || []);

          // Fetch bookmarks in background
          bibleService.getBookmarksForChapter(initialVersion.id, currentBook, currentChapterNum)
            .then(setBookmarks);

          setLoading(false);
        }
      } catch (e) {
        console.error('Bible init error:', e);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (!isInitializing) {
      SecureStore.setItemAsync(BIBLE_STATE_KEY, JSON.stringify({
        versionId: version.id,
        book,
        chapter
      }));
    }
  }, [version, book, chapter, isInitializing]);

  // Fetch Chapter Content & Highlights
  useEffect(() => {
    if (isInitializing) return;

    const fetchChapter = async () => {
      // Avoid redundant fetches if we already have the right data
      if (bibleData &&
        bibleData.version === version.id &&
        bibleData.book === book &&
        bibleData.chapter === chapter.toString()) {
        return;
      }

      const cached = bibleService.getChapterSync(version.id, book, chapter);
      if (cached) {
        setBibleData(cached);
        setLoading(false);
        // We still fetch highlights in background, but content is instant
        const chapterHighlights = await bibleService.getHighlightsForChapter(version.id, book, chapter);
        setHighlights(chapterHighlights || []);
      } else {
        setLoading(true);
        const [chapterData, chapterHighlights, chapterBookmarks] = await Promise.all([
          bibleService.getChapter(version.id, book, chapter),
          bibleService.getHighlightsForChapter(version.id, book, chapter),
          bibleService.getBookmarksForChapter(version.id, book, chapter)
        ]);
        setBibleData(chapterData);
        setHighlights(chapterHighlights || []);
        setBookmarks(chapterBookmarks || []);
        setLoading(false);
      }
      setSelectedVerses([]); // Clear selection

      // Prefetch Next Chapter for seamless offline/fast reading
      if (currentBookData) {
        if (chapter < currentBookData.chapters) {
          bibleService.getChapter(version.id, book, chapter + 1);
        } else {
          const currentIndex = books.findIndex(b => b.name === book);
          if (currentIndex < books.length - 1) {
            bibleService.getChapter(version.id, books[currentIndex + 1].name, 1);
          }
        }
      }
    };
    fetchChapter();
  }, [version, book, chapter, isInitializing]);

  const handleNextChapter = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (currentBookData && chapter < currentBookData.chapters) {
      setChapter(prev => prev + 1);
    } else {
      const currentIndex = books.findIndex(b => b.name === book);
      if (currentIndex < books.length - 1) {
        const nextBook = books[currentIndex + 1];
        setBook(nextBook.name);
        setCurrentBookData(nextBook);
        setChapter(1);
      }
    }
  };

  const handlePrevChapter = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (chapter > 1) {
      setChapter(prev => prev - 1);
    } else {
      const currentIndex = books.findIndex(b => b.name === book);
      if (currentIndex > 0) {
        const prevBook = books[currentIndex - 1];
        setBook(prevBook.name);
        setCurrentBookData(prevBook);
        setChapter(prevBook.chapters);
      }
    }
  };

  const handleVersionSelect = async (v: BibleVersion) => {
    setVersion(v);
    setShowVersionMenu(false);
    const availableBooks = await bibleService.getBooks(v.id);
    setBooks(availableBooks);
  };

  const handleBookChapterSelect = (selectedBookName: string, selectedChapter: number) => {
    const selectedBookData = books.find(b => b.name === selectedBookName);
    if (selectedBookData) {
      setBook(selectedBookName);
      setCurrentBookData(selectedBookData);
      setChapter(selectedChapter);
      setShowBookModal(false);
    }
  };

  const handleVersePress = (verseNum: number) => {
    setSelectedVerses(prev => {
      if (prev.includes(verseNum)) {
        return prev.filter(v => v !== verseNum);
      } else {
        return [...prev, verseNum].sort((a, b) => a - b);
      }
    });
  };

  const handleHighlight = async (color: string) => {
    if (selectedVerses.length === 0) return;

    // Optimistic Update
    const newHighlightsToAdd = selectedVerses.map(v => ({
      version_id: version.id,
      book,
      chapter,
      verse: v,
      color
    }));

    setHighlights(prev => {
      const filtered = prev.filter(h => !selectedVerses.includes(h.verse));
      return [...filtered, ...newHighlightsToAdd];
    });
    setSelectedVerses([]);

    try {
      await Promise.all(selectedVerses.map(v =>
        bibleService.saveHighlight({
          version_id: version.id,
          book,
          chapter,
          verse: v,
          color
        })
      ));

      // Secondary fetch to ensure consistency with backend (IDs etc)
      const freshHighlights = await bibleService.getHighlightsForChapter(version.id, book, chapter);
      setHighlights(freshHighlights);
    } catch (err) {
      console.error('Highlight error:', err);
    }
  };

  const handleRemoveHighlight = async () => {
    if (selectedVerses.length === 0) return;

    const versesToRemove = [...selectedVerses];

    // Optimistic Update
    setHighlights(prev => prev.filter(h => !versesToRemove.includes(h.verse)));
    setSelectedVerses([]);

    try {
      await Promise.all(versesToRemove.map(v =>
        bibleService.removeHighlight(version.id, book, chapter, v)
      ));

      // Final sync
      const freshHighlights = await bibleService.getHighlightsForChapter(version.id, book, chapter);
      setHighlights(freshHighlights);
    } catch (err) {
      console.error('Remove highlight error:', err);
    }
  };

  const handleBookmark = async () => {
    if (selectedVerses.length === 0) return;

    const versesToToggle = [...selectedVerses];

    // Toggle state optimistically
    // We'll just toggle the first one for simplicity of UI state if multiple selected, 
    // or toggle all to "bookmarked" if any are unbookmarked.
    const anyUnbookmarked = versesToToggle.some(v => !bookmarks.some(b => b.verse === v));

    setBookmarks(prev => {
      if (anyUnbookmarked) {
        const newBookmarks = versesToToggle
          .filter(v => !prev.some(b => b.verse === v))
          .map(v => ({
            version_id: version.id,
            book,
            chapter,
            verse: v,
            text: bibleData?.verses[v.toString()] || ''
          }));
        return [...prev, ...newBookmarks];
      } else {
        return prev.filter(b => !versesToToggle.includes(b.verse));
      }
    });

    try {
      await Promise.all(versesToToggle.map(v =>
        bibleService.toggleBookmark({
          version_id: version.id,
          book,
          chapter,
          verse: v,
          text: bibleData?.verses[v.toString()] || ''
        })
      ));

      const freshBookmarks = await bibleService.getBookmarksForChapter(version.id, book, chapter);
      setBookmarks(freshBookmarks);
      setSelectedVerses([]);
    } catch (err) {
      console.error('Bookmark toggle error:', err);
    }
  };

  const handleComment = () => {
    if (selectedVerses.length === 0 || !onNavigateNote) return;

    const sorted = [...selectedVerses].sort((a, b) => a - b);
    let reference = '';

    if (sorted.length === 1) {
      reference = `${book} ${chapter}:${sorted[0]}`;
    } else {
      // Check if contiguous
      const isContiguous = sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1);
      if (isContiguous) {
        reference = `${book} ${chapter}:${sorted[0]}-${sorted[sorted.length - 1]}`;
      } else {
        reference = `${book} ${chapter}:${sorted.join(', ')}`;
      }
    }

    onNavigateNote(reference);
    setSelectedVerses([]);
  };

  return (
    <View style={styles.container}>
      <BibleHeader
        book={book}
        chapter={chapter}
        shortVersion={version.short_name}
        onOpenBookSelector={() => setShowBookModal(true)}
        onOpenVersionSelector={() => setShowVersionMenu(true)}
        onToggleFontMenu={() => setShowFontMenu(!showFontMenu)}
      />

      <FontSettingsMenu
        visible={showFontMenu}
        fontSize={fontSize}
        onUpdateFontSize={setFontSize}
      />

      <VersionSelector
        visible={showVersionMenu}
        versions={versions}
        currentVersionId={version.id}
        onSelect={handleVersionSelect}
        onClose={() => setShowVersionMenu(false)}
      />

      <BookChapterSelector
        visible={showBookModal}
        books={books}
        currentBook={book}
        currentChapter={chapter}
        onSelectChapter={handleBookChapterSelect}
        onClose={() => setShowBookModal(false)}
      />

      <ReaderView
        loading={loading}
        book={book}
        chapter={chapter}
        bibleData={bibleData}
        fontSize={fontSize}
        highlights={highlights}
        selectedVerses={selectedVerses}
        onVersePress={handleVersePress}
      />

      <HighlightMenu
        visible={selectedVerses.length > 0}
        isBookmarked={selectedVerses.length > 0 && selectedVerses.every(v => bookmarks.some(b => b.verse === v))}
        onSelectColor={handleHighlight}
        onBookmark={handleBookmark}
        onComment={handleComment}
        onRemove={handleRemoveHighlight}
        onClose={() => setSelectedVerses([])}
      />

      <FloatingControls
        onPrev={handlePrevChapter}
        onNext={handleNextChapter}
        isPro={isPro}
      />

      {/* Note Floating Action Button - Moved to Top Right */}
      {selectedVerses.length === 0 && onNavigateNote && (
        <TouchableOpacity
          style={styles.noteFab}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onNavigateNote();
          }}
          activeOpacity={0.8}
        >
          <IconNote size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  noteFab: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(232, 80, 58, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  }
});

export default BibleScreen;
