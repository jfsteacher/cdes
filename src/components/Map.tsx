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

const collegeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const lyceeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const nearCollegeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const nearLyceeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper function to determine school type
function getSchoolType(schoolName: string): 'college' | 'lycee' | 'other' {
  if (!schoolName) return 'other';
  const name = schoolName.toLowerCase();
  if (name.includes('collège') || name.includes('college')) {
    return 'college';
  } else if (name.includes('lycée') || name.includes('lycee')) {
    return 'lycee';
  }
  return 'other';
}

// Helper function to get appropriate icon
function getSchoolIcon(school: School): L.Icon {
  const schoolType = getSchoolType(school.name);
  const isNear = school.distance && school.distance < 5;
  
  if (schoolType === 'college') {
    return isNear ? nearCollegeIcon : collegeIcon;
  } else if (schoolType === 'lycee') {
    return isNear ? nearLyceeIcon : lyceeIcon;
  } else {
    return isNear ? nearSchoolIcon : schoolIcon;
  }
}
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
              <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
              Collèges
            </span>
          )}
          {schools.length > 0 && (
            <>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center">
                <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                Lycées
              </span>
            </>
          )}
          {schools.length > 0 && (
            <>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                Autres établissements
            </span>
            </>
          )}
          {userPosition && schools.filter(s => s.distance && s.distance < 5 && getSchoolType(s.name) === 'college').length > 0 && (
            <>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                Collèges proches
              </span>
            </>
          )}
          {userPosition && schools.filter(s => s.distance && s.distance < 5 && getSchoolType(s.name) === 'lycee').length > 0 && (
            <>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center">
                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                Lycées proches
              </span>
            </>
          )}
          {userPosition && schools.filter(s => s.distance && s.distance < 5 && getSchoolType(s.name) === 'other').length > 0 && (
            <>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                Autres proches
              </span>
            </>
          )}
        </p>
      </div>
      
      <div className="h-96 relative">
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
            const icon = getSchoolIcon(school);
            
            return (
              <Marker
                key={school.id}
                position={[school.latitude, school.longitude]}
                icon={icon}
              >
                <Popup>
                  <div className="p-2 max-w-xs">
                    <h4 className="font-semibold text-gray-900 mb-2">{school.name}</h4>
                    
                    {school.uai && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>UAI:</strong> <span className="font-mono text-blue-600">{school.uai}</span>
                      </p>
                    )}
                    
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
    </div>
  );
}