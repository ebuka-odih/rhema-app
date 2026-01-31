import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { IconArrowLeft } from '../../components/Icons';

const TermsOfServiceScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms of Service</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>

                <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                <Text style={styles.text}>
                    By accessing and using Rhema Daily, you agree to be bound by these Terms of Service.
                    If you do not agree to these terms, please do not use the application.
                </Text>

                <Text style={styles.sectionTitle}>2. Use of Service</Text>
                <Text style={styles.text}>
                    Rhema Daily provides spiritual content, sermon recording tools, and prayer community features.
                    You agree to use these services only for lawful purposes and in a way that does not infringe
                    the rights of others.
                </Text>

                <Text style={styles.sectionTitle}>3. User Accounts</Text>
                <Text style={styles.text}>
                    To access certain features, you must create an account. You are responsible for maintaining
                    the confidentiality of your account information and for all activities that occur under your account.
                </Text>

                <Text style={styles.sectionTitle}>4. Subscriptions and Payments</Text>
                <Text style={styles.text}>
                    Certain features require a Rhema Daily Pro subscription. Subscriptions are billed on a
                    recurring basis. You can cancel your subscription at any time through your app store settings.
                </Text>

                <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
                <Text style={styles.text}>
                    All content provided on Rhema Daily, including text, graphics, logos, and audio, is the property
                    of E.E Collective or its content suppliers and is protected by intellectual property laws.
                </Text>

                <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
                <Text style={styles.text}>
                    E.E Collective shall not be liable for any direct, indirect, incidental, or consequential
                    damages resulting from the use or inability to use the service.
                </Text>

                <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
                <Text style={styles.text}>
                    We reserve the right to modify these terms at any time. We will notify users of any
                    significant changes by posting the new terms on the app.
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>BUILT BY E.E COLLECTIVE</Text>
                </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#111111',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    content: {
        padding: 24,
    },
    lastUpdated: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: 24,
        marginBottom: 12,
    },
    text: {
        fontSize: 15,
        lineHeight: 24,
        color: '#999999',
        marginBottom: 16,
    },
    footer: {
        marginTop: 40,
        paddingBottom: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#333333',
        fontWeight: '600',
        letterSpacing: 1,
    },
});

export default TermsOfServiceScreen;
