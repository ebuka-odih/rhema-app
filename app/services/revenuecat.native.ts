import { Platform } from 'react-native';
import Purchases, {
    LOG_LEVEL,
    PURCHASES_ERROR_CODE,
    type CustomerInfo,
    type PurchasesOffering,
    type PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

export const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || 'test_McQJwQMxEjIlGLEFOuNVlfyvhYv';
export const REVENUECAT_ENTITLEMENT_PRO = 'Rhema Daily Pro';

export const REVENUECAT_PACKAGE_IDS = {
    monthly: 'monthly',
    yearly: 'yearly',
    lifetime: 'lifetime',
} as const;

export type RevenueCatPlan = keyof typeof REVENUECAT_PACKAGE_IDS;
export type RevenueCatPackageId = (typeof REVENUECAT_PACKAGE_IDS)[RevenueCatPlan];
export type RevenueCatPaywallResult = PAYWALL_RESULT;

export const REVENUECAT_IS_SUPPORTED = Platform.OS === 'ios' || Platform.OS === 'android';

let configured = false;

const ensureConfigured = () => {
    if (!configured) {
        throw new Error('RevenueCat is not configured yet.');
    }
};

export const revenueCatService = {
    async configure(appUserID?: string) {
        if (!REVENUECAT_IS_SUPPORTED) return;
        if (configured) return;
        if (!REVENUECAT_API_KEY) throw new Error('RevenueCat API key is missing.');

        await Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
        Purchases.configure({
            apiKey: REVENUECAT_API_KEY,
            ...(appUserID ? { appUserID } : {}),
        });
        configured = true;
    },

    async identifyUser(appUserID?: string) {
        ensureConfigured();

        if (!appUserID) {
            return await Purchases.logOut();
        }

        const result = await Purchases.logIn(appUserID);
        return result.customerInfo;
    },

    async getCustomerInfo() {
        ensureConfigured();
        return await Purchases.getCustomerInfo();
    },

    addCustomerInfoListener(listener: (customerInfo: CustomerInfo) => void) {
        ensureConfigured();
        Purchases.addCustomerInfoUpdateListener(listener);
        return () => Purchases.removeCustomerInfoUpdateListener(listener);
    },

    hasEntitlement(customerInfo: CustomerInfo | null | undefined, entitlementId: string = REVENUECAT_ENTITLEMENT_PRO) {
        if (!customerInfo) return false;
        return Boolean(customerInfo.entitlements.active[entitlementId]);
    },

    async getCurrentOffering(): Promise<PurchasesOffering | null> {
        ensureConfigured();
        const offerings = await Purchases.getOfferings();
        return offerings.current;
    },

    getPackageById(offering: PurchasesOffering | null, packageId: RevenueCatPackageId): PurchasesPackage | null {
        if (!offering) return null;
        return offering.availablePackages.find((item) => item.identifier === packageId) || null;
    },

    async purchasePackageById(packageId: RevenueCatPackageId) {
        ensureConfigured();
        const offering = await this.getCurrentOffering();
        const targetPackage = this.getPackageById(offering, packageId);

        if (!targetPackage) {
            throw new Error(`RevenueCat package "${packageId}" not found in current offering.`);
        }

        const result = await Purchases.purchasePackage(targetPackage);
        return result.customerInfo;
    },

    async restorePurchases() {
        ensureConfigured();
        return await Purchases.restorePurchases();
    },

    async presentPaywallIfNeeded(entitlementId: string = REVENUECAT_ENTITLEMENT_PRO) {
        ensureConfigured();
        return await RevenueCatUI.presentPaywallIfNeeded({
            requiredEntitlementIdentifier: entitlementId,
        });
    },

    async presentPaywall() {
        ensureConfigured();
        return await RevenueCatUI.presentPaywall();
    },

    async openCustomerCenter() {
        ensureConfigured();
        await RevenueCatUI.presentCustomerCenter({
            callbacks: {
                onRestoreCompleted: ({ customerInfo }) => {
                    console.log('RevenueCat Customer Center restore completed', customerInfo.entitlements.active);
                },
                onRestoreFailed: ({ error }) => {
                    console.warn('RevenueCat Customer Center restore failed', error);
                },
            },
        });
    },

    isPaywallPurchaseResult(result: RevenueCatPaywallResult | null | undefined) {
        return result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
    },

    isUserCancelled(error: any) {
        return (
            error?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
            || error?.userCancelled === true
        );
    },

    getErrorMessage(error: any) {
        if (error?.message) return String(error.message);
        return 'Something went wrong. Please try again.';
    },
};

