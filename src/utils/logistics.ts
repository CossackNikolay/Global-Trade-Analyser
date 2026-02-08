import type { Coordinate, RouteMetrics } from '../types/Shipment';

const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_KM = 6371;

/**
 * Haversine distance between two points in km.
 */
function haversine(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) *
    Math.cos(lat2 * DEG_TO_RAD) *
    Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Generate a great-circle path between two points.
 * Returns an array of interpolated coordinates.
 */
export function generatePath(
  startLat: number, startLon: number,
  endLat: number, endLon: number,
  segments = 64,
): Coordinate[] {
  const lat1 = startLat * DEG_TO_RAD;
  const lon1 = startLon * DEG_TO_RAD;
  const lat2 = endLat * DEG_TO_RAD;
  const lon2 = endLon * DEG_TO_RAD;

  const d = haversine(startLat, startLon, endLat, endLon) / EARTH_RADIUS_KM;
  const sinD = Math.sin(d);

  const path: Coordinate[] = [];

  for (let i = 0; i <= segments; i++) {
    const f = i / segments;
    const a = Math.sin((1 - f) * d) / sinD;
    const b = Math.sin(f * d) / sinD;

    const x = a * Math.cos(lat1) * Math.cos(lon1) + b * Math.cos(lat2) * Math.cos(lon2);
    const y = a * Math.cos(lat1) * Math.sin(lon1) + b * Math.cos(lat2) * Math.sin(lon2);
    const z = a * Math.sin(lat1) + b * Math.sin(lat2);

    const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) / DEG_TO_RAD;
    const lon = Math.atan2(y, x) / DEG_TO_RAD;

    path.push({ lon, lat });
  }

  return path;
}

/**
 * Product-type multipliers for cost simulation.
 */
const PRODUCT_MULTIPLIERS: Record<string, number> = {
  electronics: 1.35,
  textiles: 0.85,
  machinery: 1.20,
  chemicals: 1.45,
  food: 0.95,
  automotive: 1.30,
  pharmaceuticals: 1.60,
};

function getProductMultiplier(product: string): number {
  const key = product.toLowerCase().trim();
  for (const [k, v] of Object.entries(PRODUCT_MULTIPLIERS)) {
    if (key.includes(k)) return v;
  }
  return 1.0;
}

/**
 * Simulate realistic-looking route metrics.
 */
export function simulateMetrics(
  startLat: number, startLon: number,
  endLat: number, endLon: number,
  product: string,
): RouteMetrics {
  const distanceKm = Math.round(haversine(startLat, startLon, endLat, endLon));
  const multiplier = getProductMultiplier(product);

  // Base cost index: normalize to Shanghai-LA baseline (~10,500 km = 100)
  const baseCost = (distanceKm / 10500) * 100;
  const costIndex = Math.round(baseCost * multiplier);

  // Transit: ~800 km/day average container speed
  const transitDays = Math.round(distanceKm / 800);

  // CO2: ~0.012 tons per TEU per 100km
  const co2Tons = Math.round((distanceKm * 0.00012) * 100) / 100;

  // Duty tier based on cost index
  let dutyTier: 'LOW' | 'MEDIUM' | 'HIGH';
  if (costIndex < 80) dutyTier = 'LOW';
  else if (costIndex < 110) dutyTier = 'MEDIUM';
  else dutyTier = 'HIGH';

  // Fuel cost index: proportional to distance with product modifier
  const fuelCostIndex = Math.round((distanceKm / 105) * (multiplier * 0.8));

  // Port fees: randomized but deterministic from distance
  const portFees = Math.round(((distanceKm % 1000) / 1000) * 40 + 25);

  return {
    distanceKm,
    costIndex,
    transitDays: Math.max(transitDays, 1),
    co2Tons,
    dutyTier,
    fuelCostIndex,
    portFees,
  };
}
