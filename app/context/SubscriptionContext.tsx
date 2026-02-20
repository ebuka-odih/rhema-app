import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from '../services/auth';
import {
    REVENUECAT_ENTITLEMENT_PRO,
    REVENUECAT_IS_SUPPORTED,
    type RevenueCatPackageId,
    type RevenueCatPaywallResult,
    revenueCatService,
} from '../services/revenuecat';

interface SubscriptionContextType {
    isRevenueCatSupported: boolean;
    isRevenueCatReady: boolean;
    isLoadingCustomerInfo: boolean;
    entitlementId: string;
    isPro: boolean;
    customerInfo: any | null;
    offering: any | null;
    refreshCustomerInfo: () => Promise<any | null>;
    refreshOffering: () => Promise<any | null>;
    purchasePackageById: (packageId: RevenueCatPackageId) => Promise<any>;
    restorePurchases: () => Promise<any>;
    presentPaywallIfNeeded: () => Promise<RevenueCatPaywallResult | null>;
    presentPaywall: () => Promise<RevenueCatPaywallResult | null>;
    openCustomerCenter: () => Promise<void>;
    isPaywallPurchaseResult: (result: RevenueCatPaywallResult | null | undefined) => boolean;
    isUserCancelled: (error: any) => boolean;
    getErrorMessage: (error: any) => string;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: session, isPending } = useSession();
    const fallbackIsPro = session?.user?.is_pro || false;
    const appUserID = session?.user?.id ? String(session.user.id) : undefined;

    const [isRevenueCatReady, setIsRevenueCatReady] = useState(!REVENUECAT_IS_SUPPORTED);
    const [isLoadingCustomerInfo, setIsLoadingCustomerInfo] = useState(false);
    const [customerInfo, setCustomerInfo] = useState<any | null>(null);
    const [offering, setOffering] = useState<any | null>(null);

    const applyCustomerInfo = useCallback((info: any | null) => {
        setCustomerInfo(info);
    }, []);

    const refreshCustomerInfo = useCallback(async () => {
        if (!REVENUECAT_IS_SUPPORTED) return null;
        setIsLoadingCustomerInfo(true);
        try {
            const info = await revenueCatService.getCustomerInfo();
            applyCustomerInfo(info);
            return info;
        } finally {
            setIsLoadingCustomerInfo(false);
        }
    }, [applyCustomerInfo]);

    const refreshOffering = useCallback(async () => {
        if (!REVENUECAT_IS_SUPPORTED) return null;
        const currentOffering = await revenueCatService.getCurrentOffering();
        setOffering(currentOffering);
        return currentOffering;
    }, []);

    useEffect(() => {
        let active = true;

        const configure = async () => {
            if (!REVENUECAT_IS_SUPPORTED) return;

            try {
                await revenueCatService.configure();
                if (active) setIsRevenueCatReady(true);
            } catch (err) {
                console.error('RevenueCat configure failed', err);
            }
        };

        configure();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (!REVENUECAT_IS_SUPPORTED || !isRevenueCatReady) return;
        const remove = revenueCatService.addCustomerInfoListener((info) => {
            applyCustomerInfo(info);
        });
        return remove;
    }, [applyCustomerInfo, isRevenueCatReady]);

    useEffect(() => {
        let active = true;
        if (!REVENUECAT_IS_SUPPORTED || !isRevenueCatReady || isPending) return;

        const identify = async () => {
            try {
                const info = await revenueCatService.identifyUser(appUserID);
                if (active) applyCustomerInfo(info);
                await refreshOffering();
                if (!info) await refreshCustomerInfo();
            } catch (err) {
                console.error('RevenueCat identify failed', err);
            }
        };

        identify();

        return () => {
            active = false;
        };
    }, [appUserID, applyCustomerInfo, isPending, isRevenueCatReady, refreshCustomerInfo, refreshOffering]);

    const purchasePackageById = useCallback(async (packageId: RevenueCatPackageId) => {
        const info = await revenueCatService.purchasePackageById(packageId);
        applyCustomerInfo(info);
        return info;
    }, [applyCustomerInfo]);

    const restorePurchases = useCallback(async () => {
        const info = await revenueCatService.restorePurchases();
        applyCustomerInfo(info);
        return info;
    }, [applyCustomerInfo]);

    const presentPaywallIfNeeded = useCallback(async () => {
        if (!REVENUECAT_IS_SUPPORTED) return null;
        const result = await revenueCatService.presentPaywallIfNeeded(REVENUECAT_ENTITLEMENT_PRO);
        await refreshCustomerInfo();
        return result;
    }, [refreshCustomerInfo]);

    const presentPaywall = useCallback(async () => {
        if (!REVENUECAT_IS_SUPPORTED) return null;
        const result = await revenueCatService.presentPaywall();
        await refreshCustomerInfo();
        return result;
    }, [refreshCustomerInfo]);

    const openCustomerCenter = useCallback(async () => {
        if (!REVENUECAT_IS_SUPPORTED) return;
        await revenueCatService.openCustomerCenter();
        await refreshCustomerInfo();
    }, [refreshCustomerInfo]);

    const isPro = useMemo(() => {
        if (!REVENUECAT_IS_SUPPORTED) return fallbackIsPro;
        return revenueCatService.hasEntitlement(customerInfo, REVENUECAT_ENTITLEMENT_PRO) || fallbackIsPro;
    }, [customerInfo, fallbackIsPro]);

    const value = useMemo<SubscriptionContextType>(() => ({
        isRevenueCatSupported: REVENUECAT_IS_SUPPORTED,
        isRevenueCatReady,
        isLoadingCustomerInfo,
        entitlementId: REVENUECAT_ENTITLEMENT_PRO,
        isPro,
        customerInfo,
        offering,
        refreshCustomerInfo,
        refreshOffering,
        purchasePackageById,
        restorePurchases,
        presentPaywallIfNeeded,
        presentPaywall,
        openCustomerCenter,
        isPaywallPurchaseResult: revenueCatService.isPaywallPurchaseResult,
        isUserCancelled: revenueCatService.isUserCancelled,
        getErrorMessage: revenueCatService.getErrorMessage,
    }), [
        isRevenueCatReady,
        isLoadingCustomerInfo,
        isPro,
        customerInfo,
        offering,
        refreshCustomerInfo,
        refreshOffering,
        purchasePackageById,
        restorePurchases,
        presentPaywallIfNeeded,
        presentPaywall,
        openCustomerCenter,
    ]);

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) throw new Error('useSubscription must be used within SubscriptionProvider');
    return context;
};

