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
    id: "default",
    reference: "Psalms 145:18",
    text: "The Lord is near to all who call upon Him, to all who call upon Him in truth.",
    version: "NKJV",
    affirmation: "I am never alone, for the Lord is with me always.",
    theme: "Faith",
    backgroundImage: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80",
    likes: 124,
    shares: 45,
    downloads: 32,
    userLiked: false
  });

  const [notes, setNotes] = React.useState<JournalEntry[]>([]);
  const [prayers, setPrayers] = React.useState<Prayer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isVerseLoading, setIsVerseLoading] = React.useState(true);

  const lastFetchDate = React.useRef<string>('');

  const fetchDailyVerse = React.useCallback(async () => {
    const now = new Date();
    // Use actual local date
    const targetDateString = now.toISOString().split('T')[0];

    // If we have already fetched for this date, do nothing
    if (targetDateString === lastFetchDate.current) return;

    setIsVerseLoading(true);
    try {
      const { bibleService } = await import('../services/bibleService');

      // Pass the simulated date to the service
      const verse = await bibleService.getDailyVerse(targetDateString);

      if (verse && verse.id) {
        lastFetchDate.current = targetDateString;
        setDailyVerse({
          id: verse.id,
          reference: verse.reference,
          text: verse.text,
          version: verse.version,
          affirmation: verse.affirmation || "I walk in God's grace today.",
          theme: verse.theme || "Faith",
          backgroundImage: verse.background_image,
          likes: verse.likes_count || 0,
          shares: verse.shares_count || 0,
          downloads: verse.downloads_count || 0,
          userLiked: verse.user_liked || false
        });

        // Sync Notification for Unity
        // Schedule/Update the daily affirmation notification to match the current daily verse
        // This ensures that if the notification fires (e.g. tomorrow morning if app isn't opened),
        // it matches what was last seen or fetched.
        // We schedule it for 7:00 AM.
        try {
          await notificationService.scheduleDailyAffirmation(
            7,
            0,
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
      try {
        const token = await authService.getToken();

        // Fetch Notes (Reflections)
        const notesRes = await fetch(`${API_BASE_URL}reflections`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
        if (notesRes.ok) {
          const data = await notesRes.json();
          setNotes(data.slice(0, 3).map((item: any) => ({
            id: item.id.toString(),
            title: item.title,
            content: item.content,
            date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            category: item.category || 'Note'
          })));
        }

        // Fetch Prayers
        const prayersRes = await fetch(`${API_BASE_URL}prayers`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' },
        });
        if (prayersRes.ok) {
          const data = await prayersRes.json();
          setPrayers(data.slice(0, 3));
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