import React from 'react';
import { XCircle, ArrowLeft, MessageCircle, Heart } from 'lucide-react';

export default function SubscriptionCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Cancel Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          {/* Cancel Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Abonnement annulé
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Votre abonnement n'a pas été activé. Aucun montant n'a été débité.
          </p>

          {/* Reasons */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pourquoi ne pas essayer notre plan gratuit ?
            </h3>
            
            <ul className="space-y-2 text-left">
              <li className="flex items-center">
                <Heart className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">3 recommandations par mois</span>
              </li>
              <li className="flex items-center">
                <Heart className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">50 messages de chat</span>
              </li>
              <li className="flex items-center">
                <Heart className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">Analytics de base</span>
              </li>
              <li className="flex items-center">
                <Heart className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">Accès mobile</span>
              </li>
            </ul>
          </div>

          {/* Feedback */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aidez-nous à nous améliorer
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Dites-nous pourquoi vous avez annulé votre abonnement
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                'Trop cher',
                'Fonctionnalités insuffisantes',
                'Interface complexe',
                'Autre solution trouvée'
              ].map((reason, index) => (
                <button
                  key={index}
                  className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continuer avec le plan gratuit
            </button>
            
            <button
              onClick={() => window.location.href = '/subscription'}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Voir les plans
            </button>
          </div>

          {/* Support */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Des questions ? Contactez notre{' '}
              <a href="mailto:support@ai-advisor.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                support client
              </a>
            </p>
          </div>
        </div>

        {/* Special Offer */}
        <div className="mt-6 bg-gradient-to-r from-orange-500 to-pink-600 rounded-lg p-4 text-center text-white">
          <h3 className="font-semibold mb-2">🎁 Offre spéciale de dernière chance</h3>
          <p className="text-sm mb-3">
            Obtenez 50% de réduction sur votre premier mois du plan Pro
          </p>
          <button className="px-6 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
            Profiter de l'offre
          </button>
        </div>
      </div>
    </div>
  );
}