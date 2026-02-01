import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Text, View, ActivityIndicator, AppState } from 'react-native';

// Extracted Components
import { HomeHeader } from '../components/home/HomeHeader';
import { DailyVerse } from '../components/home/DailyVerse';
import { QuickActions } from '../components/home/QuickActions';
import { DevotionalList } from '../components/home/DevotionalList';
import { RecentNotes } from '../components/home/RecentNotes';
import { RecentPrayers } from '../components/home/RecentPrayers';
import { useSession, authService } from '../services/auth';
import { API_BASE_URL } from '../services/apiConfig';
import { Tab, JournalEntry, Prayer } from '../types';
import { notificationService } from '../services/notificationService';
import { fastingService } from '../services/fastingService';
import { cacheService } from '../services/cacheService';
import { ActiveFastCard } from '../components/home/ActiveFastCard';
import { FastingSession } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { data: session } = useSession();
  const firstName = session?.user?.name ? session.user.name.trim().split(' ')[0] : "User";

  const time = new Date();
  const hours = time.getHours();
  let greeting = "Good Morning";
  if (hours >= 12 && hours < 17) greeting = "Good Afternoon";
  if (hours >= 17) greeting = "Good Evening";

  const [dailyVerse, setDailyVerse] = React.useState({
    id: null as string | null,
    reference: "Psalms 145:18",
    text: "The Lord is near to all who call upon Him, to all who call upon Him in truth.",
    version: "NKJV",
    affirmation: "I am never alone, for the Lord is with me always.",
    theme: "Faith",
    backgroundImage: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80",
    likes: 0,
    shares: 0,
    downloads: 0,
    userLiked: false
  });

  const [notes, setNotes] = React.useState<JournalEntry[]>([]);
  const [prayers, setPrayers] = React.useState<Prayer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isVerseLoading, setIsVerseLoading] = React.useState(true);
  const [activeFast, setActiveFast] = React.useState<FastingSession | null>(null);

  const lastFetchDate = React.useRef<string>('');

  // Fallback images for Daily Verse (Client-side rotation)
  const FALLBACK_BACKGROUNDS = [
    "https://images.unsplash.com/photo-1576360427338-b75e204055d8?q=80&w=1089&auto=format&fit=crop", // User provided
    "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80",  // Nature
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",  // Mountains
    "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?auto=format&fit=crop&w=800&q=80",  // Forest
    "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",  // Stars
    "https://images.unsplash.com/photo-1505118380757-91f5f5631fc0?auto=format&fit=crop&w=800&q=80",  // Ocean
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=80",  // Dawn
  ];

  const fetchDailyVerse = React.useCallback(async (skipCache = false) => {
    const now = new Date();
    const targetDateString = now.toISOString().split('T')[0];

    // Try cache first if not skipping
    if (!skipCache) {
      const cached = await cacheService.get<any>('daily_verse');
      if (cached && cached.fetchDate === targetDateString) {
        setDailyVerse(cached);
        setIsVerseLoading(false);
      }
    }

    if (targetDateString === lastFetchDate.current) return;

    try {
      const { bibleService } = await import('../services/bibleService');
      const verse = await bibleService.getDailyVerse(targetDateString);

      const dayOfMonth = now.getDate();
      const fallbackImage = FALLBACK_BACKGROUNDS[dayOfMonth % FALLBACK_BACKGROUNDS.length];

      if (verse && verse.id) {
        lastFetchDate.current = targetDateString;
        const isValidBackendImage = verse.background_image &&
          verse.background_image.startsWith('http') &&
          !verse.background_image.includes('source.unsplash.com');

        const bgImage = isValidBackendImage ? verse.background_image : fallbackImage;

        const verseData = {
          id: verse.id,
          reference: verse.reference,
          text: verse.text,
          version: verse.version,
          affirmation: verse.affirmation || "I walk in God's grace today.",
          theme: verse.theme || "Faith",
          backgroundImage: bgImage,
          likes: verse.likes_count || 0,
          shares: verse.shares_count || 0,
          downloads: verse.downloads_count || 0,
          userLiked: verse.user_liked || false,
          fetchDate: targetDateString
        };

        setDailyVerse(verseData);
        await cacheService.set('daily_verse', verseData);

        try {
          await notificationService.scheduleDailyAffirmation(
            7, 0,
            `${verse.reference} ${verse.text}`,
            verse.affirmation || "I walk in God's grace today."
          );
        } catch (notifErr) {
          console.error("Failed to schedule affirmation:", notifErr);
        }
      }
    } catch (err) {
      console.error('getDailyVerse error:', err);
    } finally {
      setIsVerseLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDailyVerse();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        fetchDailyVerse();
      }
    });

    // Auto-refresh at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    // Add a small buffer (e.g., 10 seconds) to ensure server date has also flipped
    const midnightTimer = setTimeout(() => {
      fetchDailyVerse();
    }, msUntilMidnight + 10000);

    return () => {
      subscription.remove();
      clearTimeout(midnightTimer);
    };
  }, [session, fetchDailyVerse]);

  React.useEffect(() => {
    const fetchData = async () => {
      // Load Cached Data first for instant UI
      const [cachedNotes, cachedPrayers, cachedFast] = await Promise.all([
        cacheService.get<JournalEntry[]>('home_notes'),
        cacheService.get<Prayer[]>('home_prayers'),
        cacheService.get<FastingSession>('home_fast')
      ]);

      if (cachedNotes) setNotes(cachedNotes);
      if (cachedPrayers) setPrayers(cachedPrayers);
      if (cachedFast) setActiveFast(cachedFast);
      if (cachedNotes || cachedPrayers) setIsLoading(false);

      try {
        const token = await authService.getToken();

        const [notesRes, prayersRes, fast] = await Promise.all([
          fetch(`${API_BASE_URL}reflections`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
          }),
          fetch(`${API_BASE_URL}prayers`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
          }),
          fastingService.getActiveSession()
        ]);

        if (notesRes.ok) {
          const data = await notesRes.json();
          const mappedNotes = data.slice(0, 3).map((item: any) => ({
            id: item.id.toString(),
            title: item.title,
            content: item.content,
            date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            category: item.category || 'Note'
          }));
          setNotes(mappedNotes);
          cacheService.set('home_notes', mappedNotes);
        }

        if (prayersRes.ok) {
          const pData = await prayersRes.json();
          const mappedPrayers = pData.slice(0, 3);
          setPrayers(mappedPrayers);
          cacheService.set('home_prayers', mappedPrayers);
        }

        if (fast && fast.status === 'active') {
          setActiveFast(fast);
          cacheService.set('home_fast', fast);
        } else {
          setActiveFast(null);
          cacheService.remove('home_fast');
        }
      } catch (err) {
        console.error('Home fetchData error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const suggestedDevotionals = [
    { id: '1', title: 'David & Goliath', plan: 'Coming Soon' },
    { id: '2', title: 'The Good Samaritan', plan: 'Coming Soon' },
    { id: '3', title: 'Daniel in the Lions\' Den', plan: 'Coming Soon' },
  ];

  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <HomeHeader
        greeting={greeting}
        date={formattedDate}
        userName={firstName}
      />


      {isVerseLoading ? (
        <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#E8503A" />
          <Text style={{ color: '#666666', marginTop: 12, fontSize: 12 }}>Syncing your daily word...</Text>
        </View>
      ) : (
        <DailyVerse
          id={dailyVerse.id}
          reference={dailyVerse.reference}
          text={dailyVerse.text}
          version={dailyVerse.version}
          affirmation={dailyVerse.affirmation}
          theme={dailyVerse.theme}
          backgroundImage={dailyVerse.backgroundImage}
          initialLikes={dailyVerse.likes}
          initialShares={dailyVerse.shares}
          initialDownloads={dailyVerse.downloads}
          initialUserLiked={dailyVerse.userLiked}
        />
      )}

      <QuickActions onNavigate={onNavigate} />

      <RecentPrayers
        prayers={prayers}
        onViewAll={() => onNavigate(Tab.JOURNEY)}
      />

      {activeFast && (
        <ActiveFastCard
          session={activeFast}
          onPress={() => onNavigate(Tab.JOURNEY)}
        />
      )}



      <RecentNotes
        notes={notes.map(n => ({
          id: n.id,
          title: n.title,
          preview: n.content,
          date: n.date
        }))}
        onViewAll={() => onNavigate(Tab.JOURNEY)}
      />

      <DevotionalList devotionals={suggestedDevotionals} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    paddingTop: 0,
    paddingBottom: 80,
  },
});

export default HomeScreen;