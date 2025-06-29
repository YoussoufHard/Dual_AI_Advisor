import React, { useState } from 'react';
import { Download, FileText, Table, Image, Share2, Calendar, Settings } from 'lucide-react';
import { useNotifications } from '../Notifications/NotificationProvider';

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  icon: React.ReactNode;
  sections: string[];
}

interface ExportConfig {
  template: string;
  dateRange: [Date | null, Date | null];
  includeCharts: boolean;
  includeBranding: boolean;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  scheduling: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
  };
}

export default function ExportManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ExportConfig>({
    template: 'career-report',
    dateRange: [null, null],
    includeCharts: true,
    includeBranding: true,
    format: 'pdf',
    scheduling: {
      enabled: false,
      frequency: 'weekly',
      time: '09:00'
    }
  });
  const [exporting, setExporting] = useState(false);
  const { addNotification } = useNotifications();

  const templates: ExportTemplate[] = [
    {
      id: 'career-report',
      name: 'Rapport de Carrière',
      description: 'Analyse complète de votre progression professionnelle',
      format: 'pdf',
      icon: <FileText className="w-5 h-5" />,
      sections: ['Profil', 'Recommandations', 'Compétences', 'Objectifs', 'Analytics']
    },
    {
      id: 'startup-analysis',
      name: 'Analyse Startup',
      description: 'Rapport détaillé sur vos idées et stratégies startup',
      format: 'pdf',
      icon: <FileText className="w-5 h-5" />,
      sections: ['Idées', 'Business Model', 'Marché', 'Prédictions ML', 'Roadmap']
    },
    {
      id: 'analytics-data',
      name: 'Données Analytics',
      description: 'Export des métriques et données d\'utilisation',
      format: 'excel',
      icon: <Table className="w-5 h-5" />,
      sections: ['Métriques', 'Événements', 'Performance', 'Tendances']
    },
    {
      id: 'skills-matrix',
      name: 'Matrice de Compétences',
      description: 'Analyse détaillée de vos compétences et recommandations',
      format: 'csv',
      icon: <Table className="w-5 h-5" />,
      sections: ['Compétences', 'Classifications ML', 'Marché', 'Formations']
    }
  ];

  const handleExport = async () => {
    setExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const template = templates.find(t => t.id === config.template);
      const fileName = `${template?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${config.format}`;
      
      // In a real implementation, this would generate and download the actual file
      addNotification({
        type: 'success',
        title: 'Export terminé',
        message: `Le fichier ${fileName} a été généré avec succès`,
        action: {
          label: 'Télécharger',
          onClick: () => {
            // Simulate download
            const link = document.createElement('a');
            link.href = '#';
            link.download = fileName;
            link.click();
          }
        }
      });
      
      setIsOpen(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur d\'export',
        message: 'Une erreur est survenue lors de la génération du fichier'
      });
    } finally {
      setExporting(false);
    }
  };

  const scheduleExport = () => {
    addNotification({
      type: 'success',
      title: 'Export programmé',
      message: `Rapport programmé ${config.scheduling.frequency} à ${config.scheduling.time}`
    });
    setIsOpen(false);
  };

  return (
    <>
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Download className="w-4 h-4 mr-2" />
        Exporter
      </button>

      {/* Export Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Download className="w-6 h-6 mr-2 text-green-600" />
                  Exporter les Données
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Modèle de rapport
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setConfig(prev => ({ 
                        ...prev, 
                        template: template.id,
                        format: template.format 
                      }))}
                      className={`p-4 text-left border-2 rounded-lg transition-all ${
                        config.template === template.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        {template.icon}
                        <h4 className="font-semibold ml-2">{template.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.sections.map((section, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full"
                          >
                            {section}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Format de fichier
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['pdf', 'excel', 'csv', 'json'].map((format) => (
                    <button
                      key={format}
                      onClick={() => setConfig(prev => ({ ...prev, format: format as any }))}
                      className={`p-3 text-center border-2 rounded-lg transition-all ${
                        config.format === format
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium uppercase">{format}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Options d'export
                </label>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.includeCharts}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        includeCharts: e.target.checked 
                      }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Inclure les graphiques et visualisations
                    </span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.includeBranding}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        includeBranding: e.target.checked 
                      }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Inclure le branding et logo
                    </span>
                  </label>
                </div>
              </div>

              {/* Scheduling */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Programmation automatique
                  </label>
                  <button
                    onClick={() => setConfig(prev => ({ 
                      ...prev, 
                      scheduling: { 
                        ...prev.scheduling, 
                        enabled: !prev.scheduling.enabled 
                      }
                    }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      config.scheduling.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      config.scheduling.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {config.scheduling.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Fréquence
                      </label>
                      <select
                        value={config.scheduling.frequency}
                        onChange={(e) => setConfig(prev => ({ 
                          ...prev, 
                          scheduling: { 
                            ...prev.scheduling, 
                            frequency: e.target.value as any 
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="daily">Quotidien</option>
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuel</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Heure
                      </label>
                      <input
                        type="time"
                        value={config.scheduling.time}
                        onChange={(e) => setConfig(prev => ({ 
                          ...prev, 
                          scheduling: { 
                            ...prev.scheduling, 
                            time: e.target.value 
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Annuler
                </button>
                
                <div className="flex space-x-3">
                  {config.scheduling.enabled && (
                    <button
                      onClick={scheduleExport}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Programmer
                    </button>
                  )}
                  
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {exporting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Export...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Exporter
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}