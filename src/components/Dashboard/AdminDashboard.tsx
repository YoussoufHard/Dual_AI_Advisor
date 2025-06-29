import React, { useState, useEffect } from 'react';
import { PlatformMetrics, UserMetrics } from '../../types/analytics';
import { AnalyticsService } from '../../services/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, MessageSquare, Target, Activity, Award } from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const analytics = AnalyticsService.getInstance();
      const data = await analytics.getPlatformMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Impossible de charger les métriques</p>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Analytics</h1>
        <p className="text-gray-600">Vue d'ensemble de la plateforme AI/ML/Data</p>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs Totaux</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs Actifs (MAU)</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.activeUsers.monthly.toLocaleString()}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recommandations</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.recommendationsGenerated.toLocaleString()}</p>
            </div>
            <Target className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction</p>
              <p className="text-3xl font-bold text-gray-900">{(metrics.averageSatisfactionScore * 100).toFixed(1)}%</p>
            </div>
            <Award className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Utilisateurs Actifs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Utilisateurs Actifs</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Quotidien', value: metrics.activeUsers.daily },
              { name: 'Hebdomadaire', value: metrics.activeUsers.weekly },
              { name: 'Mensuel', value: metrics.activeUsers.monthly }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Compétences */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Compétences Populaires</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.topSkills.slice(0, 5)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ skill, percent }) => `${skill} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {metrics.topSkills.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Industries */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Secteurs Populaires</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.topIndustries.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="industry" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Métriques de Conversion */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Taux de Conversion</h3>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-500 mb-2">
                {(metrics.conversionRate * 100).toFixed(1)}%
              </div>
              <p className="text-gray-600">Visiteurs → Utilisateurs Actifs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Insights IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">🚀 Croissance</h4>
            <p className="text-sm text-blue-700">
              Augmentation de 23% des utilisateurs actifs ce mois-ci
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">💡 Opportunité</h4>
            <p className="text-sm text-green-700">
              Les utilisateurs en "Technology" ont 40% plus d'engagement
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-2">⚠️ Attention</h4>
            <p className="text-sm text-orange-700">
              Taux d'abandon élevé sur le formulaire de profil (35%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}