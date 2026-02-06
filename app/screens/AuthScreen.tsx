import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
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
  const [mode, setMode] = useState<'login' | 'signup' | 'reset_password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  const isGoogleAvailable = !!NativeModules.RNGoogleSignin;

  React.useEffect(() => {
    if (Platform.OS === 'web') return;

    if (!NativeModules.RNGoogleSignin) return;

    try {
      const GoogleSigninModule = require('@react-native-google-signin/google-signin');
      const GoogleSignin = GoogleSigninModule.GoogleSignin;

      if (GoogleSignin) {
        const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
          || '335759882370-olmomtjn2n2q97sujehp3rpknp6jlk2h.apps.googleusercontent.com';
        const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

        GoogleSignin.configure({
          webClientId,
          iosClientId,
          offlineAccess: true,
          forceCodeForRefreshToken: true,
        });
      }
    } catch (e) {
      // Completely silent in dev
    }
  }, []);

  React.useEffect(() => {
    if (Platform.OS !== 'ios') return;
    AppleAuthentication.isAvailableAsync()
      .then(setIsAppleAvailable)
      .catch(() => setIsAppleAvailable(false));
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

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Forgot Password', 'Please enter your email address first so we know which account to reset.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn.forgotPassword(email);
      if (error) {
        Alert.alert('Error', error.message || 'Failed to send reset email. Please try again later.');
      } else {
        Alert.alert(
          'Reset Code Sent',
          `A 6-digit reset code has been sent to ${email}. Please enter it on the next screen to reset your password.`,
          [{
            text: 'OK',
            onPress: () => setMode('reset_password')
          }]
        );
      }
    } catch (err: any) {
      Alert.alert('Error', 'An unexpected error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn.resetPassword({
        email,
        code: resetCode,
        password,
        password_confirmation: confirmPassword
      });

      if (error) {
        Alert.alert('Reset Error', error.message || 'Invalid or expired code');
      } else {
        Alert.alert(
          'Success',
          'Your password has been reset successfully. You can now log in with your new password.',
          [{ text: 'Great', onPress: () => setMode('login') }]
        );
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
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices();
      }
      const userInfo = await GoogleSignin.signIn();

      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens?.accessToken;

      if (accessToken) {
        setLoading(true);
        const { error } = await signIn.google(accessToken);

        if (error) {
          Alert.alert('Login Error', error.message || 'Failed to authenticate with backend');
        } else {
          onAuthenticated();
        }
      } else {
        throw new Error('No access token obtained from Google');
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

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const identityToken = credential.identityToken;
      if (!identityToken) {
        throw new Error('No identity token returned from Apple');
      }

      const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(' ')
        .trim();

      setLoading(true);
      const { error } = await signIn.apple({
        identityToken,
        fullName: fullName || undefined,
        email: credential.email || undefined,
      });

      if (error) {
        Alert.alert('Login Error', error.message || 'Failed to authenticate with Apple');
      } else {
        onAuthenticated();
      }
    } catch (err: any) {
      if (err?.code === 'ERR_CANCELED' || err?.code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert('Apple Sign-In Error', err?.message || 'Unable to sign in with Apple');
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
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'reset_password' && 'Reset Password'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'login' && 'Sign in to continue your spiritual journey'}
            {mode === 'signup' && 'Begin your journey of faith and growth'}
            {mode === 'reset_password' && 'Enter the 6-digit code sent to your email and your new password.'}
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
            editable={mode !== 'reset_password'}
          />

          {mode === 'reset_password' && (
            <AuthInput
              label="Reset Code"
              placeholder="Enter 6-digit code"
              value={resetCode}
              onChangeText={setResetCode}
              keyboardType="number-pad"
              maxLength={6}
            />
          )}

          <AuthInput
            label={mode === 'reset_password' ? "New Password" : "Password"}
            placeholder={mode === 'reset_password' ? "Set new password" : "Enter your password"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {mode === 'reset_password' && (
            <AuthInput
              label="Confirm New Password"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          )}

          {mode === 'login' && (
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={mode === 'reset_password' ? handleResetPassword : handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'reset_password' && 'Update Password'}
              </Text>
            )}
          </TouchableOpacity>

          {(isGoogleAvailable || isAppleAvailable) && (
            <SocialAuth
              onGooglePress={handleGoogleLogin}
              onApplePress={handleAppleLogin}
              showGoogle={isGoogleAvailable}
              showApple={isAppleAvailable}
            />
          )}

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {mode === 'login' && "Don't have an account? "}
              {mode === 'signup' && "Already have an account? "}
              {mode === 'reset_password' && "Remembered your password? "}
            </Text>
            <TouchableOpacity onPress={() => {
              if (mode === 'reset_password') setMode('login');
              else setMode(mode === 'login' ? 'signup' : 'login');
            }}>
              <Text style={styles.toggleLink}>
                {mode === 'login' && 'Sign Up'}
                {mode === 'signup' && 'Sign In'}
                {mode === 'reset_password' && 'Back to Login'}
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
