import React from 'react';
import { School } from '../types';
import { MapPin, School as SchoolIcon, Download } from 'lucide-react';
import { formatDistance, getDistanceColor, getDistanceBadgeColor } from '../utils/distance';

interface SchoolListProps {
  schools: School[];
  userPosition: { latitude: number; longitude: number; address?: string } | null;
}

export default function SchoolList({ schools, userPosition }: SchoolListProps) {
  const exportResults = () => {
    if (!schools.length) return;
    
    const csvContent = [
      'Rang,Nom,UAI,Distance (km),Latitude,Longitude,Adresse,Type',
      ...schools.map((school, index) => 
        `${index + 1},"${school.name}","${school.uai || ''}",${school.distance || 0},${school.latitude},${school.longitude},"${school.address || ''}","${school.type || ''}"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'etablissements-classes-par-distance.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!schools.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <SchoolIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun établissement trouvé</h3>
        <p className="text-gray-500">
          Uploadez un fichier CSV et définissez une position pour voir les résultats.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Établissements classés par distance
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {schools.length} établissement{schools.length > 1 ? 's' : ''} trouvé{schools.length > 1 ? 's' : ''}
            {userPosition?.address && ` depuis ${userPosition.address}`}
          </p>
        </div>
        
        <button
          onClick={exportResults}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </button>
      </div>

      <div className="space-y-3">
        {schools.map((school, index) => (
          <div
            key={school.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {school.name}
                  </h3>
                  {school.type && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {school.type}
                    </span>
                  )}
                </div>
                
                {school.address && (
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {school.address}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-500">
                  <span>Coordonnées: {school.latitude.toFixed(6)}, {school.longitude.toFixed(6)}</span>
                </div>
                
                {school.uai && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="font-medium text-gray-600">UAI:</span>
                    <span className="ml-1 font-mono text-blue-600">{school.uai}</span>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className={`text-2xl font-bold mb-1 ${getDistanceColor(school.distance || 0)}`}>
                  {formatDistance(school.distance || 0)}
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDistanceBadgeColor(school.distance || 0)}`}>
                  {school.distance && school.distance < 1 ? 'Très proche' :
                   school.distance && school.distance < 5 ? 'Proche' :
                   school.distance && school.distance < 10 ? 'Moyennement éloigné' : 'Éloigné'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {schools.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Statistiques</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Plus proche</div>
              <div className="font-semibold text-green-600">
                {formatDistance(Math.min(...schools.map(s => s.distance || 0)))}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Plus éloigné</div>
              <div className="font-semibold text-red-600">
                {formatDistance(Math.max(...schools.map(s => s.distance || 0)))}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Distance moyenne</div>
              <div className="font-semibold text-blue-600">
                {formatDistance(schools.reduce((sum, s) => sum + (s.distance || 0), 0) / schools.length)}
              </div>
            </div>
            <div>
              <div className="text-gray-500">{'< 5km'}</div>
              <div className="font-semibold text-purple-600">
                {schools.filter(s => (s.distance || 0) < 5).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}