import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface SkillsRadarChartProps {
  skills: string[];
  className?: string;
}

export default function SkillsRadarChart({ skills, className = '' }: SkillsRadarChartProps) {
  // Transformation des compétences en données pour le radar chart
  const skillCategories = [
    'Technical',
    'Leadership',
    'Communication',
    'Problem Solving',
    'Creativity',
    'Analytics'
  ];

  const getSkillScore = (category: string): number => {
    const categoryKeywords = {
      'Technical': ['javascript', 'python', 'react', 'programming', 'development', 'coding'],
      'Leadership': ['leadership', 'management', 'team', 'lead', 'director', 'supervisor'],
      'Communication': ['communication', 'presentation', 'writing', 'speaking', 'negotiation'],
      'Problem Solving': ['problem solving', 'analytical', 'troubleshooting', 'debugging', 'optimization'],
      'Creativity': ['design', 'creative', 'innovation', 'artistic', 'ui/ux', 'branding'],
      'Analytics': ['data', 'analytics', 'statistics', 'research', 'analysis', 'metrics']
    };

    const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || [];
    const matchingSkills = skills.filter(skill => 
      keywords.some(keyword => skill.toLowerCase().includes(keyword))
    );

    // Score basé sur le nombre de compétences correspondantes (0-100)
    return Math.min((matchingSkills.length / Math.max(skills.length * 0.3, 1)) * 100, 100);
  };

  const data = skillCategories.map(category => ({
    category,
    score: getSkillScore(category),
    fullMark: 100
  }));

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <h3 className="text-lg font-bold text-gray-800 mb-4">Profil de Compétences</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={false}
          />
          <Radar
            name="Compétences"
            dataKey="score"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
      
      {/* Légende */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-600">{item.category}</span>
            <span className="font-medium text-blue-600">{item.score.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}