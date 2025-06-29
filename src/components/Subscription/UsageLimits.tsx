import React, { useState, useEffect } from 'react';
import { StripeService } from '../../services/stripeService';
import { useSupabaseAuth } from '../../services/supabaseClient';
import { MessageCircle, Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface UsageData {
  recommendations: {
    used: number;
    limit: number;
  };
  chatMessages: {
    used: number;
    limit: number;
  };
  plan: string;
}

export default function UsageLimits() {
  const { user } = useSupabaseAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const stripeService = StripeService.getInstance();

  useEffect(() => {
    if (user) {
      loadUsageData();
    }
  }, [user]);

  const loadUsageData = async () => {
    try {
      // Simulate API call to get usage data
      // In real implementation, this would come from your backend
      const mockUsage: UsageData = {
        recommendations: {
          used: Math.floor(Math.random() * 5) + 1,
          limit: 3
        },
        chatMessages: {
          used: Math.floor(Math.random() * 30) + 10,
          limit: 50
        },
        plan: 'free'
      };

      setUsage(mockUsage);
    } catch (error) {
      console.error('Failed to load usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const isNearLimit = (used: number, limit: number) => {
    if (limit === -1) return false;
    return (used / limit) >= 0.8;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const plan = stripeService.getPlanById(usage.plan);
  const recPercentage = getUsagePercentage(usage.recommendations.used, usage.recommendations.limit);
  const chatPercentage = getUsagePercentage(usage.chatMessages.used, usage.chatMessages.limit);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Utilisation - Plan {plan?.name}
        </h3>
        {(isNearLimit(usage.recommendations.used, usage.recommendations.limit) || 
          isNearLimit(usage.chatMessages.used, usage.chatMessages.limit)) && (
          <div className="flex items-center text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span className="text-sm">Limite proche</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Recommendations Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-blue-500 mr-2" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Recommandations
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {usage.recommendations.used} / {usage.recommendations.limit === -1 ? '∞' : usage.recommendations.limit}
            </span>
          </div>
          
          {usage.recommendations.limit !== -1 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(recPercentage)}`}
                style={{ width: `${recPercentage}%` }}
              />
            </div>
          )}
          
          {usage.recommendations.limit === -1 && (
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
              Illimité ✨
            </div>
          )}
        </div>

        {/* Chat Messages Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <MessageCircle className="w-5 h-5 text-purple-500 mr-2" />
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Messages de chat
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {usage.chatMessages.used} / {usage.chatMessages.limit === -1 ? '∞' : usage.chatMessages.limit}
            </span>
          </div>
          
          {usage.chatMessages.limit !== -1 && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(chatPercentage)}`}
                style={{ width: `${chatPercentage}%` }}
              />
            </div>
          )}
          
          {usage.chatMessages.limit === -1 && (
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
              Illimité ✨
            </div>
          )}
        </div>

        {/* Upgrade CTA */}
        {usage.plan === 'free' && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-800 dark:text-blue-400">
                  Débloquez plus de fonctionnalités
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Passez au plan Pro pour un accès illimité
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/subscription'}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Upgrader
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}