import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Gift, Zap } from 'lucide-react';

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const [plan, setPlan] = useState<string>('');

  useEffect(() => {
    const planParam = searchParams.get('plan');
    if (planParam) {
      setPlan(planParam);
    }
  }, [searchParams]);

  const getPlanFeatures = (planId: string) => {
    switch (planId) {
      case 'pro':
        return [
          'Recommandations illimitées',
          'Chat illimité avec IA',
          'Analytics avancés',
          'Export de données',
          'Support prioritaire'
        ];
      case 'enterprise':
        return [
          'Tout du plan Pro',
          'Gestion d\'équipe',
          'Branding personnalisé',
          'API access',
          'Support dédié'
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Félicitations ! 🎉
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Votre abonnement au plan <span className="font-semibold text-blue-600 dark:text-blue-400 capitalize">{plan}</span> a été activé avec succès.
          </p>

          {/* Features Unlocked */}
          {plan && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Fonctionnalités débloquées
                </h3>
              </div>
              
              <ul className="space-y-2">
                {getPlanFeatures(plan).map((feature, index) => (
                  <li key={index} className="flex items-center justify-center">
                    <Zap className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Prochaines étapes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  1. Explorez vos nouvelles fonctionnalités
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Découvrez toutes les possibilités de votre nouveau plan
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  2. Générez vos premières recommandations
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Profitez de l'accès illimité aux conseils IA
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Commencer maintenant
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            
            <button
              onClick={() => window.location.href = '/subscription'}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Gérer l'abonnement
            </button>
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Besoin d'aide ? Contactez notre{' '}
              <a href="mailto:support@ai-advisor.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                support client
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Un email de confirmation a été envoyé à votre adresse email.
          </p>
        </div>
      </div>
    </div>
  );
}