import React, { useState, useEffect } from 'react';
import { StripeService, SUBSCRIPTION_PLANS, SubscriptionPlan } from '../../services/stripeService';
import { useSupabaseAuth } from '../../services/supabaseClient';
import { useNotifications } from '../Notifications/NotificationProvider';
import { Check, Star, Zap, Crown, Loader, CreditCard } from 'lucide-react';

interface PricingPlansProps {
  currentPlan?: string;
  onPlanSelect?: (plan: SubscriptionPlan) => void;
}

export default function PricingPlans({ currentPlan = 'free', onPlanSelect }: PricingPlansProps) {
  const { user } = useSupabaseAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const stripeService = StripeService.getInstance();

  useEffect(() => {
    if (user) {
      loadSubscriptionStatus();
    }
  }, [user]);

  const loadSubscriptionStatus = async () => {
    try {
      const status = await stripeService.getSubscriptionStatus(user.id);
      setSubscriptionStatus(status);
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  };

  const handlePlanSelect = async (plan: SubscriptionPlan) => {
    if (!user) {
      addNotification({
        type: 'warning',
        title: 'Connexion requise',
        message: 'Veuillez vous connecter pour souscrire à un plan'
      });
      return;
    }

    if (plan.id === 'free') {
      addNotification({
        type: 'info',
        title: 'Plan gratuit',
        message: 'Vous utilisez déjà le plan gratuit'
      });
      return;
    }

    setLoading(plan.id);

    try {
      await stripeService.initialize();
      await stripeService.createCheckoutSession(
        plan.stripePriceId,
        user.id,
        `${window.location.origin}/subscription/success?plan=${plan.id}`,
        `${window.location.origin}/subscription/cancel`
      );
    } catch (error) {
      console.error('Error selecting plan:', error);
      addNotification({
        type: 'error',
        title: 'Erreur de paiement',
        message: 'Impossible de traiter votre demande. Veuillez réessayer.'
      });
    } finally {
      setLoading(null);
    }

    onPlanSelect?.(plan);
  };

  const handleManageSubscription = async () => {
    if (!subscriptionStatus?.customerId) return;

    try {
      await stripeService.createPortalSession(subscriptionStatus.customerId);
    } catch (error) {
      console.error('Error opening customer portal:', error);
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible d\'ouvrir le portail de gestion'
      });
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return <Zap className="w-6 h-6" />;
      case 'pro': return <Star className="w-6 h-6" />;
      case 'enterprise': return <Crown className="w-6 h-6" />;
      default: return <Zap className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free': return 'from-gray-500 to-gray-600';
      case 'pro': return 'from-blue-500 to-purple-600';
      case 'enterprise': return 'from-purple-600 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscriptionStatus?.plan === planId || (planId === 'free' && !subscriptionStatus?.plan);
  };

  return (
    <div className="py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Choisissez votre plan
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Débloquez tout le potentiel de l'IA pour votre carrière et vos projets startup
        </p>
      </div>

      {/* Current Subscription Status */}
      {subscriptionStatus && subscriptionStatus.plan !== 'free' && (
        <div className="max-w-4xl mx-auto mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-800 dark:text-blue-400">
                Plan actuel : {subscriptionStatus.plan}
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                {subscriptionStatus.status === 'active' ? 'Actif' : 'Inactif'} • 
                Prochaine facturation : {subscriptionStatus.nextBilling ? 
                  new Date(subscriptionStatus.nextBilling).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <button
              onClick={handleManageSubscription}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Gérer l'abonnement
            </button>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
              plan.popular 
                ? 'border-blue-500 dark:border-blue-400 scale-105' 
                : 'border-gray-200 dark:border-gray-700'
            } ${
              isCurrentPlan(plan.id) 
                ? 'ring-2 ring-green-500 dark:ring-green-400' 
                : ''
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Le plus populaire
                </span>
              </div>
            )}

            {/* Current Plan Badge */}
            {isCurrentPlan(plan.id) && (
              <div className="absolute -top-4 right-4">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Plan actuel
                </span>
              </div>
            )}

            <div className="p-8">
              {/* Plan Header */}
              <div className="text-center mb-6">
                <div className={`mx-auto w-16 h-16 bg-gradient-to-r ${getPlanColor(plan.id)} rounded-full flex items-center justify-center mb-4`}>
                  <div className="text-white">
                    {getPlanIcon(plan.id)}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {plan.description}
                </p>
              </div>

              {/* Pricing */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      /{plan.interval === 'month' ? 'mois' : 'an'}
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handlePlanSelect(plan)}
                disabled={loading === plan.id || isCurrentPlan(plan.id)}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                  isCurrentPlan(plan.id)
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {loading === plan.id ? (
                  <div className="flex items-center justify-center">
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Redirection...
                  </div>
                ) : isCurrentPlan(plan.id) ? (
                  'Plan actuel'
                ) : plan.price === 0 ? (
                  'Commencer gratuitement'
                ) : (
                  `Passer au plan ${plan.name}`
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mt-16">
        <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Questions fréquentes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Puis-je changer de plan à tout moment ?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. 
              Les changements prennent effet immédiatement.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Y a-t-il une période d'essai ?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Le plan gratuit vous permet de tester nos fonctionnalités de base. 
              Aucune carte de crédit requise.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Comment annuler mon abonnement ?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Vous pouvez annuler à tout moment via le portail de gestion. 
              Votre accès reste actif jusqu'à la fin de la période payée.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Les données sont-elles sécurisées ?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Oui, toutes vos données sont chiffrées et stockées de manière sécurisée. 
              Nous respectons le RGPD et vos données vous appartiennent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}