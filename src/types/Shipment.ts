export interface Coordinate {
  lon: number;
  lat: number;
}

export interface Metrics {
  costIndex: number;
  transitDays: number;
  co2Tons: number;
  dutyTier: 'LOW' | 'MEDIUM' | 'HIGH';
  transportMode: string;
}

export interface Route {
  id: string;
  from: string;
  to: string;
  coordinates: Coordinate[];
  color: string;
  metrics: Metrics;
}
