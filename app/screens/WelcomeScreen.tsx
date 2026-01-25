import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconArrowRight } from '../components/Icons';
import { Logo } from '../components/Logo';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onTermsPress: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, onLogin, onTermsPress }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Background Image with Overlay */}
      <View style={styles.backgroundContainer} pointerEvents="none">
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1502481851541-7cc86ac743ea?auto=format&fit=crop&w=800&q=80" }}
          style={styles.backgroundImage}
        />
        <View style={styles.overlay} />
      </View>

      {/* Content */}
      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom + 20, 32) }]}>
        <View style={styles.spacer} />

        <View style={styles.textContainer}>
          <View style={styles.iconContainer}>
            <Logo size={64} />
          </View>

          <Text style={styles.title}>
            Reflect.{'\n'}
            Grow.{'\n'}
            <Text style={styles.titleAccent}>Flow.</Text>
          </Text>

          <Text style={styles.subtitle}>
            Your digital sanctuary for spiritual growth, daily devotionals, and sermon insights.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={onGetStarted}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <IconArrowRight size={20} color="#000000" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onLogin}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>I have an account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>By continuing, you agree to our </Text>
          <TouchableOpacity onPress={onTermsPress} activeOpacity={0.7} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.termsText}> and </Text>
          <TouchableOpacity onPress={onTermsPress} activeOpacity={0.7} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.termsText}>.</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    position: 'relative',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 13, 13, 0.8)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 32,
    paddingBottom: 48,
    zIndex: 10,
  },
  spacer: {
    flex: 1,
    paddingTop: 80,
  },
  textContainer: {
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 56,
  },
  titleAccent: {
    color: '#E8503A',
  },
  subtitle: {
    fontSize: 18,
    color: '#999999',
    lineHeight: 28,
    maxWidth: 300,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsContainer: {
    marginTop: 16,
    paddingVertical: 8,
    zIndex: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: '#666666',
  },
  linkText: {
    fontSize: 12,
    color: '#FFFFFF',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

export default WelcomeScreen;