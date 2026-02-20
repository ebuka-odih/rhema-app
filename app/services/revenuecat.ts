export const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || 'test_McQJwQMxEjIlGLEFOuNVlfyvhYv';
export const REVENUECAT_ENTITLEMENT_PRO = 'Rhema Daily Pro';

export const REVENUECAT_PACKAGE_IDS = {
    monthly: 'monthly',
    yearly: 'yearly',
    lifetime: 'lifetime',
} as const;

export type RevenueCatPlan = keyof typeof REVENUECAT_PACKAGE_IDS;
export type RevenueCatPackageId = (typeof REVENUECAT_PACKAGE_IDS)[RevenueCatPlan];
export type RevenueCatPaywallResult = string;

export const REVENUECAT_IS_SUPPORTED = false;

const notSupported = () => {
    throw new Error('RevenueCat is only supported on iOS and Android.');
};

export const revenueCatService = {
    async configure(_appUserID?: string) { },
    async identifyUser(_appUserID?: string) {
        return null;
    },
    async getCustomerInfo() {
        return null;
    },
    addCustomerInfoListener(_listener: (customerInfo: any) => void) {
        return () => { };
    },
    hasEntitlement(_customerInfo: any, _entitlementId: string = REVENUECAT_ENTITLEMENT_PRO) {
        return false;
    },
    async getCurrentOffering() {
        return null;
    },
    getPackageById(_offering: any, _packageId: RevenueCatPackageId) {
        return null;
    },
    async purchasePackageById(_packageId: RevenueCatPackageId): Promise<any> {
        notSupported();
    },
    async restorePurchases(): Promise<any> {
        notSupported();
    },
    async presentPaywallIfNeeded(_entitlementId: string = REVENUECAT_ENTITLEMENT_PRO): Promise<RevenueCatPaywallResult> {
        return Promise.reject(new Error('RevenueCat is only supported on iOS and Android.'));
    },
    async presentPaywall(): Promise<RevenueCatPaywallResult> {
        return Promise.reject(new Error('RevenueCat is only supported on iOS and Android.'));
    },
    async openCustomerCenter() {
        notSupported();
    },
    isPaywallPurchaseResult(_result: RevenueCatPaywallResult | null | undefined) {
        return false;
    },
    isUserCancelled(_error: any) {
        return false;
    },
    getErrorMessage(error: any) {
        if (error?.message) return String(error.message);
        return 'Something went wrong. Please try again.';
    },
};
