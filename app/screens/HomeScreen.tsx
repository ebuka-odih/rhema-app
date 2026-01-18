import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';

// Extracted Components
import { HomeHeader } from '../components/home/HomeHeader';
import { DailyVerse } from '../components/home/DailyVerse';
import { QuickActions } from '../components/home/QuickActions';
import { DevotionalList } from '../components/home/DevotionalList';
import { RecentNotes } from '../components/home/RecentNotes';

import { useSession } from '../services/auth';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";

  const time = new Date();
  const hours = time.getHours();
  let greeting = "Good Morning";
  if (hours >= 12 && hours < 17) greeting = "Good Afternoon";
  if (hours >= 17) greeting = "Good Evening";

  const [dailyVerse, setDailyVerse] = React.useState({
    reference: "Psalms 145:18",
    text: "The Lord is near to all who call upon Him, to all who call upon Him in truth.",
    version: "NKJV"
  });

  React.useEffect(() => {
    import('../services/bibleService').then(({ bibleService }) => {
      bibleService.getDailyVerse().then(verse => {
        if (verse) {
          setDailyVerse({
            reference: verse.reference,
            text: verse.text,
            version: verse.version
          });
        }
      });
    });
  }, []);

  const recentNotes = [
    { id: '1', title: 'Sunday Service: Grace', preview: 'Grace is not just unmerited favor, it is the empowering presence of God...', date: 'Oct 24' },
    { id: '2', title: 'Morning Devotional', preview: 'Focusing on gratitude today. List of 5 things...', date: 'Oct 23' },
  ];

  const suggestedDevotionals = [
    { id: '1', title: 'Walking in Faith', plan: '5 Day Plan' },
    { id: '2', title: 'Power of Prayer', plan: '7 Day Plan' },
    { id: '3', title: 'Grace & Mercy', plan: '3 Day Plan' },
  ];

  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <HomeHeader
        greeting={greeting}
        date={formattedDate}
        userName={userName}
      />


      <DailyVerse
        reference={dailyVerse.reference}
        text={dailyVerse.text}
        version={dailyVerse.version}
      />

      <QuickActions onNavigate={onNavigate} />

      <DevotionalList devotionals={suggestedDevotionals} />

      <RecentNotes notes={recentNotes} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    paddingBottom: 100,
  },
});

export default HomeScreen;