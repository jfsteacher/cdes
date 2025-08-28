import { School, CSVRow } from '../types';

/**
 * Parse CSV text into array of objects
 */
export function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(';').map(h => h.trim().replace(/['"]/g, ''));
  const rows: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], ';');
    if (values.length === headers.length) {
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index].trim().replace(/['"]/g, '');
      });
      rows.push(row);
    }
  }
  
  return rows;
}

/**
 * Parse a single CSV line handling quoted values with custom separator
 */
function parseCSVLine(line: string, separator: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

/**
 * Convert CSV rows to School objects
 */
export function csvRowsToSchools(rows: CSVRow[]): School[] {
  return rows
    .map((row, index) => {
      // For the college data format, we need to handle the specific columns
      const nameKey = 'appellation_officielle';
      const positionKey = 'position';
      const uaiKey = 'uai';
      const sectorKey = 'secteur';
      const communeKey = 'libelle_commune';
      const departmentKey = 'libelle_departement';
      const ipsKey = 'ips';
      
      // Check if required columns exist
      if (!row[nameKey] || !row[positionKey]) {
        // Fallback to generic column names
        const genericNameKeys = ['name', 'nom', 'Name', 'Nom', 'NAME', 'NOM', 'etablissement', 'ecole', 'school'];
        const genericLatKeys = ['latitude', 'lat', 'Latitude', 'Lat', 'LATITUDE', 'LAT'];
        const genericLonKeys = ['longitude', 'lon', 'lng', 'Longitude', 'Lon', 'Lng', 'LONGITUDE', 'LON', 'LNG'];
        const genericAddressKeys = ['address', 'adresse', 'Address', 'Adresse', 'ADDRESS', 'ADRESSE'];
        const genericTypeKeys = ['type', 'Type', 'TYPE', 'category', 'Category', 'CATEGORY'];
        
        const latKey = genericLatKeys.find(key => key in row);
        const lonKey = genericLonKeys.find(key => key in row);
        const nameKeyGeneric = genericNameKeys.find(key => key in row);
        const addressKey = genericAddressKeys.find(key => key in row);
        const typeKey = genericTypeKeys.find(key => key in row);
        
        if (!latKey || !lonKey || !nameKeyGeneric) {
          return null;
        }
        
        const latitude = parseFloat(row[latKey]);
        const longitude = parseFloat(row[lonKey]);
        
        if (isNaN(latitude) || isNaN(longitude)) {
          return null;
        }
        
        return {
          id: index,
         uai: row[uaiKey],
         uai: row[uaiKey] || (addressKey ? row[addressKey] : undefined),
          uai: addressKey ? row[addressKey] : undefined,
          uai: row[uaiKey],
          latitude,
          longitude,
          address: addressKey ? row[addressKey] : undefined,
          type: typeKey ? row[typeKey] : undefined,
        };
      }
      
      // Parse position field (format: "latitude,longitude")
      const positionStr = row[positionKey];
      const positionParts = positionStr.split(',');
      
      if (positionParts.length !== 2) {
        return null;
      }
      
      const latitude = parseFloat(positionParts[0].trim());
      const longitude = parseFloat(positionParts[1].trim());
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return null;
      }
      
      // Build address from available location data
      const addressParts = [];
      if (row[communeKey]) addressParts.push(row[communeKey]);
      if (row[departmentKey]) addressParts.push(row[departmentKey]);
      const address = addressParts.length > 0 ? addressParts.join(', ') : undefined;
      
      // Build type from sector and IPS if available
      let type = row[sectorKey] || 'Établissement';
      if (row[ipsKey]) {
        type += ` (IPS: ${row[ipsKey]})`;
      }
      
      return {
        id: index,
        name: row[nameKey],
        latitude,
        longitude,
        address,
        type,
      };
    })
    .filter((school): school is School => school !== null);
}

/**
 * Generate sample CSV content for demonstration
 */
export function generateSampleCSV(): string {
  return `rentree_scolaire;uai;secteur;ips;position;appellation_officielle;libelle_academie;code_departement;libelle_departement;code_commune;libelle_commune
2023-2024;0590248Z;public;91.0;50.3498386310885,3.2842295962456927;Établissement Louis Pasteur;Lille;59;Nord;59574;Somain
2023-2024;0593131H;privé sous contrat;103.6;50.62928989778109,3.107342498302463;Établissement privé Saint Joseph;Lille;59;Nord;59350;Lille
2023-2024;0594297A;public;80.3;50.412707862648475,3.0535806066000877;Établissement Victor Hugo;Lille;59;Nord;59028;Auby
2023-2024;0594298B;public;99.9;50.354996614883795,3.0620302418370793;Établissement André Malraux;Lille;59;Nord;59329;Lambres-lez-Douai
2023-2024;0594304H;public;89.1;50.45062444729204,3.432100353409098;Établissement Marie Curie;Lille;59;Nord;59526;Saint-Amand-les-Eaux
2023-2024;0620039F;public;88.4;50.08837894809274,2.9812501868009518;Établissement Jacques-Yves Cousteau;Lille;62;Pas-de-Calais;62117;Bertincourt`;
}