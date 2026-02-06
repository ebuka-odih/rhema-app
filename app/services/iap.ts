import { Platform } from 'react-native';
import * as RNIap from 'react-native-iap';
import { authService } from './auth';

export const IAP_SUBSCRIPTION_ID = process.env.EXPO_PUBLIC_IAP_SUBSCRIPTION_ID || '';

const getSubscriptionsCompat = async (sku: string) => {
    if (!sku) return [];
    try {
        return await (RNIap.getSubscriptions as any)([sku]);
    } catch (err) {
        return await (RNIap.getSubscriptions as any)({ skus: [sku] });
    }
};

const requestSubscriptionCompat = async (sku: string) => {
    if (!sku) throw new Error('Subscription not configured');
    try {
        return await (RNIap.requestSubscription as any)(sku);
    } catch (err) {
        return await (RNIap.requestSubscription as any)({ sku });
    }
};

const finishTransactionCompat = async (purchase: any) => {
    try {
        await (RNIap.finishTransaction as any)({ purchase, isConsumable: false });
    } catch (err) {
        await (RNIap.finishTransaction as any)(purchase, false);
    }
};

export const iapService = {
    async initConnection() {
        await RNIap.initConnection();
        if (Platform.OS === 'ios') {
            await RNIap.clearTransactionIOS();
        }
    },

    async endConnection() {
        await RNIap.endConnection();
    },

    async getSubscription() {
        const subs = await getSubscriptionsCompat(IAP_SUBSCRIPTION_ID);
        return subs?.[0] || null;
    },

    async purchaseSubscription() {
        return await requestSubscriptionCompat(IAP_SUBSCRIPTION_ID);
    },

    async restorePurchases() {
        return await RNIap.getAvailablePurchases();
    },

    addListeners(onPurchase: (purchase: any) => void, onError: (error: any) => void) {
        const purchaseSub = RNIap.purchaseUpdatedListener(async (purchase) => {
            let syncError: any = null;
            try {
                if (Platform.OS === 'ios' && purchase.transactionReceipt) {
                    await authService.syncIosReceipt(purchase.transactionReceipt, IAP_SUBSCRIPTION_ID);
                }
            } catch (err) {
                syncError = err;
            } finally {
                try {
                    await finishTransactionCompat(purchase);
                } catch (finishErr) {
                    syncError = syncError || finishErr;
                }
            }

            await authService.fetchMe();
            onPurchase(purchase);

            if (syncError) {
                onError({
                    code: 'SYNC_FAILED',
                    message: 'Purchase completed but verification failed.',
                    originalError: syncError,
                });
            }
        });

        const errorSub = RNIap.purchaseErrorListener((error) => {
            onError(error);
        });

        return () => {
            purchaseSub.remove();
            errorSub.remove();
        };
    },
};
