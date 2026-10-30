import { Home, ArrowLeftRight, History, Users, Settings } from 'lucide-react';
import type { Tab } from '@/App';

const icons = {
  home: Home,
  exchange: ArrowLeftRight,
  history: History,
  customers: Users,
  settings: Settings,
} as const;

const labels: Record<Tab, string> = {
  home: 'Home',
  exchange: 'Exchange',
  history: 'History',
  customers: 'Customers',
  settings: 'Settings',
};

const tabs: Tab[] = ['home', 'exchange', 'history', 'customers', 'settings'];

export default function BottomNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-gray-200 shadow-[0_-1px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto grid grid-cols-5">
        {tabs.map((id) => {
          const Icon = icons[id];
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-1 py-2.5 transition-colors ${
                isActive ? 'text-green-700' : 'text-gray-400'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-green-100' : ''
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 2} />
              </div>
              <span
                className={`text-[10px] ${
                  isActive ? 'font-semibold' : 'font-medium'
                }`}
              >
                {labels[id]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
