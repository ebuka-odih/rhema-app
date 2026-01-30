import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { useSession, signOut } from '../services/auth';
import {
  IconUser, IconSettings, IconBell, IconLock,
  IconShield, IconStar, IconHelp, IconLogout,
  IconChevronRight, IconArrowLeft, IconShare
} from '../components/Icons';
import QRCodeScreen from './QRCodeScreen';

import PersonalInfoScreen from './settings/PersonalInfoScreen';
import SecurityScreen from './settings/SecurityScreen';
import SubscriptionScreen from './settings/SubscriptionScreen';
import NotificationSettingsScreen from './settings/NotificationSettingsScreen';
import PrivacyScreen from './settings/PrivacyScreen';
import HelpSupportScreen from './settings/HelpSupportScreen';

const SettingsItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  isDanger?: boolean;
}> = ({ icon, label, value, onPress, showChevron = true, isDanger = false }) => (
  <TouchableOpacity
    style={styles.settingsItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.settingsItemLeft}>
      <View style={[styles.iconContainer, isDanger && styles.dangerIconContainer]}>
        {icon}
      </View>
      <Text style={[styles.settingsLabel, isDanger && styles.dangerText]}>{label}</Text>
    </View>
    <View style={styles.settingsItemRight}>
      {value && <Text style={styles.settingsValue}>{value}</Text>}
      {showChevron && <IconChevronRight size={20} color="#666666" />}
    </View>
  </TouchableOpacity>
);

type SettingsView = 'MAIN' | 'PERSONAL_INFO' | 'SECURITY' | 'SUBSCRIPTION' | 'NOTIFICATIONS' | 'PRIVACY' | 'HELP' | 'QR_CODE';

const MoreScreen: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [currentView, setCurrentView] = React.useState<SettingsView>('MAIN');

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: async () => await signOut() }
      ]
    );
  };

  if (currentView === 'PERSONAL_INFO') return <PersonalInfoScreen onBack={() => setCurrentView('MAIN')} />;
  if (currentView === 'SECURITY') return <SecurityScreen onBack={() => setCurrentView('MAIN')} />;
  if (currentView === 'SUBSCRIPTION') return <SubscriptionScreen onBack={() => setCurrentView('MAIN')} />;
  if (currentView === 'NOTIFICATIONS') return <NotificationSettingsScreen onBack={() => setCurrentView('MAIN')} />;
  if (currentView === 'PRIVACY') return <PrivacyScreen onBack={() => setCurrentView('MAIN')} />;
  if (currentView === 'HELP') return <HelpSupportScreen onBack={() => setCurrentView('MAIN')} />;
  if (currentView === 'QR_CODE') return <QRCodeScreen onBack={() => setCurrentView('MAIN')} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
              <View style={styles.badgeContainer}>
                <View style={[styles.badge, user?.is_pro ? styles.proBadge : styles.freeBadge]}>
                  <IconStar size={12} color={user?.is_pro ? '#FFD700' : '#666666'} />
                  <Text style={[styles.badgeText, user?.is_pro ? styles.proBadgeText : styles.freeBadgeText]}>
                    {user?.is_pro ? 'PRO MEMBER' : 'FREE PLAN'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.sectionCard}>
            <SettingsItem
              icon={<IconUser size={20} color="#FFFFFF" />}
              label="Personal Information"
              onPress={() => setCurrentView('PERSONAL_INFO')}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={<IconLock size={20} color="#FFFFFF" />}
              label="Password & Security"
              onPress={() => setCurrentView('SECURITY')}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={<IconStar size={20} color="#FFFFFF" />}
              label="Subscription Plan"
              value={user?.is_pro ? 'Monthly Pro' : 'Free'}
              onPress={() => setCurrentView('SUBSCRIPTION')}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionCard}>
            <SettingsItem
              icon={<IconBell size={20} color="#FFFFFF" />}
              label="Notifications"
              onPress={() => setCurrentView('NOTIFICATIONS')}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={<IconShield size={20} color="#FFFFFF" />}
              label="Privacy & Permissions"
              onPress={() => setCurrentView('PRIVACY')}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & About</Text>
          <View style={styles.sectionCard}>
            <SettingsItem
              icon={<IconShare size={20} color="#FFFFFF" />}
              label="Share App"
              onPress={() => setCurrentView('QR_CODE')}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={<IconHelp size={20} color="#FFFFFF" />}
              label="Help Center"
              onPress={() => setCurrentView('HELP')}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={<IconStar size={20} color="#FFFFFF" />}
              label="About New Wine"
              onPress={() => Alert.alert("Coming Soon", "The About section will be available in a future update.")}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <SettingsItem
              icon={<IconLogout size={20} color="#E8503A" />}
              label="Logout"
              onPress={handleLogout}
              isDanger
              showChevron={false}
            />
          </View>
        </View>

        <Text style={styles.versionText}>Version 1.0.0 (Build 12)</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#111111',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8503A',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proBadge: {
    backgroundColor: 'rgba(232, 80, 58, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(232, 80, 58, 0.3)',
  },
  freeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  proBadgeText: {
    color: '#E8503A',
  },
  freeBadgeText: {
    color: '#666666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#111111',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#111111',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerIconContainer: {
    backgroundColor: 'rgba(232, 80, 58, 0.1)',
  },
  settingsLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dangerText: {
    color: '#E8503A',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsValue: {
    fontSize: 14,
    color: '#666666',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginLeft: 68,
  },
  versionText: {
    fontSize: 12,
    color: '#333333',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MoreScreen;
