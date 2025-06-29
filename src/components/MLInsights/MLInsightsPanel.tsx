import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { useMLService } from '../../services/mlService';
import { Prediction } from '../../types/ml';
import { Brain, TrendingUp, Target, Lightbulb, BarChart3, Zap } from 'lucide-react';

interface MLInsightsPanelProps {
  profile: UserProfile;
  mode: 'career' | 'startup';
}

export default function MLInsightsPanel({ profile, mode }: MLInsightsPanelProps) {
  const { mlService, predictCareerMatch, predictStartupSuccess, classifySkills, getPersonalizedRecommendations } = useMLService();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [skillsClassification, setSkillsClassification] = useState<Record<string, string[]> | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMLInsights();
  }, [profile, mode]);

  const loadMLInsights = async () => {
    setLoading(true);
    try {
      // Classification des compétences
      const classified = await classifySkills(profile.skills);
      setSkillsClassification(classified);

      // Prédictions ML
      if (mode === 'career') {
        const careerPrediction = await predictCareerMatch(profile);
        setPrediction(careerPrediction);
      } else {
        const startupPrediction = await predictStartupSuccess(profile, 'AI-powered platform');
        setPrediction(startupPrediction);
      }

      // Recommandations personnalisées
      const personalizedRecs = await getPersonalizedRecommendations(profile);
      setRecommendations(personalizedRecs);

    } catch (error) {
      console.error('Failed to load ML insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Analyse ML en cours...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center mb-2">
          <Brain className="w-6 h-6 mr-2" />
          <h3 className="text-xl font-bold">Insights IA/ML</h3>
        </div>
        <p className="opacity-90">Analyse avancée basée sur l'intelligence artificielle</p>
      </div>

      {/* ML Prediction */}
      {prediction && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-500" />
            Prédiction ML ({(prediction.confidence * 100).toFixed(1)}% de confiance)
          </h4>
          
          {mode === 'career' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-semibold text-blue-800">Poste Recommandé</h5>
                <p className="text-blue-700">{prediction.output.recommendedRole}</p>
                <div className="mt-2 flex items-center">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${prediction.output.matchScore * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-blue-600">
                    {(prediction.output.matchScore * 100).toFixed(0)}% match
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <h6 className="font-medium text-green-800">Salaire Estimé</h6>
                  <p className="text-green-700">
                    {prediction.output.salaryRange.min.toLocaleString()}€ - {prediction.output.salaryRange.max.toLocaleString()}€
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <h6 className="font-medium text-orange-800">Demande Marché</h6>
                  <p className="text-orange-700">
                    {(prediction.output.marketDemand * 100).toFixed(0)}% élevée
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h5 className="font-semibold text-green-800">Probabilité de Succès</h5>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-green-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full" 
                      style={{ width: `${prediction.output.successProbability * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 font-bold text-green-600">
                    {(prediction.output.successProbability * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <h6 className="font-medium text-blue-800">Time to Market</h6>
                  <p className="text-blue-700">{prediction.output.timeToMarket} mois</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <h6 className="font-medium text-purple-800">Financement Estimé</h6>
                  <p className="text-purple-700">
                    {(prediction.output.fundingNeeded / 1000).toFixed(0)}k€
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skills Classification */}
      {skillsClassification && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-500" />
            Classification Automatique des Compétences
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(skillsClassification).map(([category, skills]) => (
              skills.length > 0 && (
                <div key={category} className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-800 mb-2">{category}</h5>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Personalized Recommendations */}
      {recommendations && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
            Recommandations Personnalisées IA
          </h4>
          
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-semibold text-blue-800 mb-2">Parcours Carrière Suggérés</h5>
              <ul className="space-y-1">
                {recommendations.careerPaths.map((path: string, index: number) => (
                  <li key={index} className="text-blue-700 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {path}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-semibold text-green-800 mb-2">Compétences à Développer</h5>
              <div className="flex flex-wrap gap-2">
                {recommendations.skillsToLearn.map((skill: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h5 className="font-semibold text-purple-800 mb-2">Formations Recommandées</h5>
              <ul className="space-y-1">
                {recommendations.coursesRecommended.map((course: string, index: number) => (
                  <li key={index} className="text-purple-700 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    {course}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}