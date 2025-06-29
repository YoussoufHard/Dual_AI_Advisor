import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { Palette, Sun, Moon, Monitor, Settings, RotateCcw, Zap, Eye } from 'lucide-react';

export default function ThemeCustomizer() {
  const { theme, setTheme, toggleDarkMode, resetTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const colorPresets = [
    { name: 'Blue', primary: '#3B82F6', accent: '#8B5CF6' },
    { name: 'Green', primary: '#10B981', accent: '#06B6D4' },
    { name: 'Purple', primary: '#8B5CF6', accent: '#EC4899' },
    { name: 'Orange', primary: '#F59E0B', accent: '#EF4444' },
    { name: 'Teal', primary: '#14B8A6', accent: '#3B82F6' },
    { name: 'Rose', primary: '#F43F5E', accent: '#8B5CF6' }
  ];

  return (
    <>
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40"
        title="Personnaliser le thème"
      >
        <Palette className="w-6 h-6" />
      </button>

      {/* Theme Customizer Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Personnalisation
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
              {/* Theme Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Mode d'affichage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { mode: 'light' as const, icon: Sun, label: 'Clair' },
                    { mode: 'dark' as const, icon: Moon, label: 'Sombre' },
                    { mode: 'auto' as const, icon: Monitor, label: 'Auto' }
                  ].map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      onClick={() => setTheme({ mode })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        theme.mode === mode
                          ? 'border-primary bg-primary bg-opacity-10'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-medium">{label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Couleurs
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setTheme({ 
                        primaryColor: preset.primary, 
                        accentColor: preset.accent 
                      })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        theme.primaryColor === preset.primary
                          ? 'border-primary'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex space-x-1 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                      <div className="text-xs font-medium">{preset.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Bordures
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'none' as const, label: 'Aucune' },
                    { value: 'small' as const, label: 'Petites' },
                    { value: 'medium' as const, label: 'Moyennes' },
                    { value: 'large' as const, label: 'Grandes' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setTheme({ borderRadius: value })}
                      className={`p-2 text-xs rounded-lg border-2 transition-all ${
                        theme.borderRadius === value
                          ? 'border-primary bg-primary bg-opacity-10'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Taille de police
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'small' as const, label: 'Petite' },
                    { value: 'medium' as const, label: 'Normale' },
                    { value: 'large' as const, label: 'Grande' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setTheme({ fontSize: value })}
                      className={`p-2 text-xs rounded-lg border-2 transition-all ${
                        theme.fontSize === value
                          ? 'border-primary bg-primary bg-opacity-10'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessibility Options */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Accessibilité
                </label>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Animations</span>
                  </div>
                  <button
                    onClick={() => setTheme({ animations: !theme.animations })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      theme.animations ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      theme.animations ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">Mouvement réduit</span>
                  </div>
                  <button
                    onClick={() => setTheme({ reducedMotion: !theme.reducedMotion })}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      theme.reducedMotion ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      theme.reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetTheme}
                className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}