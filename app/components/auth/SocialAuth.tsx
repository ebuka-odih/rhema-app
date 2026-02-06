import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

interface SocialAuthProps {
    onGooglePress: () => void;
    onApplePress?: () => void;
    showGoogle?: boolean;
    showApple?: boolean;
}

export const SocialAuth: React.FC<SocialAuthProps> = ({
    onGooglePress,
    onApplePress,
    showGoogle = true,
    showApple = false,
}) => {
    if (!showGoogle && !showApple) return null;

    return (
        <View style={styles.socialContainer}>
            <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
                {showApple && onApplePress && (
                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
                        cornerRadius={12}
                        style={styles.appleButton}
                        onPress={onApplePress}
                    />
                )}
                {showGoogle && (
                    <TouchableOpacity style={styles.socialButton} onPress={onGooglePress}>
                        <Text style={styles.socialButtonText}>Google</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    socialContainer: {
        marginTop: 24,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    dividerText: {
        fontSize: 14,
        color: '#666666',
        marginHorizontal: 16,
    },
    socialButtons: {
        flexDirection: 'column',
        gap: 12,
        marginBottom: 32,
    },
    appleButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
    },
    socialButton: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    socialButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
