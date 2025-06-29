import React, { useState, useEffect } from 'react';
import { useLocation } from './LocationProvider';
import { MapPin, Briefcase, Calendar, Building, Navigation, Star, Clock } from 'lucide-react';

export default function LocalOpportunities() {
  const { location, requestLocation, getLocalJobs, getLocalEvents, getLocalCompanies } = useLocation();
  const [activeTab, setActiveTab] = useState<'jobs' | 'events' | 'companies'>('jobs');
  const [jobs, setJobs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location) {
      loadLocalData();
    }
  }, [location]);

  const loadLocalData = async () => {
    setLoading(true);
    try {
      const [jobsData, eventsData, companiesData] = await Promise.all([
        getLocalJobs(),
        getLocalEvents(),
        getLocalCompanies()
      ]);
      
      setJobs(jobsData);
      setEvents(eventsData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Failed to load local data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!location) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Découvrez les opportunités près de chez vous
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Activez la géolocalisation pour voir les emplois, événements et entreprises dans votre région
        </p>
        <button
          onClick={requestLocation}
          className="flex items-center mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Navigation className="w-5 h-5 mr-2" />
          Activer la géolocalisation
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-blue-500" />
              Opportunités Locales
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {location.city}, {location.country}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Précision</div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ±{Math.round((location.accuracy || 0) / 1000)}km
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'jobs', label: 'Emplois', icon: Briefcase, count: jobs.length },
          { id: 'events', label: 'Événements', icon: Calendar, count: events.length },
          { id: 'companies', label: 'Entreprises', icon: Building, count: companies.length }
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === id
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
            <span className="ml-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Jobs Tab */}
            {activeTab === 'jobs' && (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {job.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {job.company}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.distance}
                          </span>
                          <span className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1" />
                            {job.type}
                          </span>
                          {job.remote && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                              Remote OK
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {job.salary}
                        </div>
                        <button className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                          Voir l'offre
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {event.title}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {event.date.toLocaleDateString('fr-FR')}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {event.distance}
                          </span>
                          <span className="flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {event.attendees} participants
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm rounded-full">
                          {event.type}
                        </span>
                        <button className="block mt-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
                          S'inscrire
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Companies Tab */}
            {activeTab === 'companies' && (
              <div className="space-y-4">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {company.name}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {company.industry} • {company.size} employés
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {company.distance}
                          </span>
                          <span className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            {company.rating}
                          </span>
                          <span className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1" />
                            {company.openPositions} postes ouverts
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <button className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
                          Voir profil
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}