import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, MapPin, Star, TrendingUp } from 'lucide-react';

interface SearchFilters {
  query: string;
  category: string[];
  dateRange: [Date | null, Date | null];
  location: string;
  experience: string[];
  skills: string[];
  industry: string[];
  rating: number;
  sortBy: 'relevance' | 'date' | 'popularity' | 'rating';
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  date: Date;
  location: string;
  rating: number;
  tags: string[];
}

export default function AdvancedSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: [],
    dateRange: [null, null],
    location: '',
    experience: [],
    skills: [],
    industry: [],
    rating: 0,
    sortBy: 'relevance'
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Mock data for demonstration
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Développeur Full Stack Senior',
      description: 'Poste de développeur full stack avec expertise React et Node.js',
      category: 'Emploi',
      date: new Date('2024-01-15'),
      location: 'Paris, France',
      rating: 4.5,
      tags: ['React', 'Node.js', 'TypeScript', 'Remote']
    },
    {
      id: '2',
      title: 'Formation Machine Learning',
      description: 'Cours complet sur le machine learning et l\'IA',
      category: 'Formation',
      date: new Date('2024-01-10'),
      location: 'En ligne',
      rating: 4.8,
      tags: ['ML', 'Python', 'IA', 'Data Science']
    },
    {
      id: '3',
      title: 'Startup FinTech Innovante',
      description: 'Idée de startup dans le domaine de la finance digitale',
      category: 'Startup',
      date: new Date('2024-01-12'),
      location: 'Lyon, France',
      rating: 4.2,
      tags: ['FinTech', 'Blockchain', 'Mobile', 'B2C']
    }
  ];

  const categories = ['Emploi', 'Formation', 'Startup', 'Mentoring', 'Événements'];
  const experienceLevels = ['Débutant', 'Intermédiaire', 'Avancé', 'Expert'];
  const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing'];

  useEffect(() => {
    if (filters.query.length > 2) {
      // Simulate search suggestions
      const mockSuggestions = [
        'développeur react',
        'machine learning',
        'startup fintech',
        'formation python',
        'mentor tech'
      ].filter(s => s.toLowerCase().includes(filters.query.toLowerCase()));
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [filters.query]);

  const handleSearch = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const filteredResults = mockResults.filter(result => {
        const matchesQuery = !filters.query || 
          result.title.toLowerCase().includes(filters.query.toLowerCase()) ||
          result.description.toLowerCase().includes(filters.query.toLowerCase());
        
        const matchesCategory = filters.category.length === 0 || 
          filters.category.includes(result.category);
        
        const matchesLocation = !filters.location || 
          result.location.toLowerCase().includes(filters.location.toLowerCase());
        
        const matchesRating = result.rating >= filters.rating;

        return matchesQuery && matchesCategory && matchesLocation && matchesRating;
      });

      // Sort results
      const sortedResults = [...filteredResults].sort((a, b) => {
        switch (filters.sortBy) {
          case 'date':
            return b.date.getTime() - a.date.getTime();
          case 'rating':
            return b.rating - a.rating;
          case 'popularity':
            return Math.random() - 0.5; // Random for demo
          default:
            return 0;
        }
      });

      setResults(sortedResults);
      setLoading(false);
    }, 1000);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: [],
      dateRange: [null, null],
      location: '',
      experience: [],
      skills: [],
      industry: [],
      rating: 0,
      sortBy: 'relevance'
    });
    setResults([]);
  };

  const toggleFilter = (filterType: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[filterType] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return { ...prev, [filterType]: newArray };
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      {/* Search Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              placeholder="Rechercher des emplois, formations, startups..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, query: suggestion }));
                      setSuggestions([]);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <Search className="inline w-4 h-4 mr-2 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center px-4 py-3 rounded-lg border transition-colors ${
              isOpen 
                ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-400'
                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filtres
          </button>
          
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {isOpen && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Catégories
              </label>
              <div className="space-y-2">
                {categories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category)}
                      onChange={() => toggleFilter('category', category)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {category}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Niveau d'expérience
              </label>
              <div className="space-y-2">
                {experienceLevels.map(level => (
                  <label key={level} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.experience.includes(level)}
                      onChange={() => toggleFilter('experience', level)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Industries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Secteurs
              </label>
              <div className="space-y-2">
                {industries.map(industry => (
                  <label key={industry} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.industry.includes(industry)}
                      onChange={() => toggleFilter('industry', industry)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {industry}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Localisation
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ville, région, pays..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Star className="inline w-4 h-4 mr-1" />
                Note minimum
              </label>
              <select
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value={0}>Toutes les notes</option>
                <option value={3}>3+ étoiles</option>
                <option value={4}>4+ étoiles</option>
                <option value={4.5}>4.5+ étoiles</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <TrendingUp className="inline w-4 h-4 mr-1" />
                Trier par
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="relevance">Pertinence</option>
                <option value="date">Date</option>
                <option value="rating">Note</option>
                <option value="popularity">Popularité</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={clearFilters}
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4 mr-1" />
              Effacer les filtres
            </button>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {results.length} résultat{results.length !== 1 ? 's' : ''} trouvé{results.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="p-6">
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {result.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {result.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {result.date.toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {result.location}
                      </span>
                      <span className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        {result.rating}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {result.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                      {result.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && filters.query && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Aucun résultat trouvé pour "{filters.query}"</p>
          <p className="text-sm mt-1">Essayez de modifier vos critères de recherche</p>
        </div>
      )}
    </div>
  );
}