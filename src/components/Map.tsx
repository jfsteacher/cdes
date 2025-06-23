import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { School, Position } from '../types';
import { formatDistance } from '../utils/distance';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const schoolIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const nearSchoolIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  schools: School[];
  userPosition: Position | null;
}

// Component to fit map bounds to markers
function MapBounds({ schools, userPosition }: MapProps) {
  const map = useMap();

  useEffect(() => {
    if (schools.length === 0 && !userPosition) return;

    const bounds = L.latLngBounds([]);
    
    // Add user position to bounds
    if (userPosition) {
      bounds.extend([userPosition.latitude, userPosition.longitude]);
    }
    
    // Add school positions to bounds
    schools.forEach(school => {
      bounds.extend([school.latitude, school.longitude]);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, schools, userPosition]);

  return null;
}

export default function Map({ schools, userPosition }: MapProps) {
  // Default center (France)
  const defaultCenter: [number, number] = [46.603354, 1.888334];
  const defaultZoom = 6;

  // Calculate center based on available data
  const getMapCenter = (): [number, number] => {
    if (userPosition) {
      return [userPosition.latitude, userPosition.longitude];
    }
    if (schools.length > 0) {
      const avgLat = schools.reduce((sum, school) => sum + school.latitude, 0) / schools.length;
      const avgLng = schools.reduce((sum, school) => sum + school.longitude, 0) / schools.length;
      return [avgLat, avgLng];
    }
    return defaultCenter;
  };

  const getMapZoom = (): number => {
    if (userPosition || schools.length > 0) {
      return 10;
    }
    return defaultZoom;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Carte des établissements</h3>
        <p className="text-sm text-gray-500 mt-1">
          {userPosition && (
            <span className="inline-flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              Position de référence
            </span>
          )}
          {userPosition && schools.length > 0 && <span className="mx-2">•</span>}
          {schools.length > 0 && (
            <span className="inline-flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Établissements ({schools.length})
            </span>
          )}
          {userPosition && schools.filter(s => s.distance && s.distance < 5).length > 0 && (
            <>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Proches (&lt; 5km)
              </span>
            </>
          )}
        </p>
      </div>
      
      <div className="h-96">
        <MapContainer
          center={getMapCenter()}
          zoom={getMapZoom()}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapBounds schools={schools} userPosition={userPosition} />
          
          {/* User position marker */}
          {userPosition && (
            <Marker
              position={[userPosition.latitude, userPosition.longitude]}
              icon={userIcon}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-red-600">Votre position</h4>
                  {userPosition.address && (
                    <p className="text-sm text-gray-600 mt-1">{userPosition.address}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {userPosition.latitude.toFixed(6)}, {userPosition.longitude.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* School markers */}
          {schools.map((school) => {
            const isNear = school.distance && school.distance < 5;
            const icon = isNear ? nearSchoolIcon : schoolIcon;
            
            return (
              <Marker
                key={school.id}
                position={[school.latitude, school.longitude]}
                icon={icon}
              >
                <Popup>
                  <div className="p-2 max-w-xs">
                    <h4 className="font-semibold text-gray-900 mb-2">{school.name}</h4>
                    
                    {school.type && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Type:</strong> {school.type}
                      </p>
                    )}
                    
                    {school.address && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Adresse:</strong> {school.address}
                      </p>
                    )}
                    
                    {school.distance !== undefined && (
                      <p className="text-sm font-medium text-blue-600 mb-1">
                        <strong>Distance:</strong> {formatDistance(school.distance)}
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {school.latitude.toFixed(6)}, {school.longitude.toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      
      {schools.length === 0 && !userPosition && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              Chargez des données et définissez une position pour voir la carte
            </p>
          </div>
        </div>
      )}
    </div>
  );
}