import { useState } from 'react';
import type { Route } from '../types/Shipment';
import shipments from '../data/shipments.json';

const routes = shipments as Route[];

function costColor(index: number): string {
  if (index < 90) return 'text-emerald-400';
  if (index <= 95) return 'text-amber-400';
  return 'text-red-400';
}

function dutyBadge(tier: string): string {
  if (tier === 'LOW') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (tier === 'MEDIUM') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
}

export function Dashboard() {
  const [selected, setSelected] = useState<Route | null>(null);

  return (
    <div className="absolute top-4 left-4 z-50 w-96 pointer-events-auto flex flex-col gap-3">
      {/* Header Panel */}
      <div className="rounded-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10 p-5 shadow-2xl">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h1 className="text-white text-lg font-bold tracking-wide">
            Global Trade Analyzer
          </h1>
        </div>
        <p className="text-white/40 text-xs ml-5">
          Logistics Digital Twin &mdash; Scenario Planning
        </p>
      </div>

      {/* Routes Panel */}
      <div className="rounded-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10 p-4 shadow-2xl">
        <p className="text-white/50 text-[10px] uppercase tracking-widest mb-3 font-medium">
          Active Corridors
        </p>

        <div className="flex flex-col gap-2">
          {routes.map((route) => {
            const isActive = selected?.id === route.id;
            return (
              <button
                key={route.id}
                onClick={() => setSelected(isActive ? null : route)}
                className={`
                  w-full text-left px-4 py-3 rounded-xl transition-all duration-200 border
                  ${isActive
                    ? 'bg-white/10 border-white/20 shadow-lg shadow-white/5'
                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/10'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-lg"
                      style={{
                        backgroundColor: route.color,
                        boxShadow: `0 0 8px ${route.color}60`,
                      }}
                    />
                    <span className="text-white text-sm font-medium">
                      {route.from}
                    </span>
                    <span className="text-white/20 text-xs font-mono">&rarr;</span>
                    <span className="text-white text-sm font-medium">
                      {route.to}
                    </span>
                  </div>
                  <span className="text-white/30 text-xs transition-transform duration-200"
                    style={{ transform: isActive ? 'rotate(90deg)' : 'none' }}
                  >
                    &#9654;
                  </span>
                </div>

                {/* Expanded Metrics */}
                {isActive && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {/* Cost Index */}
                      <div>
                        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
                          Cost Index
                        </p>
                        <p className={`text-xl font-bold tabular-nums ${costColor(route.metrics.costIndex)}`}>
                          {route.metrics.costIndex}
                        </p>
                        {route.metrics.costIndex < 100 && (
                          <p className="text-emerald-400/70 text-[10px] mt-0.5">
                            {100 - route.metrics.costIndex}% savings
                          </p>
                        )}
                      </div>

                      {/* Transit */}
                      <div>
                        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
                          Transit
                        </p>
                        <p className="text-white text-xl font-bold tabular-nums">
                          {route.metrics.transitDays}
                          <span className="text-white/40 text-xs ml-0.5">d</span>
                        </p>
                      </div>

                      {/* CO2 */}
                      <div>
                        <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">
                          CO2
                        </p>
                        <p className="text-white text-xl font-bold tabular-nums">
                          {route.metrics.co2Tons}
                          <span className="text-white/40 text-xs ml-0.5">T</span>
                        </p>
                      </div>
                    </div>

                    {/* Duty + Mode row */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${dutyBadge(route.metrics.dutyTier)}`}>
                        Duty: {route.metrics.dutyTier}
                      </span>
                      <span className="text-white/30 text-[10px]">
                        {route.metrics.transportMode}
                      </span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl bg-gray-900/40 backdrop-blur-md border border-white/5 px-4 py-2.5">
        <p className="text-white/25 text-[9px] leading-relaxed">
          Non-binding estimates for planning purposes only.
          Official verification required. Cost indices are relative
          to the Shanghai&ndash;LA baseline (100). Data is simulated.
        </p>
      </div>
    </div>
  );
}
