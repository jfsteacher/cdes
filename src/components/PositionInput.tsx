import React, { useState } from 'react';
import { MapPin, Navigation, Loader } from 'lucide-react';
import { Position } from '../types';

interface PositionInputProps {
  onPositionSet: (position: Position) => void;
  isLoading: boolean;
}

export default function PositionInput({ onPositionSet, isLoading }: PositionInputProps) {
  const [inputType, setInputType] = useState<'address' | 'coordinates'>('address');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isGeolocating, setIsGeolocating] = useState(false);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onPositionSet({ latitude: 0, longitude: 0, address: address.trim() });
    }
  };

  const handleCoordinatesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      onPositionSet({ latitude: lat, longitude: lon });
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onPositionSet({ latitude, longitude, address: 'Position actuelle' });
        setIsGeolocating(false);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        alert('Impossible d\'obtenir votre position actuelle');
        setIsGeolocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Position de référence</h2>
        
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setInputType('address')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              inputType === 'address'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Adresse
          </button>
          <button
            onClick={() => setInputType('coordinates')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              inputType === 'coordinates'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Coordonnées
          </button>
        </div>
      </div>

      {inputType === 'address' ? (
        <form onSubmit={handleAddressSubmit} className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: 123 Rue de la République, Paris"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!address.trim() || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader className="h-5 w-5 animate-spin mr-2" />
                Géolocalisation...
              </div>
            ) : (
              'Définir cette position'
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleCoordinatesSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                Latitude
              </label>
              <input
                type="number"
                id="latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Ex: 48.8566"
                step="any"
                min="-90"
                max="90"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                Longitude
              </label>
              <input
                type="number"
                id="longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Ex: 2.3522"
                step="any"
                min="-180"
                max="180"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!latitude || !longitude || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Définir cette position
          </button>
        </form>
      )}

      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={getCurrentLocation}
          disabled={isGeolocating || isLoading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
        >
          {isGeolocating ? (
            <>
              <Loader className="h-5 w-5 animate-spin mr-2" />
              Localisation...
            </>
          ) : (
            <>
              <Navigation className="h-5 w-5 mr-2" />
              Utiliser ma position actuelle
            </>
          )}
        </button>
      </div>
    </div>
  );
}