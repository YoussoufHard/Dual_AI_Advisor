import React from 'react';
import { StripeService } from '../../services/stripeService';
import { useNotifications } from '../Notifications/NotificationProvider';
import { Lock, Crown, Zap } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan: 'pro' | 'enterprise';
  currentPlan: string;
  feature: string;
  fallback?: React.ReactNode;
}

export default function SubscriptionGuard({ 
  children, 
  requiredPlan, 
  currentPlan, 
  feature,
  fallback 
}: SubscriptionGuardProps) {
  const { addNotification } = useNotifications();
  const stripeService = StripeService.getInstance();

  const hasAccess = () => {
    if (currentPlan === 'enterprise') return true;
    if (requiredPlan === 'pro' && (currentPlan === 'pro' || currentPlan === 'enterprise')) return true;
    return false;
  };

  const handleUpgradeClick = () => {
    addNotification({
      type: 'info',
      title: 'Upgrade requis',
      message: `Cette fonctionnalité nécessite le plan ${requiredPlan}`,
      action: {
        label: 'Voir les plans',
        onClick: () => {
          // Navigate to pricing page
          window.location.href = '/subscription';
        }
      }
    });
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none opacity-50">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg">
        <div className="text-center p-6 max-w-sm">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            {requiredPlan === 'enterprise' ? (
              <Crown className="w-8 h-8 text-white" />
            ) : (
              <Zap className="w-8 h-8 text-white" />
            )}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Fonctionnalité {requiredPlan === 'enterprise' ? 'Enterprise' : 'Pro'}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {feature} nécessite le plan {requiredPlan === 'enterprise' ? 'Enterprise' : 'Pro'} 
            pour être utilisé.
          </p>
          
          <button
            onClick={handleUpgradeClick}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Upgrader maintenant
          </button>
        </div>
      </div>
    </div>
  );
}