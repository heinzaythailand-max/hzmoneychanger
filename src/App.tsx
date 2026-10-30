import { useState } from 'react';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Home from '@/screens/Home';
import Exchange from '@/screens/Exchange';
import History from '@/screens/History';
import Customers from '@/screens/Customers';
import Settings from '@/screens/Settings';

export type Tab = 'home' | 'exchange' | 'history' | 'customers' | 'settings';

export default function App() {
  const [tab, setTab] = useState<Tab>('home');

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-md bg-gray-100 min-h-screen flex flex-col relative">
        <Header />
        <main className="flex-1 px-4 py-5 pb-24 overflow-y-auto">
          {tab === 'home' && <Home onNavigate={setTab} />}
          {tab === 'exchange' && <Exchange />}
          {tab === 'history' && <History />}
          {tab === 'customers' && <Customers />}
          {tab === 'settings' && <Settings />}
        </main>
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </div>
  );
}
