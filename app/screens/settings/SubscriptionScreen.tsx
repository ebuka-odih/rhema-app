import React from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconArrowLeft, IconCheck, IconStar } from '../../components/Icons';
import { useSubscription } from '../../context/SubscriptionContext';
import { REVENUECAT_PACKAGE_IDS, type RevenueCatPackageId } from '../../services/revenuecat';

const PLAN_ORDER: RevenueCatPackageId[] = [
    REVENUECAT_PACKAGE_IDS.monthly,
    REVENUECAT_PACKAGE_IDS.yearly,
    REVENUECAT_PACKAGE_IDS.lifetime,
];

const PLAN_LABELS: Record<RevenueCatPackageId, string> = {
    [REVENUECAT_PACKAGE_IDS.monthly]: 'Monthly',
    [REVENUECAT_PACKAGE_IDS.yearly]: 'Yearly',
    [REVENUECAT_PACKAGE_IDS.lifetime]: 'Lifetime',
};

const SubscriptionScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const {
        entitlementId,
        isPro,
        isRevenueCatSupported,
        isRevenueCatReady,
        isLoadingCustomerInfo,
        customerInfo,
        offering,
        refreshCustomerInfo,
        refreshOffering,
        purchasePackageById,
        restorePurchases,
        presentPaywall,
        openCustomerCenter,
        isPaywallPurchaseResult,
        isUserCancelled,
        getErrorMessage,
    } = useSubscription();

    const [selectedPackageId, setSelectedPackageId] = React.useState<RevenueCatPackageId | null>(null);
    const [loadingAction, setLoadingAction] = React.useState<'purchase' | 'restore' | 'paywall' | 'customer-center' | null>(null);

    React.useEffect(() => {
        const load = async () => {
            try {
                await Promise.all([refreshCustomerInfo(), refreshOffering()]);
            } catch (err) {
                console.error('Failed to load RevenueCat subscription state', err);
            }
        };
        void load();
    }, [refreshCustomerInfo, refreshOffering]);

    const availablePackages = offering?.availablePackages || [];

    React.useEffect(() => {
        if (!availablePackages.length) {
            setSelectedPackageId(null);
            return;
        }
        const packageIds = availablePackages.map((item: any) => item.identifier);
        const firstPreferred = PLAN_ORDER.find((id) => packageIds.includes(id));
        setSelectedPackageId((firstPreferred || packageIds[0] || null) as RevenueCatPackageId | null);
    }, [offering?.identifier, availablePackages.length]);

    const selectedPackage = availablePackages.find((item: any) => item.identifier === selectedPackageId) || null;
    const hasPurchases = (customerInfo?.allPurchasedProductIdentifiers?.length || 0) > 0;
    const activeProEntitlement = customerInfo?.entitlements?.active?.[entitlementId];

    const purchase = async () => {
        if (!selectedPackageId) {
            Alert.alert('Not Ready', 'No package available right now. Please try again.');
            return;
        }
        if (!isRevenueCatReady) {
            Alert.alert('Not Ready', 'RevenueCat is still initializing. Please try again in a moment.');
            return;
        }

        setLoadingAction('purchase');
        try {
            const info = await purchasePackageById(selectedPackageId);
            const hasEntitlement = Boolean(info?.entitlements?.active?.[entitlementId]);
            if (hasEntitlement) {
                Alert.alert('Success', 'Rhema Daily Pro is now active.');
            } else {
                Alert.alert('Purchase Complete', 'Purchase finished, but the Pro entitlement is not active yet.');
            }
        } catch (err) {
            if (!isUserCancelled(err)) {
                Alert.alert('Purchase Failed', getErrorMessage(err));
            }
        } finally {
            setLoadingAction(null);
        }
    };

    const restore = async () => {
        if (!isRevenueCatReady) {
            Alert.alert('Not Ready', 'RevenueCat is still initializing. Please try again in a moment.');
            return;
        }
        setLoadingAction('restore');
        try {
            const info = await restorePurchases();
            const hasEntitlement = Boolean(info?.entitlements?.active?.[entitlementId]);
            Alert.alert(
                hasEntitlement ? 'Restored' : 'No Active Pro Found',
                hasEntitlement
                    ? 'Rhema Daily Pro entitlement is active.'
                    : 'No active Pro purchases were found for this account.'
            );
        } catch (err) {
            Alert.alert('Restore Failed', getErrorMessage(err));
        } finally {
            setLoadingAction(null);
        }
    };

    const showPaywall = async () => {
        if (!isRevenueCatReady) {
            Alert.alert('Not Ready', 'RevenueCat is still initializing. Please try again in a moment.');
            return;
        }
        setLoadingAction('paywall');
        try {
            const result = await presentPaywall();
            if (isPaywallPurchaseResult(result)) {
                Alert.alert('Success', 'Rhema Daily Pro is now active.');
            }
        } catch (err) {
            if (!isUserCancelled(err)) {
                Alert.alert('Paywall Error', getErrorMessage(err));
            }
        } finally {
            setLoadingAction(null);
        }
    };

    const launchCustomerCenter = async () => {
        if (!isRevenueCatReady) {
            Alert.alert('Not Ready', 'RevenueCat is still initializing. Please try again in a moment.');
            return;
        }
        setLoadingAction('customer-center');
        try {
            await openCustomerCenter();
        } catch (err) {
            Alert.alert('Customer Center Error', getErrorMessage(err));
        } finally {
            setLoadingAction(null);
        }
    };

    if (!isRevenueCatSupported) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.screen}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <IconArrowLeft size={20} color="#FFFFFF" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>
                    <View style={styles.unsupportedWrap}>
                        <Text style={styles.unsupportedTitle}>Subscriptions are only available on iOS and Android.</Text>
                        <Text style={styles.unsupportedSubtitle}>Use a mobile build to access RevenueCat purchases and Customer Center.</Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <IconArrowLeft size={20} color="#FFFFFF" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>

                <View style={styles.hero}>
                    <View style={styles.heroBadge}>
                        <IconStar size={14} color="#F8C948" />
                        <Text style={styles.heroBadgeText}>RHEMA DAILY PRO</Text>
                    </View>
                    <Text style={styles.heroTitle}>Upgrade Your Subscription</Text>
                    <Text style={styles.heroSubtitle}>
                        Access longer recordings, AI insights, and premium Bible study tools.
                    </Text>
                </View>

                <View style={styles.statusCard}>
                    <Text style={styles.statusTitle}>{isPro ? 'Pro Active' : 'Free Plan'}</Text>
                    <Text style={styles.statusSubtitle}>
                        Entitlement: {entitlementId}
                    </Text>
                    {activeProEntitlement ? (
                        <Text style={styles.statusMeta}>
                            Product: {activeProEntitlement.productIdentifier}
                        </Text>
                    ) : (
                        <Text style={styles.statusMeta}>No active entitlement found yet.</Text>
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Plans</Text>
                    {!isRevenueCatReady || isLoadingCustomerInfo ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator color="#F8C948" />
                            <Text style={styles.loadingText}>Loading offerings...</Text>
                        </View>
                    ) : availablePackages.length === 0 ? (
                        <Text style={styles.emptyText}>
                            No packages are available in your current offering. Verify RevenueCat offering setup.
                        </Text>
                    ) : (
                        <View style={styles.planList}>
                            {PLAN_ORDER.map((id) => {
                                const pkg = availablePackages.find((item: any) => item.identifier === id);
                                if (!pkg) return null;
                                const selected = selectedPackageId === id;

                                return (
                                    <TouchableOpacity
                                        key={id}
                                        style={[styles.planCard, selected && styles.planCardSelected]}
                                        onPress={() => setSelectedPackageId(id)}
                                        activeOpacity={0.85}
                                    >
                                        <View>
                                            <Text style={styles.planTitle}>{PLAN_LABELS[id]}</Text>
                                            <Text style={styles.planSubtitle}>{pkg.product.title || pkg.product.identifier}</Text>
                                        </View>
                                        <View style={styles.planRight}>
                                            <Text style={styles.planPrice}>{pkg.product.priceString}</Text>
                                            {selected && (
                                                <View style={styles.selectedPill}>
                                                    <IconCheck size={12} color="#0D0D0D" />
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.primaryButton, (!selectedPackage || loadingAction !== null) && styles.buttonDisabled]}
                        onPress={purchase}
                        disabled={!selectedPackage || loadingAction !== null || !isRevenueCatReady}
                    >
                        {loadingAction === 'purchase' ? (
                            <ActivityIndicator color="#0D0D0D" />
                        ) : (
                            <Text style={styles.primaryButtonText}>
                                Continue with {selectedPackageId ? PLAN_LABELS[selectedPackageId] : 'Plan'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Tools</Text>
                    <TouchableOpacity
                        style={[styles.secondaryButton, (loadingAction !== null || !isRevenueCatReady) && styles.buttonDisabled]}
                        onPress={restore}
                        disabled={loadingAction !== null || !isRevenueCatReady}
                    >
                        {loadingAction === 'restore'
                            ? <ActivityIndicator color="#FFFFFF" />
                            : <Text style={styles.secondaryButtonText}>Restore Purchases</Text>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.secondaryButton, (loadingAction !== null || !isRevenueCatReady) && styles.buttonDisabled]}
                        onPress={showPaywall}
                        disabled={loadingAction !== null || !isRevenueCatReady}
                    >
                        {loadingAction === 'paywall'
                            ? <ActivityIndicator color="#FFFFFF" />
                            : <Text style={styles.secondaryButtonText}>Show RevenueCat Paywall</Text>
                        }
                    </TouchableOpacity>

                    {(hasPurchases || isPro) && (
                        <TouchableOpacity
                            style={[styles.secondaryButton, (loadingAction !== null || !isRevenueCatReady) && styles.buttonDisabled]}
                            onPress={launchCustomerCenter}
                            disabled={loadingAction !== null || !isRevenueCatReady}
                        >
                            {loadingAction === 'customer-center'
                                ? <ActivityIndicator color="#FFFFFF" />
                                : <Text style={styles.secondaryButtonText}>Open Customer Center</Text>
                            }
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0A0A0A',
    },
    screen: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 36,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 8,
        marginBottom: 16,
    },
    backText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    hero: {
        backgroundColor: 'rgba(17, 17, 17, 0.96)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 14,
    },
    heroBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(248, 201, 72, 0.14)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 12,
    },
    heroBadgeText: {
        color: '#F8C948',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 28,
        lineHeight: 32,
        fontWeight: '900',
        marginBottom: 8,
    },
    heroSubtitle: {
        color: '#C5C5C5',
        fontSize: 15,
        lineHeight: 22,
    },
    statusCard: {
        backgroundColor: 'rgba(17, 17, 17, 0.92)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 14,
    },
    statusTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    statusSubtitle: {
        color: '#C7C7C7',
        fontSize: 13,
        marginBottom: 2,
    },
    statusMeta: {
        color: '#AFAFAF',
        fontSize: 13,
    },
    card: {
        backgroundColor: 'rgba(17, 17, 17, 0.92)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: 14,
    },
    cardTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    loadingText: {
        color: '#D1D1D1',
        fontSize: 14,
    },
    emptyText: {
        color: '#C5C5C5',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    planList: {
        gap: 10,
        marginBottom: 14,
    },
    planCard: {
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    planCardSelected: {
        borderColor: '#F8C948',
        backgroundColor: 'rgba(248, 201, 72, 0.1)',
    },
    planTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    planSubtitle: {
        color: '#B8B8B8',
        fontSize: 12,
    },
    planRight: {
        alignItems: 'flex-end',
        gap: 6,
    },
    planPrice: {
        color: '#F8C948',
        fontSize: 15,
        fontWeight: '700',
    },
    selectedPill: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#F8C948',
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButton: {
        height: 52,
        borderRadius: 14,
        backgroundColor: '#F8C948',
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#0D0D0D',
        fontSize: 16,
        fontWeight: '800',
    },
    secondaryButton: {
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.24)',
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    secondaryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    unsupportedWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    unsupportedTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 10,
    },
    unsupportedSubtitle: {
        color: '#BDBDBD',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    buttonDisabled: {
        opacity: 0.65,
    },
});

export default SubscriptionScreen;
