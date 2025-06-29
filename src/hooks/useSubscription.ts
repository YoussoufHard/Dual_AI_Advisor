import { useState, useEffect } from 'react';
import { StripeService, SubscriptionPlan } from '../services/stripeService';
import { useSupabaseAuth } from '../services/supabaseClient';

interface SubscriptionStatus {
  plan: string;
  status: 'active' | 'inactive' | 'canceled' | 'past_due';
  customerId?: string;
  subscriptionId?: string;
  nextBilling?: string;
  cancelAtPeriodEnd?: boolean;
}

interface UsageLimits {
  recommendations: {
    used: number;
    limit: number;
  };
  chatMessages: {
    used: number;
    limit: number;
  };
}

export function useSubscription() {
  const { user } = useSupabaseAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [usage, setUsage] = useState<UsageLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const stripeService = StripeService.getInstance();

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      const [subscriptionData, usageData] = await Promise.all([
        stripeService.getSubscriptionStatus(user.id),
        loadUsageData()
      ]);

      setSubscription(subscriptionData);
      setUsage(usageData);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      // Set default free plan
      setSubscription({
        plan: 'free',
        status: 'active'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsageData = async (): Promise<UsageLimits> => {
    // In real implementation, this would come from your backend
    // For now, simulate usage data
    return {
      recommendations: {
        used: Math.floor(Math.random() * 5) + 1,
        limit: 3
      },
      chatMessages: {
        used: Math.floor(Math.random() * 30) + 10,
        limit: 50
      }
    };
  };

  const canUseFeature = (feature: keyof SubscriptionPlan): boolean => {
    if (!subscription) return false;
    return stripeService.canAccessFeature(subscription.plan, feature);
  };

  const hasReachedLimit = (limitType: 'recommendations' | 'chatMessages'): boolean => {
    if (!subscription || !usage) return false;
    
    const currentUsage = usage[limitType].used;
    return stripeService.hasReachedLimit(subscription.plan, currentUsage, limitType);
  };

  const getRemainingUsage = (limitType: 'recommendations' | 'chatMessages'): number => {
    if (!usage) return 0;
    
    const { used, limit } = usage[limitType];
    if (limit === -1) return Infinity; // Unlimited
    
    return Math.max(0, limit - used);
  };

  const getCurrentPlan = (): SubscriptionPlan | undefined => {
    if (!subscription) return undefined;
    return stripeService.getPlanById(subscription.plan);
  };

  const upgradeToProPlan = async () => {
    if (!user) throw new Error('User not authenticated');
    
    const proPlan = stripeService.getPlanById('pro');
    if (!proPlan) throw new Error('Pro plan not found');

    await stripeService.initialize();
    await stripeService.createCheckoutSession(
      proPlan.stripePriceId,
      user.id
    );
  };

  const upgradeToEnterprisePlan = async () => {
    if (!user) throw new Error('User not authenticated');
    
    const enterprisePlan = stripeService.getPlanById('enterprise');
    if (!enterprisePlan) throw new Error('Enterprise plan not found');

    await stripeService.initialize();
    await stripeService.createCheckoutSession(
      enterprisePlan.stripePriceId,
      user.id
    );
  };

  const openCustomerPortal = async () => {
    if (!subscription?.customerId) {
      throw new Error('No customer ID found');
    }

    await stripeService.createPortalSession(subscription.customerId);
  };

  const refreshSubscription = () => {
    if (user) {
      loadSubscriptionData();
    }
  };

  return {
    subscription,
    usage,
    loading,
    canUseFeature,
    hasReachedLimit,
    getRemainingUsage,
    getCurrentPlan,
    upgradeToProPlan,
    upgradeToEnterprisePlan,
    openCustomerPortal,
    refreshSubscription
  };
}