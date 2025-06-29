import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNotifications } from '../Notifications/NotificationProvider';

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  region?: string;
  accuracy?: number;
}

interface LocationContextType {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  clearLocation: () => void;
  getLocalJobs: () => Promise<any[]>;
  getLocalEvents: () => Promise<any[]>;
  getLocalCompanies: () => Promise<any[]>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(() => {
    const saved = localStorage.getItem('user-location');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par ce navigateur');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      // Reverse geocoding to get city/country info
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${locationData.latitude}&longitude=${locationData.longitude}&localityLanguage=fr`
        );
        const geoData = await response.json();
        
        locationData.city = geoData.city || geoData.locality;
        locationData.country = geoData.countryName;
        locationData.region = geoData.principalSubdivision;
      } catch (geoError) {
        console.warn('Failed to get location details:', geoError);
      }

      setLocation(locationData);
      localStorage.setItem('user-location', JSON.stringify(locationData));
      
      addNotification({
        type: 'success',
        title: 'Localisation activée',
        message: locationData.city 
          ? `Position détectée : ${locationData.city}, ${locationData.country}`
          : 'Position détectée avec succès'
      });

    } catch (err: any) {
      let errorMessage = 'Impossible d\'obtenir votre position';
      
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Permission de géolocalisation refusée';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Position non disponible';
          break;
        case err.TIMEOUT:
          errorMessage = 'Délai de géolocalisation dépassé';
          break;
      }
      
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Erreur de géolocalisation',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
    localStorage.removeItem('user-location');
    
    addNotification({
      type: 'info',
      title: 'Localisation supprimée',
      message: 'Vos données de localisation ont été effacées'
    });
  };

  // Mock functions for local data (in real app, these would call actual APIs)
  const getLocalJobs = async (): Promise<any[]> => {
    if (!location) return [];
    
    // Simulate API call with location-based jobs
    return [
      {
        id: '1',
        title: 'Développeur React Senior',
        company: 'TechCorp',
        location: location.city || 'Votre région',
        distance: '2.5 km',
        salary: '55k-70k €',
        type: 'CDI',
        remote: false
      },
      {
        id: '2',
        title: 'Product Manager',
        company: 'StartupXYZ',
        location: location.city || 'Votre région',
        distance: '5.1 km',
        salary: '60k-80k €',
        type: 'CDI',
        remote: true
      },
      {
        id: '3',
        title: 'Data Scientist',
        company: 'DataLab',
        location: location.city || 'Votre région',
        distance: '8.3 km',
        salary: '50k-65k €',
        type: 'CDI',
        remote: false
      }
    ];
  };

  const getLocalEvents = async (): Promise<any[]> => {
    if (!location) return [];
    
    return [
      {
        id: '1',
        title: 'Meetup React Paris',
        date: new Date('2024-02-15'),
        location: location.city || 'Votre région',
        distance: '1.2 km',
        attendees: 45,
        type: 'Networking'
      },
      {
        id: '2',
        title: 'Startup Weekend',
        date: new Date('2024-02-20'),
        location: location.city || 'Votre région',
        distance: '3.7 km',
        attendees: 120,
        type: 'Competition'
      },
      {
        id: '3',
        title: 'AI Conference 2024',
        date: new Date('2024-03-01'),
        location: location.city || 'Votre région',
        distance: '6.5 km',
        attendees: 300,
        type: 'Conference'
      }
    ];
  };

  const getLocalCompanies = async (): Promise<any[]> => {
    if (!location) return [];
    
    return [
      {
        id: '1',
        name: 'TechCorp',
        industry: 'Technology',
        size: '50-200',
        location: location.city || 'Votre région',
        distance: '2.1 km',
        openPositions: 8,
        rating: 4.2
      },
      {
        id: '2',
        name: 'StartupXYZ',
        industry: 'FinTech',
        size: '10-50',
        location: location.city || 'Votre région',
        distance: '4.8 km',
        openPositions: 3,
        rating: 4.7
      },
      {
        id: '3',
        name: 'DataLab',
        industry: 'Data Science',
        size: '20-100',
        location: location.city || 'Votre région',
        distance: '7.2 km',
        openPositions: 5,
        rating: 4.0
      }
    ];
  };

  return (
    <LocationContext.Provider value={{
      location,
      loading,
      error,
      requestLocation,
      clearLocation,
      getLocalJobs,
      getLocalEvents,
      getLocalCompanies
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}