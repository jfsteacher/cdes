export interface School {
  id: number;
  name: string;
  uai?: string;
  address?: string;
  latitude: number;
  longitude: number;
  type?: string;
  distance?: number;
}

export interface Position {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface CSVRow {
  [key: string]: string;
}