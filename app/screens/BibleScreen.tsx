import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { bibleService, BibleVersion, BibleChapter, BibleBook } from '../services/bibleService';

// Extracted Components
import { BibleHeader } from '../components/bible/BibleHeader';
import { VersionSelector } from '../components/bible/VersionSelector';
import { BookChapterSelector } from '../components/bible/BookChapterSelector';
import { ReaderView } from '../components/bible/ReaderView';
import { FloatingControls } from '../components/bible/FloatingControls';
import { FontSettingsMenu } from '../components/bible/FontSettingsMenu';

const BibleScreen: React.FC = () => {
  const [fontSize, setFontSize] = useState(18);
  const [chapter, setChapter] = useState(1);
  const [book, setBook] = useState("Genesis");
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

  // Fetch Versions and Books on Mount
  useEffect(() => {
    const init = async () => {
      const availableVersions = await bibleService.getVersions();
      setVersions(availableVersions);
      if (availableVersions.length > 0) {
        const defaultVersion = availableVersions[0];
        setVersion(defaultVersion);
        const availableBooks = await bibleService.getBooks(defaultVersion.id);
        setBooks(availableBooks);
        if (availableBooks.length > 0) {
          setCurrentBookData(availableBooks[0]);
        }
      }
    };
    init();
  }, []);

  // Fetch Chapter Content
  useEffect(() => {
    const fetchChapter = async () => {
      setLoading(true);
      const data = await bibleService.getChapter(version.id, book, chapter);
      setBibleData(data);
      setLoading(false);
    };
    fetchChapter();
  }, [version, book, chapter]);

  const handleNextChapter = () => {
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
      />

      <FloatingControls
        onPrev={handlePrevChapter}
        onNext={handleNextChapter}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  }
});

export default BibleScreen;
