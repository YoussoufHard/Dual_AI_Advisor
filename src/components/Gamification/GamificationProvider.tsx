import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from '../Notifications/NotificationProvider';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  reward: {
    points: number;
    badge?: string;
  };
}

export interface UserGamification {
  totalPoints: number;
  level: number;
  badges: Badge[];
  achievements: Achievement[];
  streaks: {
    daily: number;
    weekly: number;
    monthly: number;
    lastLogin: Date | null;
  };
  leaderboard: {
    position: number;
    category: string;
  };
}

interface GamificationContextType {
  userStats: UserGamification;
  addPoints: (points: number, reason: string) => void;
  unlockBadge: (badgeId: string) => void;
  updateStreak: () => void;
  checkAchievements: () => void;
}

const defaultStats: UserGamification = {
  totalPoints: 0,
  level: 1,
  badges: [],
  achievements: [],
  streaks: {
    daily: 0,
    weekly: 0,
    monthly: 0,
    lastLogin: null
  },
  leaderboard: {
    position: 0,
    category: 'general'
  }
};

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

// Predefined badges
const availableBadges: Badge[] = [
  {
    id: 'explorer',
    name: 'Explorateur',
    description: 'Première connexion à la plateforme',
    icon: '🌟',
    rarity: 'common'
  },
  {
    id: 'strategist',
    name: 'Stratège',
    description: 'Générer 5 recommandations',
    icon: '🎯',
    rarity: 'common'
  },
  {
    id: 'communicator',
    name: 'Communicateur',
    description: 'Envoyer 50 messages de chat',
    icon: '💬',
    rarity: 'rare'
  },
  {
    id: 'analyst',
    name: 'Analyste',
    description: 'Consulter le dashboard 10 fois',
    icon: '📊',
    rarity: 'rare'
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Compléter le profil à 100%',
    icon: '⭐',
    rarity: 'epic'
  },
  {
    id: 'dedicated',
    name: 'Assidu',
    description: 'Se connecter 7 jours consécutifs',
    icon: '🔥',
    rarity: 'epic'
  },
  {
    id: 'innovator',
    name: 'Innovateur',
    description: 'Générer première idée startup',
    icon: '🚀',
    rarity: 'rare'
  },
  {
    id: 'master',
    name: 'Maître',
    description: 'Atteindre le niveau 10',
    icon: '👑',
    rarity: 'legendary'
  }
];

// Predefined achievements
const defaultAchievements: Achievement[] = [
  {
    id: 'first_recommendation',
    name: 'Première Recommandation',
    description: 'Générer votre première recommandation IA',
    progress: 0,
    target: 1,
    completed: false,
    reward: { points: 100, badge: 'strategist' }
  },
  {
    id: 'chat_master',
    name: 'Maître du Chat',
    description: 'Envoyer 50 messages dans le chat IA',
    progress: 0,
    target: 50,
    completed: false,
    reward: { points: 500, badge: 'communicator' }
  },
  {
    id: 'profile_complete',
    name: 'Profil Parfait',
    description: 'Compléter votre profil à 100%',
    progress: 0,
    target: 100,
    completed: false,
    reward: { points: 200, badge: 'expert' }
  },
  {
    id: 'streak_week',
    name: 'Semaine Parfaite',
    description: 'Se connecter 7 jours consécutifs',
    progress: 0,
    target: 7,
    completed: false,
    reward: { points: 300, badge: 'dedicated' }
  },
  {
    id: 'analytics_explorer',
    name: 'Explorateur Analytics',
    description: 'Consulter le dashboard analytics 10 fois',
    progress: 0,
    target: 10,
    completed: false,
    reward: { points: 250, badge: 'analyst' }
  }
];

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [userStats, setUserStats] = useState<UserGamification>(() => {
    const saved = localStorage.getItem('gamification-stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...defaultStats,
        ...parsed,
        achievements: parsed.achievements || defaultAchievements,
        streaks: {
          ...defaultStats.streaks,
          ...parsed.streaks,
          lastLogin: parsed.streaks?.lastLogin ? new Date(parsed.streaks.lastLogin) : null
        }
      };
    }
    return { ...defaultStats, achievements: defaultAchievements };
  });

  const { addNotification } = useNotifications();

  // Calculate level based on points
  const calculateLevel = (points: number): number => {
    return Math.floor(points / 1000) + 1;
  };

  const addPoints = (points: number, reason: string) => {
    setUserStats(prev => {
      const newPoints = prev.totalPoints + points;
      const newLevel = calculateLevel(newPoints);
      const leveledUp = newLevel > prev.level;

      if (leveledUp) {
        addNotification({
          type: 'success',
          title: 'Niveau supérieur !',
          message: `Félicitations ! Vous avez atteint le niveau ${newLevel}`,
          persistent: false
        });
      }

      addNotification({
        type: 'info',
        title: `+${points} points`,
        message: reason,
        persistent: false
      });

      return {
        ...prev,
        totalPoints: newPoints,
        level: newLevel
      };
    });
  };

  const unlockBadge = (badgeId: string) => {
    const badge = availableBadges.find(b => b.id === badgeId);
    if (!badge) return;

    setUserStats(prev => {
      if (prev.badges.some(b => b.id === badgeId)) return prev;

      const unlockedBadge = { ...badge, unlockedAt: new Date() };
      
      addNotification({
        type: 'success',
        title: 'Nouveau badge débloqué !',
        message: `${badge.icon} ${badge.name}: ${badge.description}`,
        persistent: false
      });

      return {
        ...prev,
        badges: [...prev.badges, unlockedBadge]
      };
    });
  };

  const updateStreak = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    setUserStats(prev => {
      const lastLogin = prev.streaks.lastLogin;
      let newDaily = prev.streaks.daily;

      if (!lastLogin) {
        // First login
        newDaily = 1;
        unlockBadge('explorer');
      } else {
        const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
        const daysDiff = Math.floor((today.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
          // Consecutive day
          newDaily = prev.streaks.daily + 1;
        } else if (daysDiff > 1) {
          // Streak broken
          newDaily = 1;
        }
        // Same day = no change
      }

      return {
        ...prev,
        streaks: {
          ...prev.streaks,
          daily: newDaily,
          lastLogin: now
        }
      };
    });
  };

  const checkAchievements = () => {
    setUserStats(prev => {
      const updatedAchievements = prev.achievements.map(achievement => {
        if (achievement.completed) return achievement;

        let newProgress = achievement.progress;

        // Update progress based on achievement type
        switch (achievement.id) {
          case 'streak_week':
            newProgress = prev.streaks.daily;
            break;
          // Add other achievement progress updates here
        }

        const completed = newProgress >= achievement.target;

        if (completed && !achievement.completed) {
          // Achievement completed!
          addPoints(achievement.reward.points, `Achievement: ${achievement.name}`);
          
          if (achievement.reward.badge) {
            unlockBadge(achievement.reward.badge);
          }

          addNotification({
            type: 'success',
            title: 'Achievement débloqué !',
            message: `🏆 ${achievement.name}: ${achievement.description}`,
            persistent: false
          });
        }

        return {
          ...achievement,
          progress: newProgress,
          completed
        };
      });

      return {
        ...prev,
        achievements: updatedAchievements
      };
    });
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('gamification-stats', JSON.stringify(userStats));
  }, [userStats]);

  // Update streak on mount
  useEffect(() => {
    updateStreak();
  }, []);

  // Check achievements periodically
  useEffect(() => {
    checkAchievements();
  }, [userStats.totalPoints, userStats.streaks.daily]);

  return (
    <GamificationContext.Provider value={{
      userStats,
      addPoints,
      unlockBadge,
      updateStreak,
      checkAchievements
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}