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
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [userPosition, setUserPosition] = useState<Position | null>(null);
  const [sectorFilter, setSectorFilter] = useState<'all' | 'public' | 'private'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'college' | 'lycee'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load lille.csv data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('./src/data/lille.csv');
        if (!response.ok) {
          throw new Error('Impossible de charger le fichier lille.csv');
        }
        
        const text = await response.text();
        const csvRows = parseCSV(text);
        
        if (csvRows.length === 0) {
          throw new Error('Le fichier lille.csv ne contient aucune donnée valide');
        }
        
        const parsedSchools = csvRowsToSchools(csvRows);
        
        if (parsedSchools.length === 0) {
          throw new Error('Aucun établissement valide trouvé dans le fichier lille.csv');
        }
        
        console.log(`Chargé ${parsedSchools.length} établissements depuis lille.csv`);
          applyFilters(parsedSchools, sectorFilter, levelFilter);
        applyFilters(parsedSchools, sectorFilter);
      } catch (err) {
        console.error('Erreur lors du chargement des données initiales:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données initiales');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
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
      } else {
        applyFilters(parsedSchools, sectorFilter, levelFilter);
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
      } else {
        setFilteredSchools(schools);
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
    
    const updatedSchools = schoolsWithDistances;
    setSchools(updatedSchools);
    applyFilters(updatedSchools, sectorFilter, levelFilter);
  };

  const applyFilters = (schoolList: School[], sector: 'all' | 'public' | 'private', level: 'all' | 'college' | 'lycee') => {
    let filtered = schoolList;
    
    // Apply level filter first
    if (level !== 'all') {
      filtered = filtered.filter(school => {
        if (!school.name) return false;
        const schoolName = school.name.toLowerCase();
        if (level === 'college') {
          return schoolName.includes('collège') || schoolName.includes('college');
        } else if (level === 'lycee') {
          return schoolName.includes('lycée') || schoolName.includes('lycee');
        }
        return true;
      });
    }
    
    // Apply sector filter second
    if (sector !== 'all') {
      filtered = filtered.filter(school => {
        if (!school.type) return false;
        const schoolType = school.type.toLowerCase();
        if (sector === 'public') {
          return schoolType.includes('public');
        } else if (sector === 'private') {
          return schoolType.includes('privé') || schoolType.includes('private');
        }
        return true;
      });
    }
    
    setFilteredSchools(filtered);
  };

  const handleSectorFilterChange = (newFilter: 'all' | 'public' | 'private') => {
    setSectorFilter(newFilter);
    applyFilters(schools, newFilter, levelFilter);
  };

  const handleLevelFilterChange = (newFilter: 'all' | 'college' | 'lycee') => {
    setLevelFilter(newFilter);
    applyFilters(schools, sectorFilter, newFilter);
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
                Calculateur de Distance entre Établissements Scolaires
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
        {filteredSchools.length > 0 && !userPosition && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <FileText className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Données chargées</h3>
                <p className="text-sm text-blue-700 mt-1">
                  {filteredSchools.length} établissements ont été chargés. Définissez votre position pour calculer les distances.
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
                <dd className="text-2xl font-bold text-gray-900">{filteredSchools.length}</dd>
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
                  {filteredSchools.filter(s => s.distance !== undefined).length}
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
                Filtres
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau d'établissement
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="level"
                        value="all"
                        checked={levelFilter === 'all'}
                        onChange={(e) => handleLevelFilterChange(e.target.value as 'all')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Tous les niveaux</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="level"
                        value="college"
                        checked={levelFilter === 'college'}
                        onChange={(e) => handleLevelFilterChange(e.target.value as 'college')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Collèges</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="level"
                        value="lycee"
                        checked={levelFilter === 'lycee'}
                        onChange={(e) => handleLevelFilterChange(e.target.value as 'lycee')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Lycées</span>
                    </label>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'établissement
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sector"
                        value="all"
                        checked={sectorFilter === 'all'}
                        onChange={(e) => handleSectorFilterChange(e.target.value as 'all')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Tous les établissements</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sector"
                        value="public"
                        checked={sectorFilter === 'public'}
                        onChange={(e) => handleSectorFilterChange(e.target.value as 'public')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Établissements publics</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="sector"
                        value="private"
                        checked={sectorFilter === 'private'}
                        onChange={(e) => handleSectorFilterChange(e.target.value as 'private')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Établissements privés</span>
                    </label>
                  </div>
                </div>
              </div>
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
            <Map schools={filteredSchools} userPosition={userPosition} />
            
            {/* Results List */}
            <SchoolList schools={filteredSchools} userPosition={userPosition} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center text-sm text-gray-500">
              <GraduationCap className="h-4 w-4 mr-2" />
              Calculateur de Distance entre Établissements Scolaires - Trouvez les établissements les plus proches
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