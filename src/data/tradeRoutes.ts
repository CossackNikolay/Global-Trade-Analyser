import { Cartesian3 } from 'cesium';

export const tradeRoutes = [
  {
    id: 'demo-route-1',
    name: 'Demo Trade Route',
    positions: Cartesian3.fromDegreesArray([
      72.8777, 19.0760,   // Mumbai
      55.2708, 25.2048,   // Dubai
      31.2357, 30.0444,   // Cairo
      3.3792, 6.5244      // Lagos
    ])
  }
];
