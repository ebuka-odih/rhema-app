import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthHeader } from '../components/auth/AuthHeader';
import { AuthInput } from '../components/auth/AuthInput';
import { SocialAuth } from '../components/auth/SocialAuth';
import { signIn, signUp } from '../services/auth';
import { Alert, ActivityIndicator, NativeModules } from 'react-native';

// GoogleSignin import removed to allow conditional loading
// import { GoogleSignin, statusCodes, isErrorWithCode } from '@react-native-google-signin/google-signin';

interface AuthScreenProps {
  initialMode: 'login' | 'signup';
  onAuthenticated: () => void;
  onBack: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ initialMode, onAuthenticated, onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (Platform.OS === 'web' || __DEV__) return;

    if (!NativeModules.RNGoogleSignin) return;

    try {
      const GoogleSigninModule = require('@react-native-google-signin/google-signin');
      const GoogleSignin = GoogleSigninModule.GoogleSignin;

      if (GoogleSignin) {
        GoogleSignin.configure({
          webClientId: '335759882370-olmomtjn2n2q97sujehp3rpknp6jlk2h.apps.googleusercontent.com',
          offlineAccess: true,
          forceCodeForRefreshToken: true,
        });
      }
    } catch (e) {
      // Completely silent in dev
    }
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (mode === 'signup' && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await signUp.email({
          email,
          password,
          name,
        });

        if (error) {
          Alert.alert('Signup Error', error.message || 'Verification failed');
        } else {
          onAuthenticated();
        }
      } else {
        const { data, error } = await signIn.email({
          email,
          password,
        });

        if (error) {
          Alert.alert('Login Error', error.message || 'Invalid credentials');
        } else {
          onAuthenticated();
        }
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!NativeModules.RNGoogleSignin) {
      Alert.alert(
        "Google Sign-In Preview",
        "Google login requires the native module which isn't available in this preview build.\n\nPlease use Email/Password to sign in."
      );
      return;
    }

    let GoogleSignin;
    let statusCodes: any;
    let isErrorWithCode: any;

    try {
      const GoogleSigninModule = require('@react-native-google-signin/google-signin');
      GoogleSignin = GoogleSigninModule.GoogleSignin;
      statusCodes = GoogleSigninModule.statusCodes;
      isErrorWithCode = GoogleSigninModule.isErrorWithCode;
    } catch (e) {
      Alert.alert(
        "Google Sign-In Error",
        "Failed to load the Google Sign-In module properly."
      );
      return;
    }

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.data?.idToken;
      if (idToken) {
        setLoading(true);
        const { error } = await signIn.google(idToken);

        if (error) {
          Alert.alert('Login Error', error.message || 'Failed to authenticate with backend');
        } else {
          onAuthenticated();
        }
      } else {
        throw new Error('No ID token obtained from Google');
      }
    } catch (error: any) {
      if (isErrorWithCode && isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            // user cancelled the login flow
            break;
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert('Error', 'Google Play Services not available or outdated.');
            break;
          default:
            Alert.alert('Error', error.message);
        }
      } else {
        Alert.alert('Error', error.message || 'An unexpected error occurred during Google Sign-In');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader onBack={onBack} />

        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'login'
              ? 'Sign in to continue your spiritual journey'
              : 'Begin your journey of faith and growth'}
          </Text>
        </View>

        <View style={styles.form}>
          {mode === 'signup' && (
            <AuthInput
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <AuthInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AuthInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {mode === 'login' && (
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

          {!__DEV__ && NativeModules.RNGoogleSignin && (
            <SocialAuth onGooglePress={handleGoogleLogin} />
          )}

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {mode === 'login'
                ? "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              <Text style={styles.toggleLink}>
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    lineHeight: 24,
  },
  form: {
    paddingHorizontal: 24,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#E8503A',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#E8503A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#E8503A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#999999',
  },
  toggleLink: {
    fontSize: 14,
    color: '#E8503A',
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
});

export default AuthScreen;
