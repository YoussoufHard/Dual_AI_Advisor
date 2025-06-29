import React, { useState } from 'react';
import { useGamification } from './GamificationProvider';
import { Trophy, Star, Target, Flame, Crown, Award, TrendingUp } from 'lucide-react';

export default function GamificationPanel() {
  const { userStats } = useGamification();
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'achievements'>('overview');

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const pointsToNextLevel = (userStats.level * 1000) - userStats.totalPoints;
  const progressToNextLevel = ((userStats.totalPoints % 1000) / 1000) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
          Progression
        </h3>
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Niveau {userStats.level}
          </span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {userStats.totalPoints.toLocaleString()}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">Points</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {userStats.badges.length}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400">Badges</div>
        </div>
        
        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {userStats.streaks.daily}
          </div>
          <div className="text-sm text-orange-600 dark:text-orange-400">Série</div>
        </div>
        
        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {userStats.achievements.filter(a => a.completed).length}
          </div>
          <div className="text-sm text-purple-600 dark:text-purple-400">Succès</div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progression vers le niveau {userStats.level + 1}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {pointsToNextLevel} points restants
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressToNextLevel}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
          { id: 'badges', label: 'Badges', icon: Award },
          { id: 'achievements', label: 'Succès', icon: Target }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Recent Badges */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Badges Récents
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {userStats.badges.slice(-6).map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3 rounded-lg text-center ${getRarityColor(badge.rarity)}`}
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-medium">{badge.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Achievements */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Succès en Cours
            </h4>
            <div className="space-y-3">
              {userStats.achievements
                .filter(a => !a.completed)
                .slice(0, 3)
                .map((achievement) => (
                  <div key={achievement.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">
                        {achievement.name}
                      </h5>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {achievement.progress}/{achievement.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {achievement.description}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {userStats.badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-lg text-center ${getRarityColor(badge.rarity)}`}
            >
              <div className="text-3xl mb-2">{badge.icon}</div>
              <h4 className="font-semibold mb-1">{badge.name}</h4>
              <p className="text-xs opacity-80">{badge.description}</p>
              {badge.unlockedAt && (
                <p className="text-xs mt-2 opacity-60">
                  Débloqué le {badge.unlockedAt.toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {userStats.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 ${
                achievement.completed
                  ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                  : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-semibold ${
                  achievement.completed
                    ? 'text-green-800 dark:text-green-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {achievement.completed && '✅ '}{achievement.name}
                </h4>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  +{achievement.reward.points} pts
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {achievement.description}
              </p>
              {!achievement.completed && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progression</span>
                    <span className="font-medium">
                      {achievement.progress}/{achievement.target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}