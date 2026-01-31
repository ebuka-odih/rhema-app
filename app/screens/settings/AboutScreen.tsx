import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { IconArrowLeft, IconChevronRight, IconStar, IconShield, IconLock } from '../../components/Icons';

const AboutScreen: React.FC<{
    onBack: () => void;
    onToS?: () => void;
    onPrivacy?: () => void;
}> = ({ onBack, onToS, onPrivacy }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <IconArrowLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About Rhema Daily</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>RD</Text>
                    </View>
                    <Text style={styles.appName}>Rhema Daily</Text>
                    <Text style={styles.versionText}>Version 1.0.0 (Build 12)</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionText}>
                        Rhema Daily is your spiritual companion designed to bring you closer to God through His Word.
                        We provide daily inspirations, sermons, and spiritual tools to help you grow in your faith
                        and maintain a consistent walk with Christ.
                    </Text>
                </View>

                <View style={styles.card}>
                    <TouchableOpacity style={styles.cardItem} onPress={() => { }}>
                        <View style={styles.cardItemLeft}>
                            <View style={styles.iconContainer}>
                                <IconStar size={20} color="#FFFFFF" />
                            </View>
                            <Text style={styles.cardItemLabel}>Rate Us</Text>
                        </View>
                        <IconChevronRight size={20} color="#666666" />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.cardItem} onPress={onToS}>
                        <View style={styles.cardItemLeft}>
                            <View style={styles.iconContainer}>
                                <IconShield size={20} color="#FFFFFF" />
                            </View>
                            <Text style={styles.cardItemLabel}>Terms of Service</Text>
                        </View>
                        <IconChevronRight size={20} color="#666666" />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.cardItem} onPress={onPrivacy}>
                        <View style={styles.cardItemLeft}>
                            <View style={styles.iconContainer}>
                                <IconLock size={20} color="#FFFFFF" />
                            </View>
                            <Text style={styles.cardItemLabel}>Privacy Policy</Text>
                        </View>
                        <IconChevronRight size={20} color="#666666" />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerTitle}>Our Mission</Text>
                    <Text style={styles.footerText}>
                        "Go into all the world and preach the gospel to all creation." - Mark 16:15
                    </Text>
                    <Text style={styles.productOfText}>
                        BUILT BY E.E COLLECTIVE
                    </Text>
                    <Text style={styles.copyrightText}>
                        2026 RHEMA DAILY ALL RIGHT RESERVED
                    </Text>
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
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 24,
        backgroundColor: '#111111',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 16,
    },
    logoText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#E8503A',
    },
    appName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    versionText: {
        fontSize: 14,
        color: '#666666',
    },
    section: {
        marginBottom: 32,
    },
    sectionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#999999',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#111111',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 40,
    },
    cardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    cardItemLeft: {
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
    cardItemLabel: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        marginLeft: 68,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    footerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    footerText: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    productOfText: {
        fontSize: 14,
        color: '#999999',
        fontWeight: '600',
        marginBottom: 8,
    },
    copyrightText: {
        fontSize: 12,
        color: '#333333',
    },
});

export default AboutScreen;
