import { loadStripe, Stripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  console.warn('Stripe publishable key not found. Payment features will be disabled.');
}

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise && STRIPE_PUBLISHABLE_KEY) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  popular?: boolean;
  maxRecommendations: number;
  maxChatMessages: number;
  advancedAnalytics: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    description: 'Parfait pour commencer votre parcours professionnel',
    price: 0,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: '',
    features: [
      '3 recommandations par mois',
      '50 messages de chat',
      'Analytics de base',
      'Support communautaire',
      'Accès mobile'
    ],
    maxRecommendations: 3,
    maxChatMessages: 50,
    advancedAnalytics: false,
    prioritySupport: false,
    customBranding: false
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Pour les professionnels ambitieux',
    price: 19.99,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: 'price_pro_monthly', // À remplacer par votre vrai Price ID
    popular: true,
    features: [
      'Recommandations illimitées',
      'Chat illimité avec IA',
      'Analytics avancés',
      'Export de données',
      'Support prioritaire',
      'Insights ML personnalisés',
      'Géolocalisation avancée'
    ],
    maxRecommendations: -1, // Illimité
    maxChatMessages: -1, // Illimité
    advancedAnalytics: true,
    prioritySupport: true,
    customBranding: false
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Pour les équipes et organisations',
    price: 99.99,
    currency: 'EUR',
    interval: 'month',
    stripePriceId: 'price_enterprise_monthly', // À remplacer par votre vrai Price ID
    features: [
      'Tout du plan Pro',
      'Gestion d\'équipe',
      'Analytics d\'équipe',
      'Branding personnalisé',
      'API access',
      'Support dédié',
      'Formation personnalisée',
      'Intégrations sur mesure'
    ],
    maxRecommendations: -1,
    maxChatMessages: -1,
    advancedAnalytics: true,
    prioritySupport: true,
    customBranding: true
  }
];

export class StripeService {
  private static instance: StripeService;
  private stripe: Stripe | null = null;

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  async initialize() {
    if (!this.stripe && STRIPE_PUBLISHABLE_KEY) {
      this.stripe = await getStripe();
    }
  }

  async createCheckoutSession(priceId: string, userId: string, successUrl?: string, cancelUrl?: string) {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId,
          successUrl: successUrl || `${window.location.origin}/subscription/success`,
          cancelUrl: cancelUrl || `${window.location.origin}/subscription/cancel`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error } = await this.stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async createPortalSession(customerId: string) {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: window.location.origin
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(userId: string) {
    try {
      const response = await fetch(`/api/stripe/subscription-status/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get subscription status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return { status: 'inactive', plan: 'free' };
    }
  }

  getPlanById(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  }

  getPlanByStripePriceId(priceId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.stripePriceId === priceId);
  }

  canAccessFeature(userPlan: string, feature: keyof SubscriptionPlan): boolean {
    const plan = this.getPlanById(userPlan);
    if (!plan) return false;

    switch (feature) {
      case 'advancedAnalytics':
        return plan.advancedAnalytics;
      case 'prioritySupport':
        return plan.prioritySupport;
      case 'customBranding':
        return plan.customBranding;
      default:
        return true;
    }
  }

  hasReachedLimit(userPlan: string, currentUsage: number, limitType: 'recommendations' | 'chatMessages'): boolean {
    const plan = this.getPlanById(userPlan);
    if (!plan) return true;

    const limit = limitType === 'recommendations' ? plan.maxRecommendations : plan.maxChatMessages;
    
    // -1 means unlimited
    if (limit === -1) return false;
    
    return currentUsage >= limit;
  }
}

export default StripeService;