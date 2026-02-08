import { Globe } from './components/Globe';
import { Dashboard } from './components/Dashboard';

export default function App() {
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden">
      <Globe />
      <Dashboard />
    </div>
  );
}
