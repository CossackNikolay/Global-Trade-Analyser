import { useState } from 'react';
import type { Route } from '../types/Shipment';
import shipments from '../data/shipments.json';

const routes = shipments as Route[];

const COST_COLORS = ['text-green-400', 'text-yellow-400', 'text-red-400'];

export function Dashboard() {
  const [selected, setSelected] = useState<Route | null>(null);

  return (
    <div className="absolute top-4 left-4 z-50 w-80 pointer-events-auto">
      {/* Header */}
      <div className="rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 p-5 shadow-2xl">
        <h1 className="text-white text-lg font-bold tracking-wide mb-1">
          Trade Routes
        </h1>
        <p className="text-white/50 text-xs mb-4">
          Global shipping corridor monitor
        </p>

        {/* Route buttons */}
        <div className="flex flex-col gap-2">
          {routes.map((route, idx) => {
            const isActive = selected?.id === route.id;
            return (
              <button
                key={route.id}
                onClick={() => setSelected(isActive ? null : route)}
                className={`
                  w-full text-left px-4 py-3 rounded-xl transition-all duration-200
                  border
                  ${isActive
                    ? 'bg-white/15 border-white/30 shadow-lg'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: route.color }}
                    />
                    <span className="text-white text-sm font-medium">
                      {route.from}
                    </span>
                    <span className="text-white/30 text-xs">→</span>
                    <span className="text-white text-sm font-medium">
                      {route.to}
                    </span>
                  </div>
                  <span className="text-white/30 text-xs">
                    {isActive ? '▾' : '▸'}
                  </span>
                </div>

                {/* Expanded metrics */}
                {isActive && (
                  <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">
                        Cost
                      </p>
                      <p className={`text-sm font-semibold ${COST_COLORS[idx] ?? 'text-white'}`}>
                        {route.metrics.value}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">
                        Volume
                      </p>
                      <p className="text-white text-sm font-semibold">
                        {route.metrics.volume}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">
                        Mode
                      </p>
                      <p className="text-white text-sm font-semibold">
                        {route.metrics.transportMode}
                      </p>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
