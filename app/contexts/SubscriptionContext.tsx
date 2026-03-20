import React, { createContext, useContext, useState, useEffect } from 'react';
import subscriptionService from '../services/subscription';

interface Subscription {
    id?: string;
    planId: string;
    status: string;
    currentPeriodEnd?: Date;
    amount: number;
    currency: string;
    planDetails?: {
        name: string;
        features: string[];
    };
}

interface SubscriptionContextType {
    subscription: Subscription | null;
    loading: boolean;
    refreshSubscription: () => Promise<void>;
    updatePlan: (planId: string, paymentMethod?: string) => Promise<any>;
    cancelSubscription: () => Promise<any>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshSubscription = async () => {
        try {
            setLoading(true);
            const data = await subscriptionService.getCurrentSubscription();
            setSubscription(data.subscription);
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const updatePlan = async (planId: string, paymentMethod: string = 'card') => {
        try {
            const response = await subscriptionService.updateSubscription(planId, paymentMethod);
            await refreshSubscription();
            return response;
        } catch (error) {
            throw error;
        }
    };

    const cancelSubscription = async () => {
        try {
            const response = await subscriptionService.cancelSubscription();
            await refreshSubscription();
            return response;
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        refreshSubscription();
    }, []);

    return (
        <SubscriptionContext.Provider value={{
            subscription,
            loading,
            refreshSubscription,
            updatePlan,
            cancelSubscription
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};