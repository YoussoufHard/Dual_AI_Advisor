import React, { useState, useEffect } from 'react';
import { Cloud, Database, Shield, Zap, Globe, Server, BarChart3, Cpu } from 'lucide-react';

interface CloudService {
  id: string;
  name: string;
  provider: 'AWS' | 'Google Cloud' | 'Azure';
  status: 'active' | 'inactive' | 'error';
  usage: number;
  cost: number;
  icon: React.ReactNode;
}

export default function CloudServicesPanel() {
  const [services, setServices] = useState<CloudService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation des services cloud
    const mockServices: CloudService[] = [
      {
        id: 'compute',
        name: 'Compute Engine',
        provider: 'Google Cloud',
        status: 'active',
        usage: 78,
        cost: 245.50,
        icon: <Cpu className="w-5 h-5" />
      },
      {
        id: 'database',
        name: 'Cloud SQL',
        provider: 'Google Cloud',
        status: 'active',
        usage: 65,
        cost: 89.30,
        icon: <Database className="w-5 h-5" />
      },
      {
        id: 'ml',
        name: 'AI Platform',
        provider: 'Google Cloud',
        status: 'active',
        usage: 45,
        cost: 156.80,
        icon: <Zap className="w-5 h-5" />
      },
      {
        id: 'storage',
        name: 'Cloud Storage',
        provider: 'Google Cloud',
        status: 'active',
        usage: 32,
        cost: 23.45,
        icon: <Server className="w-5 h-5" />
      },
      {
        id: 'analytics',
        name: 'BigQuery',
        provider: 'Google Cloud',
        status: 'active',
        usage: 58,
        cost: 78.90,
        icon: <BarChart3 className="w-5 h-5" />
      },
      {
        id: 'security',
        name: 'Cloud Security',
        provider: 'Google Cloud',
        status: 'active',
        usage: 25,
        cost: 45.60,
        icon: <Shield className="w-5 h-5" />
      }
    ];

    setTimeout(() => {
      setServices(mockServices);
      setLoading(false);
    }, 1000);
  }, []);

  const totalCost = services.reduce((sum, service) => sum + service.cost, 0);
  const averageUsage = services.reduce((sum, service) => sum + service.usage, 0) / services.length;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Chargement des services cloud...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
        <div className="flex items-center mb-2">
          <Cloud className="w-6 h-6 mr-2" />
          <h3 className="text-xl font-bold">Infrastructure Cloud</h3>
        </div>
        <p className="opacity-90">Monitoring et gestion des services cloud</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coût Total Mensuel</p>
              <p className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisation Moyenne</p>
              <p className="text-2xl font-bold text-gray-900">{averageUsage.toFixed(0)}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Services Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{services.filter(s => s.status === 'active').length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Server className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Services Cloud</h4>
        
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  service.status === 'active' ? 'bg-green-100 text-green-600' :
                  service.status === 'error' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {service.icon}
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-800">{service.name}</h5>
                  <p className="text-sm text-gray-600">{service.provider}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Utilisation</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          service.usage > 80 ? 'bg-red-500' :
                          service.usage > 60 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${service.usage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{service.usage}%</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-600">Coût</p>
                  <p className="font-semibold text-gray-800">${service.cost.toFixed(2)}</p>
                </div>
                
                <div className={`w-3 h-3 rounded-full ${
                  service.status === 'active' ? 'bg-green-500' :
                  service.status === 'error' ? 'bg-red-500' :
                  'bg-gray-400'
                }`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h4 className="text-lg font-bold text-gray-800 mb-4">Recommandations d'Optimisation</h4>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-blue-800">Optimisation des coûts</p>
              <p className="text-sm text-blue-700">
                Réduisez les coûts de 15% en optimisant l'utilisation de Compute Engine
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-green-800">Scaling automatique</p>
              <p className="text-sm text-green-700">
                Activez l'auto-scaling pour gérer les pics de charge automatiquement
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-orange-800">Sécurité renforcée</p>
              <p className="text-sm text-orange-700">
                Implémentez des politiques de sécurité avancées pour protéger vos données
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}