import { useState } from 'react';
import { Globe } from './components/Globe';
import { Dashboard } from './components/Dashboard';
import type { ActiveRoute } from './types/Shipment';

export default function App() {
  const [activeRoute, setActiveRoute] = useState<ActiveRoute | null>(null);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <Globe activeRoute={activeRoute} />
      <Dashboard onAnalyze={setActiveRoute} activeRoute={activeRoute} />
    </div>
  );
}
