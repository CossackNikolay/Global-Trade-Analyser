export interface Coordinate {
  lon: number;
  lat: number;
}

export interface Metrics {
  volume: string;
  value: string;
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
