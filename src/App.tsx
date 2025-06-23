import React, { useState, useEffect } from 'react';
import { School, Position } from './types';
import { calculateDistance } from './utils/distance';
import { geocodeAddress } from './utils/geocoding';
import { parseCSV, csvRowsToSchools } from './utils/csvParser';
import FileUpload from './components/FileUpload';
import PositionInput from './components/PositionInput';
import SchoolList from './components/SchoolList';
import Map from './components/Map';
import { GraduationCap, MapPin, Calculator, AlertCircle, FileText, ExternalLink } from 'lucide-react';

function App() {
  const [schools, setSchools] = useState<School[]>([]);
  const [userPosition, setUserPosition] = useState<Position | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the sample data on component mount
  useEffect(() => {
    const loadSampleData = async () => {
      try {
        const response = await fetch('/src/data/dataviz-ips-colleges.csv');
        const text = await response.text();
        const csvRows = parseCSV(text);
        const parsedSchools = csvRowsToSchools(csvRows);
        setSchools(parsedSchools);
      } catch (err) {
        console.log('Sample data not loaded, waiting for user upload');
      }
    };
    
    loadSampleData();
  }, []);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const text = await file.text();
      const csvRows = parseCSV(text);
      
      if (csvRows.length === 0) {
        throw new Error('Le fichier CSV ne contient aucune donnée valide');
      }
      
      const parsedSchools = csvRowsToSchools(csvRows);
      
      if (parsedSchools.length === 0) {
        throw new Error('Aucun établissement valide trouvé dans le fichier. Vérifiez le format des données.');
      }
      
      setSchools(parsedSchools);
      
      // Recalculate distances if user position is set
      if (userPosition) {
        calculateDistances(parsedSchools, userPosition);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du traitement du fichier');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePositionSet = async (position: Position) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let finalPosition = position;
      
      // If address is provided, geocode it
      if (position.address && position.latitude === 0 && position.longitude === 0) {
        const geocoded = await geocodeAddress(position.address);
        if (!geocoded) {
          throw new Error('Impossible de géolocaliser cette adresse');
        }
        finalPosition = {
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          address: geocoded.displayName,
        };
      }
      
      setUserPosition(finalPosition);
      
      // Calculate distances if schools are loaded
      if (schools.length > 0) {
        calculateDistances(schools, finalPosition);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la géolocalisation');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistances = (schoolList: School[], position: Position) => {
    const schoolsWithDistances = schoolList.map(school => ({
      ...school,
      distance: calculateDistance(
        position.latitude,
        position.longitude,
        school.latitude,
        school.longitude
      ),
    }));
    
    // Sort by distance
    schoolsWithDistances.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    
    setSchools(schoolsWithDistances);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Calculateur de Distance d'Établissements Scolaires
              </h1>
              <p className="text-gray-600">
                Trouvez les établissements scolaires les plus proches de votre position
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Banner */}
        {schools.length > 0 && !userPosition && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Données chargées</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {schools.length} établissements ont été chargés. Définissez votre position pour calculer les distances.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500">Établissements</dt>
                <dd className="text-2xl font-bold text-gray-900">{schools.length}</dd>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500">Position définie</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {userPosition ? 'Oui' : 'Non'}
                </dd>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calculator className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <dt className="text-sm font-medium text-gray-500">Distances calculées</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {schools.filter(s => s.distance !== undefined).length}
                </dd>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <PositionInput onPositionSet={handlePositionSet} isLoading={isLoading} />
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Fichier des établissements
              </h2>
              <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
            </div>
          </div>

          {/* Right Column - Results and Map */}
          <div className="lg:col-span-2 space-y-8">
            {/* Map */}
            <Map schools={schools} userPosition={userPosition} />
            
            {/* Results List */}
            <SchoolList schools={schools} userPosition={userPosition} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center text-sm text-gray-500">
              <GraduationCap className="h-4 w-4 mr-2" />
              Calculateur de Distance d'Établissements Scolaires - Trouvez les établissements les plus proches
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <span>Contenu partiellement généré par une IA et vérifié par un agent</span>
              </div>
              
              <div className="flex items-center">
                <a 
                  href="https://www.linkedin.com/in/jean-fabrice-stachowiak-17ab50178/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-500 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Jean-Fabrice Stachowiak
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;