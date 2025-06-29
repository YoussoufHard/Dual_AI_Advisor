// Types pour le système ML
export interface MLModel {
  id: string;
  name: string;
  version: string;
  type: 'recommendation' | 'classification' | 'prediction';
  status: 'training' | 'ready' | 'deprecated';
  accuracy: number;
  lastTrained: Date;
  features: string[];
}

export interface TrainingData {
  userId: string;
  features: Record<string, any>;
  target: any;
  timestamp: Date;
}

export interface Prediction {
  modelId: string;
  input: Record<string, any>;
  output: any;
  confidence: number;
  timestamp: Date;
}

export interface FeatureStore {
  userId: string;
  features: {
    demographic: Record<string, any>;
    behavioral: Record<string, any>;
    contextual: Record<string, any>;
    temporal: Record<string, any>;
  };
  lastUpdated: Date;
}

export interface ModelPerformance {
  modelId: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  evaluationDate: Date;
  testDataSize: number;
}