import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconCheck, IconChevronRight, IconClose, IconStar } from '../Icons';

interface PaywallTemplateProps {
    onClose: () => void;
    title: string;
    subtitle: string;
    countdownText?: string;
    benefits: string[];
    offerTitle: string;
    offerSubtext: string;
    offerPrice?: string;
    primaryLabel: string;
    onPrimary: () => void;
    primaryLoading?: boolean;
    secondaryLabel?: string;
    onSecondary?: () => void;
    secondaryLoading?: boolean;
    footerText: string;
}

const BenefitItem: React.FC<{ text: string }> = ({ text }) => (
    <View style={styles.benefitRow}>
        <View style={styles.checkBubble}>
            <IconCheck size={14} color="#0D0D0D" />
        </View>
        <Text style={styles.benefitText}>{text}</Text>
    </View>
);

export const PaywallTemplate: React.FC<PaywallTemplateProps> = ({
    onClose,
    title,
    subtitle,
    countdownText,
    benefits,
    offerTitle,
    offerSubtext,
    offerPrice,
    primaryLabel,
    onPrimary,
    primaryLoading = false,
    secondaryLabel,
    onSecondary,
    secondaryLoading = false,
    footerText,
}) => (
    <View style={styles.container}>
        <View style={styles.backgroundGlowTop} />
        <View style={styles.backgroundGlowBottom} />

        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <IconClose size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.heroCard}>
                <View style={styles.badge}>
                    <IconStar size={14} color="#F8C948" />
                    <Text style={styles.badgeText}>PRO UNLOCK</Text>
                </View>

                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
                {!!countdownText && <Text style={styles.countdownText}>{countdownText}</Text>}
            </View>

            <View style={styles.benefitsCard}>
                {benefits.map((benefit) => (
                    <BenefitItem key={benefit} text={benefit} />
                ))}
            </View>

            <View style={styles.offerCard}>
                <Text style={styles.offerTitle}>{offerTitle}</Text>
                {!!offerPrice && <Text style={styles.offerPrice}>{offerPrice}</Text>}
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.offerSubtext}>{offerSubtext}</Text>
            </View>

            <TouchableOpacity
                style={[styles.primaryCta, primaryLoading && styles.buttonDisabled]}
                onPress={onPrimary}
                activeOpacity={0.9}
                disabled={primaryLoading}
            >
                {primaryLoading ? (
                    <ActivityIndicator color="#0D0D0D" />
                ) : (
                    <>
                        <Text style={styles.primaryCtaText}>{primaryLabel}</Text>
                        <IconChevronRight size={20} color="#0D0D0D" />
                    </>
                )}
            </TouchableOpacity>

            {!!secondaryLabel && !!onSecondary && (
                <TouchableOpacity
                    style={[styles.secondaryCta, secondaryLoading && styles.buttonDisabled]}
                    onPress={onSecondary}
                    disabled={secondaryLoading}
                >
                    {secondaryLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.secondaryCtaText}>{secondaryLabel}</Text>
                    )}
                </TouchableOpacity>
            )}

            <Text style={styles.footerText}>{footerText}</Text>
        </ScrollView>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 28,
    },
    backgroundGlowTop: {
        position: 'absolute',
        top: -120,
        left: -40,
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: 'rgba(232, 80, 58, 0.22)',
    },
    backgroundGlowBottom: {
        position: 'absolute',
        right: -80,
        bottom: -120,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(248, 201, 72, 0.14)',
    },
    header: {
        alignItems: 'flex-start',
        marginTop: 8,
        marginBottom: 10,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroCard: {
        backgroundColor: 'rgba(17, 17, 17, 0.92)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 14,
    },
    badge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(248, 201, 72, 0.14)',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 12,
    },
    badgeText: {
        color: '#F8C948',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 30,
        lineHeight: 34,
        fontWeight: '900',
        letterSpacing: -0.7,
        marginBottom: 10,
    },
    subtitle: {
        color: '#C5C5C5',
        fontSize: 15,
        lineHeight: 22,
    },
    countdownText: {
        color: '#F8C948',
        fontSize: 13,
        fontWeight: '700',
        marginTop: 10,
    },
    benefitsCard: {
        backgroundColor: 'rgba(17, 17, 17, 0.92)',
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 14,
        gap: 11,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    checkBubble: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#F8C948',
        justifyContent: 'center',
        alignItems: 'center',
    },
    benefitText: {
        color: '#F5F5F5',
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
    },
    offerCard: {
        backgroundColor: 'rgba(17, 17, 17, 0.95)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F8C948',
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 14,
    },
    offerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 2,
    },
    offerPrice: {
        color: '#F8C948',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    offerSubtext: {
        color: '#D1D1D1',
        fontSize: 14,
        lineHeight: 20,
    },
    primaryCta: {
        height: 58,
        borderRadius: 16,
        backgroundColor: '#F8C948',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    primaryCtaText: {
        color: '#0D0D0D',
        fontSize: 18,
        fontWeight: '800',
    },
    secondaryCta: {
        height: 52,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryCtaText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    buttonDisabled: {
        opacity: 0.65,
    },
    footerText: {
        marginTop: 14,
        color: '#8E8E8E',
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 18,
        paddingHorizontal: 20,
    },
});
