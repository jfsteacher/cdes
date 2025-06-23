import React, { useRef } from 'react';
import { Upload, FileText, Download, ExternalLink } from 'lucide-react';
import { generateSampleCSV } from '../utils/csvParser';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export default function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      onFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      onFileSelect(file);
    }
  };

  const downloadSample = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exemple-etablissements.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer ${
          isLoading ? 'opacity-50 pointer-events-none' : ''
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 bg-blue-50 rounded-full">
            <Upload className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isLoading ? 'Traitement en cours...' : 'Cliquez ou déposez votre fichier CSV'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Formats acceptés: .csv uniquement
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Format CSV supporté
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              L'application supporte maintenant le format des données des établissements avec les colonnes suivantes :
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>appellation_officielle</strong> : Nom de l'établissement</li>
              <li>• <strong>position</strong> : Coordonnées au format "latitude,longitude"</li>
              <li>• <strong>secteur</strong> : Type d'établissement (public/privé)</li>
              <li>• <strong>libelle_commune</strong> : Commune</li>
              <li>• <strong>libelle_departement</strong> : Département</li>
              <li>• <strong>ips</strong> : Indice de Position Sociale (optionnel)</li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              Le fichier doit utiliser le point-virgule (;) comme séparateur.
            </p>
            
            <button
              onClick={downloadSample}
              className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              <Download className="h-4 w-4 mr-1" />
              Télécharger un exemple de fichier CSV
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <ExternalLink className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              Fichiers de données officielles disponibles
            </h3>
            <p className="text-sm text-blue-800 mb-3">
              Vous pouvez télécharger des fichiers de données d'établissements scolaires officiels depuis le portail open data du Ministère de l'Éducation Nationale.
            </p>
            <a
              href="https://data.education.gouv.fr/pages/dataviz-list/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-700 hover:text-blue-600 font-medium underline"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Accéder aux données officielles sur data.education.gouv.fr
            </a>
            <p className="text-xs text-blue-700 mt-2">
              Recherchez les fichiers contenant les données d'établissements avec coordonnées géographiques et données IPS (Indice de Position Sociale).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}