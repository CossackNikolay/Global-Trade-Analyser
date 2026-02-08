export interface Port {
  name: string;
  country: string;
  lon: number;
  lat: number;
}

export interface Coordinate {
  lon: number;
  lat: number;
}

export interface RouteMetrics {
  distanceKm: number;
  costIndex: number;
  transitDays: number;
  co2Tons: number;
  dutyTier: 'LOW' | 'MEDIUM' | 'HIGH';
  fuelCostIndex: number;
  portFees: number;
}

export interface ActiveRoute {
  id: string;
  product: string;
  origin: Port;
  destination: Port;
  path: Coordinate[];
  metrics: RouteMetrics;
  color: string;
}
