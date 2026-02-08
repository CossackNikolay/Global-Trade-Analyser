import { useState } from 'react';
import type { ActiveRoute, Port } from '../types/Shipment';
import { PORTS } from '../data/ports';
import { generatePath, simulateMetrics } from '../utils/logistics';

const ROUTE_COLORS = ['#FF4D4D', '#00E5A0', '#A78BFA', '#F59E0B', '#06B6D4'];
let routeCounter = 0;

function costColor(index: number): string {
  if (index < 80) return 'text-emerald-400';
  if (index <= 110) return 'text-amber-400';
  return 'text-red-400';
}

function dutyBadge(tier: string): string {
  if (tier === 'LOW') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (tier === 'MEDIUM') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

interface DashboardProps {
  onAnalyze: (route: ActiveRoute) => void;
  activeRoute: ActiveRoute | null;
}

export function Dashboard({ onAnalyze, activeRoute }: DashboardProps) {
  const [product, setProduct] = useState('Electronics');
  const [originIdx, setOriginIdx] = useState(0);
  const [destIdx, setDestIdx] = useState(6);

  function handleAnalyze() {
    const origin: Port = PORTS[originIdx];
    const dest: Port = PORTS[destIdx];

    if (origin.name === dest.name) return;

    const path = generatePath(origin.lat, origin.lon, dest.lat, dest.lon);
    const metrics = simulateMetrics(origin.lat, origin.lon, dest.lat, dest.lon, product);

    const color = ROUTE_COLORS[routeCounter % ROUTE_COLORS.length];
    routeCounter++;

    const route: ActiveRoute = {
      id: `route-${Date.now()}`,
      product,
      origin,
      destination: dest,
      path,
      metrics,
      color,
    };

    onAnalyze(route);
  }

  return (
    <div className="absolute top-4 left-4 z-50 w-96 pointer-events-auto flex flex-col gap-3 max-h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Header */}
      <div className="rounded-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10 p-5 shadow-2xl">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h1 className="text-white text-lg font-bold tracking-wide">
            Global Trade Analyzer
          </h1>
        </div>
        <p className="text-white/40 text-xs ml-5">
          Interactive Route Intelligence
        </p>
      </div>

      {/* Input Form */}
      <div className="rounded-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10 p-4 shadow-2xl">
        <p className="text-white/50 text-[10px] uppercase tracking-widest mb-3 font-medium">
          Route Configuration
        </p>

        {/* Product */}
        <div className="mb-3">
          <label className="text-white/40 text-[10px] uppercase tracking-wider block mb-1">
            Product
          </label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-white text-sm
                       placeholder-white/20 focus:outline-none focus:border-white/30 focus:bg-white/[0.08]
                       transition-colors"
            placeholder="e.g. Electronics, Textiles, Machinery..."
          />
        </div>

        {/* Origin */}
        <div className="mb-3">
          <label className="text-white/40 text-[10px] uppercase tracking-wider block mb-1">
            Origin Port
          </label>
          <select
            value={originIdx}
            onChange={(e) => setOriginIdx(Number(e.target.value))}
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-white text-sm
                       focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
          >
            {PORTS.map((port, idx) => (
              <option key={port.name} value={idx} className="bg-gray-900 text-white">
                {port.name}, {port.country}
              </option>
            ))}
          </select>
        </div>

        {/* Destination */}
        <div className="mb-4">
          <label className="text-white/40 text-[10px] uppercase tracking-wider block mb-1">
            Destination Port
          </label>
          <select
            value={destIdx}
            onChange={(e) => setDestIdx(Number(e.target.value))}
            className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-white text-sm
                       focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
          >
            {PORTS.map((port, idx) => (
              <option key={port.name} value={idx} className="bg-gray-900 text-white">
                {port.name}, {port.country}
              </option>
            ))}
          </select>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={originIdx === destIdx}
          className="w-full py-2.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200
                     bg-emerald-500/20 text-emerald-400 border border-emerald-500/30
                     hover:bg-emerald-500/30 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-emerald-500/20"
        >
          ANALYZE ROUTE
        </button>
      </div>

      {/* Results Panel */}
      {activeRoute && (
        <div className="rounded-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10 p-4 shadow-2xl">
          <div className="flex items-center gap-2.5 mb-3">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: activeRoute.color,
                boxShadow: `0 0 8px ${activeRoute.color}60`,
              }}
            />
            <p className="text-white text-sm font-medium">
              {activeRoute.origin.name}
              <span className="text-white/20 mx-1.5 font-mono">&rarr;</span>
              {activeRoute.destination.name}
            </p>
          </div>

          <p className="text-white/30 text-[10px] mb-3">
            Product: {activeRoute.product} &middot; {activeRoute.metrics.distanceKm.toLocaleString()} km
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Cost Index</p>
              <p className={`text-xl font-bold tabular-nums ${costColor(activeRoute.metrics.costIndex)}`}>
                {activeRoute.metrics.costIndex}
              </p>
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Transit</p>
              <p className="text-white text-xl font-bold tabular-nums">
                {activeRoute.metrics.transitDays}
                <span className="text-white/40 text-xs ml-0.5">d</span>
              </p>
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">CO2</p>
              <p className="text-white text-xl font-bold tabular-nums">
                {activeRoute.metrics.co2Tons}
                <span className="text-white/40 text-xs ml-0.5">T</span>
              </p>
            </div>
          </div>

          {/* Secondary metrics */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Fuel Index</p>
              <p className="text-white text-sm font-semibold tabular-nums">
                {activeRoute.metrics.fuelCostIndex}
              </p>
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Port Fees</p>
              <p className="text-white text-sm font-semibold tabular-nums">
                {activeRoute.metrics.portFees}
                <span className="text-white/40 text-xs ml-0.5">idx</span>
              </p>
            </div>
          </div>

          {/* Duty tier */}
          <div className="flex items-center justify-between">
            <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${dutyBadge(activeRoute.metrics.dutyTier)}`}>
              Duty: {activeRoute.metrics.dutyTier}
            </span>
            <span className="text-white/30 text-[10px]">
              Container Ship
            </span>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-xl bg-gray-900/40 backdrop-blur-md border border-white/5 px-4 py-2.5">
        <p className="text-white/25 text-[9px] leading-relaxed">
          Non-binding estimates for planning purposes only.
          Official verification required. Cost indices are relative
          benchmarks. Data is simulated.
        </p>
      </div>
    </div>
  );
}
