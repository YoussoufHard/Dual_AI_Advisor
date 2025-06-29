import { UserProfile } from '../types';
import { MLModel, Prediction, FeatureStore, TrainingData } from '../types/ml';

export class MLService {
  private static instance: MLService;
  private models: Map<string, MLModel> = new Map();
  private featureStore: Map<string, FeatureStore> = new Map();

  static getInstance(): MLService {
    if (!MLService.instance) {
      MLService.instance = new MLService();
    }
    return MLService.instance;
  }

  constructor() {
    this.initializeModels();
  }

  private initializeModels() {
    // Modèle de recommandation de carrière
    const careerModel: MLModel = {
      id: 'career-recommendation-v1',
      name: 'Career Recommendation Model',
      version: '1.0.0',
      type: 'recommendation',
      status: 'ready',
      accuracy: 0.87,
      lastTrained: new Date('2024-01-15'),
      features: ['skills', 'interests', 'experience_level', 'industry', 'years_experience']
    };

    // Modèle de prédiction de succès startup
    const startupModel: MLModel = {
      id: 'startup-success-v1',
      name: 'Startup Success Prediction',
      version: '1.0.0',
      type: 'prediction',
      status: 'ready',
      accuracy: 0.82,
      lastTrained: new Date('2024-01-10'),
      features: ['market_size', 'team_experience', 'funding_stage', 'industry_growth', 'competition_level']
    };

    // Modèle de classification de compétences
    const skillsModel: MLModel = {
      id: 'skills-classification-v1',
      name: 'Skills Classification Model',
      version: '1.0.0',
      type: 'classification',
      status: 'ready',
      accuracy: 0.91,
      lastTrained: new Date('2024-01-20'),
      features: ['skill_text', 'context', 'industry', 'job_level']
    };

    this.models.set(careerModel.id, careerModel);
    this.models.set(startupModel.id, startupModel);
    this.models.set(skillsModel.id, skillsModel);
  }

  // Extraction et engineering des features
  extractFeatures(profile: UserProfile): FeatureStore {
    const userId = profile.name; // Simplification pour la démo

    const features: FeatureStore = {
      userId,
      features: {
        demographic: {
          experience_level: this.encodeExperienceLevel(profile.experienceLevel),
          years_experience: profile.yearsExperience,
          industry: this.encodeIndustry(profile.industry),
          current_role: profile.currentRole || 'unknown'
        },
        behavioral: {
          skills_count: profile.skills.length,
          interests_count: profile.interests.length,
          skills_diversity: this.calculateSkillsDiversity(profile.skills),
          interests_alignment: this.calculateInterestsAlignment(profile.interests, profile.industry)
        },
        contextual: {
          skills_vector: this.vectorizeSkills(profile.skills),
          interests_vector: this.vectorizeInterests(profile.interests),
          market_demand: this.calculateMarketDemand(profile.skills, profile.industry),
          skill_rarity: this.calculateSkillRarity(profile.skills)
        },
        temporal: {
          profile_created: new Date(),
          last_updated: new Date(),
          session_count: 1,
          engagement_score: 0.5
        }
      },
      lastUpdated: new Date()
    };

    this.featureStore.set(userId, features);
    return features;
  }

  // Prédiction de recommandation de carrière avec ML
  async predictCareerMatch(profile: UserProfile): Promise<Prediction> {
    const features = this.extractFeatures(profile);
    const model = this.models.get('career-recommendation-v1')!;

    // Simulation d'un modèle ML réel
    const input = features.features;
    const prediction = this.simulateCareerPrediction(input);

    return {
      modelId: model.id,
      input,
      output: prediction,
      confidence: Math.random() * 0.3 + 0.7, // 70-100%
      timestamp: new Date()
    };
  }

  // Prédiction de succès startup
  async predictStartupSuccess(profile: UserProfile, startupIdea: string): Promise<Prediction> {
    const features = this.extractFeatures(profile);
    const model = this.models.get('startup-success-v1')!;

    const input = {
      ...features.features,
      startup_idea: startupIdea,
      market_size: this.estimateMarketSize(startupIdea, profile.industry),
      team_experience: features.features.demographic.years_experience,
      funding_stage: 'pre-seed',
      industry_growth: this.getIndustryGrowthRate(profile.industry),
      competition_level: this.assessCompetitionLevel(startupIdea, profile.industry)
    };

    const prediction = this.simulateStartupSuccessPrediction(input);

    return {
      modelId: model.id,
      input,
      output: prediction,
      confidence: Math.random() * 0.2 + 0.75, // 75-95%
      timestamp: new Date()
    };
  }

  // Classification automatique des compétences
  async classifySkills(skills: string[]): Promise<Record<string, string[]>> {
    const categories = {
      'Technical': [] as string[],
      'Soft Skills': [] as string[],
      'Domain Expertise': [] as string[],
      'Tools & Technologies': [] as string[],
      'Languages': [] as string[]
    };

    const technicalKeywords = ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker', 'kubernetes'];
    const softSkillsKeywords = ['leadership', 'communication', 'teamwork', 'problem solving', 'creativity'];
    const toolsKeywords = ['figma', 'photoshop', 'excel', 'tableau', 'jira', 'slack'];
    const languageKeywords = ['english', 'french', 'spanish', 'german', 'chinese'];

    skills.forEach(skill => {
      const skillLower = skill.toLowerCase();
      
      if (technicalKeywords.some(keyword => skillLower.includes(keyword))) {
        categories['Technical'].push(skill);
      } else if (softSkillsKeywords.some(keyword => skillLower.includes(keyword))) {
        categories['Soft Skills'].push(skill);
      } else if (toolsKeywords.some(keyword => skillLower.includes(keyword))) {
        categories['Tools & Technologies'].push(skill);
      } else if (languageKeywords.some(keyword => skillLower.includes(keyword))) {
        categories['Languages'].push(skill);
      } else {
        categories['Domain Expertise'].push(skill);
      }
    });

    return categories;
  }

  // Recommandations personnalisées basées sur ML
  async getPersonalizedRecommendations(profile: UserProfile): Promise<{
    careerPaths: string[];
    skillsToLearn: string[];
    coursesRecommended: string[];
    networkingOpportunities: string[];
  }> {
    const features = this.extractFeatures(profile);
    
    return {
      careerPaths: this.generateCareerPaths(features),
      skillsToLearn: this.recommendSkills(features),
      coursesRecommended: this.recommendCourses(features),
      networkingOpportunities: this.recommendNetworking(features)
    };
  }

  // Méthodes utilitaires pour l'engineering des features
  private encodeExperienceLevel(level: string): number {
    const mapping = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
    return mapping[level as keyof typeof mapping] || 1;
  }

  private encodeIndustry(industry: string): number {
    const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Design', 'Consulting'];
    return industries.indexOf(industry) + 1;
  }

  private calculateSkillsDiversity(skills: string[]): number {
    const categories = ['technical', 'soft', 'domain', 'tools', 'languages'];
    const skillCategories = new Set();
    
    skills.forEach(skill => {
      // Logique simplifiée de catégorisation
      if (skill.toLowerCase().includes('javascript') || skill.toLowerCase().includes('python')) {
        skillCategories.add('technical');
      } else if (skill.toLowerCase().includes('leadership') || skill.toLowerCase().includes('communication')) {
        skillCategories.add('soft');
      }
      // ... autres catégories
    });

    return skillCategories.size / categories.length;
  }

  private calculateInterestsAlignment(interests: string[], industry: string): number {
    // Calcul de l'alignement entre intérêts et industrie
    const industryKeywords = {
      'Technology': ['ai', 'programming', 'innovation', 'software'],
      'Healthcare': ['health', 'medicine', 'care', 'wellness'],
      'Finance': ['money', 'investment', 'economics', 'trading']
    };

    const keywords = industryKeywords[industry as keyof typeof industryKeywords] || [];
    const alignmentScore = interests.reduce((score, interest) => {
      return score + (keywords.some(keyword => 
        interest.toLowerCase().includes(keyword)) ? 1 : 0);
    }, 0);

    return alignmentScore / Math.max(interests.length, 1);
  }

  private vectorizeSkills(skills: string[]): number[] {
    // Vectorisation simplifiée des compétences
    const commonSkills = ['javascript', 'python', 'react', 'leadership', 'communication'];
    return commonSkills.map(skill => 
      skills.some(userSkill => userSkill.toLowerCase().includes(skill)) ? 1 : 0
    );
  }

  private vectorizeInterests(interests: string[]): number[] {
    // Vectorisation simplifiée des intérêts
    const commonInterests = ['technology', 'health', 'finance', 'education', 'environment'];
    return commonInterests.map(interest => 
      interests.some(userInterest => userInterest.toLowerCase().includes(interest)) ? 1 : 0
    );
  }

  private calculateMarketDemand(skills: string[], industry: string): number {
    // Simulation de la demande du marché
    const highDemandSkills = ['ai', 'machine learning', 'cloud', 'cybersecurity', 'data science'];
    const demandScore = skills.reduce((score, skill) => {
      return score + (highDemandSkills.some(demand => 
        skill.toLowerCase().includes(demand)) ? 1 : 0);
    }, 0);

    return Math.min(demandScore / skills.length, 1);
  }

  private calculateSkillRarity(skills: string[]): number {
    // Calcul de la rareté des compétences
    const rareSkills = ['quantum computing', 'blockchain', 'ar/vr', 'robotics'];
    const rarityScore = skills.reduce((score, skill) => {
      return score + (rareSkills.some(rare => 
        skill.toLowerCase().includes(rare)) ? 1 : 0);
    }, 0);

    return rarityScore / Math.max(skills.length, 1);
  }

  // Simulations des modèles ML
  private simulateCareerPrediction(input: any): any {
    const careerPaths = [
      'Senior Software Engineer',
      'Product Manager',
      'Data Scientist',
      'DevOps Engineer',
      'Technical Lead',
      'Solutions Architect'
    ];

    return {
      recommendedRole: careerPaths[Math.floor(Math.random() * careerPaths.length)],
      matchScore: Math.random() * 0.3 + 0.7,
      salaryRange: {
        min: 60000 + Math.floor(Math.random() * 40000),
        max: 100000 + Math.floor(Math.random() * 80000)
      },
      growthPotential: Math.random() * 0.4 + 0.6,
      marketDemand: Math.random() * 0.3 + 0.7
    };
  }

  private simulateStartupSuccessPrediction(input: any): any {
    return {
      successProbability: Math.random() * 0.4 + 0.4, // 40-80%
      riskFactors: [
        'Market competition',
        'Funding challenges',
        'Team scaling'
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      recommendedActions: [
        'Validate MVP with 100+ users',
        'Secure seed funding',
        'Build strategic partnerships',
        'Hire key technical talent'
      ].slice(0, Math.floor(Math.random() * 4) + 2),
      timeToMarket: Math.floor(Math.random() * 12) + 6, // 6-18 mois
      fundingNeeded: Math.floor(Math.random() * 500000) + 100000 // 100k-600k
    };
  }

  private generateCareerPaths(features: FeatureStore): string[] {
    const paths = [
      'Senior Developer → Tech Lead → Engineering Manager',
      'Data Analyst → Data Scientist → ML Engineer',
      'Product Owner → Product Manager → VP Product',
      'Designer → Senior Designer → Design Director',
      'Consultant → Senior Consultant → Partner'
    ];
    return paths.slice(0, 3);
  }

  private recommendSkills(features: FeatureStore): string[] {
    const skills = [
      'Machine Learning',
      'Cloud Architecture',
      'Leadership',
      'Data Visualization',
      'Agile Methodology',
      'Cybersecurity',
      'Mobile Development',
      'DevOps'
    ];
    return skills.slice(0, 4);
  }

  private recommendCourses(features: FeatureStore): string[] {
    return [
      'Advanced React Development',
      'Machine Learning Fundamentals',
      'Leadership in Tech',
      'Cloud Architecture on AWS',
      'Data Science with Python'
    ].slice(0, 3);
  }

  private recommendNetworking(features: FeatureStore): string[] {
    return [
      'Tech Meetups in your city',
      'Industry conferences',
      'LinkedIn professional groups',
      'Startup accelerator events',
      'Online developer communities'
    ].slice(0, 3);
  }

  private estimateMarketSize(idea: string, industry: string): number {
    // Simulation de l'estimation de taille de marché
    return Math.random() * 1000000000; // 0-1B$
  }

  private getIndustryGrowthRate(industry: string): number {
    const growthRates = {
      'Technology': 0.15,
      'Healthcare': 0.08,
      'Finance': 0.05,
      'Education': 0.06,
      'Marketing': 0.10
    };
    return growthRates[industry as keyof typeof growthRates] || 0.07;
  }

  private assessCompetitionLevel(idea: string, industry: string): number {
    // Simulation de l'évaluation de la concurrence
    return Math.random(); // 0-1 (faible à forte concurrence)
  }

  // API publique pour les composants React
  getModels(): MLModel[] {
    return Array.from(this.models.values());
  }

  getFeatures(userId: string): FeatureStore | undefined {
    return this.featureStore.get(userId);
  }
}

// Hook React pour le service ML
import { useEffect, useState } from 'react';

export function useMLService() {
  const [mlService] = useState(() => MLService.getInstance());
  const [models, setModels] = useState<MLModel[]>([]);

  useEffect(() => {
    setModels(mlService.getModels());
  }, [mlService]);

  return {
    mlService,
    models,
    predictCareerMatch: mlService.predictCareerMatch.bind(mlService),
    predictStartupSuccess: mlService.predictStartupSuccess.bind(mlService),
    classifySkills: mlService.classifySkills.bind(mlService),
    getPersonalizedRecommendations: mlService.getPersonalizedRecommendations.bind(mlService)
  };
}