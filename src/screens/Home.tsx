import { useStore } from '@/store/useStore';
import { formatAmount } from '@/utils/format';
import {
  Wallet,
  Landmark,
  Banknote,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
} from 'lucide-react';
import type { Tab } from '@/App';

export default function Home({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const { accounts, transactions, openingCash, openingCashMmk } = useStore();

  const cashThb = accounts
    .filter((a) => a.currency === 'THB' && a.name.toLowerCase().includes('cash'))
    .reduce((s, a) => s + a.balance, 0);
  const bankThb = accounts
    .filter((a) => a.currency === 'THB' && !a.name.toLowerCase().includes('cash'))
    .reduce((s, a) => s + a.balance, 0);
  const totalMmk = accounts
    .filter((a) => a.currency === 'MMK' && !a.name.toLowerCase().includes('cash'))
    .reduce((s, a) => s + a.balance, 0);

  const cashThbTotal = openingCash + cashThb;
  const cashMmkTotal = openingCashMmk + accounts
    .filter((a) => a.currency === 'MMK' && a.name.toLowerCase().includes('cash'))
    .reduce((s, a) => s + a.balance, 0);

  const today = new Date().toISOString().slice(0, 10);
  const todayTx = transactions.filter((tx) => tx.date.startsWith(today));

  type AggEntry = { amount: number; currency: 'THB' | 'MMK' };
  const aggregate = (
    txs: typeof todayTx,
    side: 'payment' | 'payout'
  ): Record<string, AggEntry> => {
    const map: Record<string, AggEntry> = {};
    for (const tx of txs) {
      const isMmkToThb = tx.direction === 'mmk_to_thb';
      const name = side === 'payment' ? tx.paymentMethod : tx.payoutMethod;
      const value = side === 'payment' ? tx.amount : tx.received;
      const currency: 'THB' | 'MMK' =
        side === 'payment'
          ? isMmkToThb
            ? 'MMK'
            : 'THB'
          : isMmkToThb
            ? 'THB'
            : 'MMK';
      if (!map[name]) map[name] = { amount: 0, currency };
      map[name].amount += value;
    }
    return map;
  };

  const incomeByAccount = aggregate(todayTx, 'payment');
  const outflowByAccount = aggregate(todayTx, 'payout');

  const incomeEntries = Object.entries(incomeByAccount).sort((a, b) =>
    b[1].amount === a[1].amount ? 0 : b[1].amount - a[1].amount
  );
  const outflowEntries = Object.entries(outflowByAccount).sort((a, b) =>
    b[1].amount === a[1].amount ? 0 : b[1].amount - a[1].amount
  );

  const incomeThb = incomeEntries
    .filter(([, e]) => e.currency === 'THB')
    .reduce((s, [, e]) => s + e.amount, 0);
  const incomeMmk = incomeEntries
    .filter(([, e]) => e.currency === 'MMK')
    .reduce((s, [, e]) => s + e.amount, 0);
  const outflowThb = outflowEntries
    .filter(([, e]) => e.currency === 'THB')
    .reduce((s, [, e]) => s + e.amount, 0);
  const outflowMmk = outflowEntries
    .filter(([, e]) => e.currency === 'MMK')
    .reduce((s, [, e]) => s + e.amount, 0);

  const hasFlow = incomeEntries.length > 0 || outflowEntries.length > 0;

  // Today's profit: 7 THB per 100,000 MMK in outflow.
  // Outflow MMK comes from thb_to_mmk transactions (business pays out MMK via `received`).
  const mmkOutflowTotal = todayTx
    .filter((tx) => tx.direction === 'thb_to_mmk')
    .reduce((s, tx) => s + tx.received, 0);
  const todayProfit = Math.abs((mmkOutflowTotal / 100000) * 7);

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SummaryCard
          icon={<Wallet className="w-5 h-5" />}
          label="Total THB in Cash"
          value={formatAmount(cashThbTotal)}
          currency="THB"
        />
        <SummaryCard
          icon={<Banknote className="w-5 h-5" />}
          label="Total MMK in Cash"
          value={formatAmount(cashMmkTotal)}
          currency="MMK"
        />
        <SummaryCard
          icon={<Landmark className="w-5 h-5" />}
          label="Total THB in Bank"
          value={formatAmount(bankThb)}
          currency="THB"
        />
        <SummaryCard
          icon={<Banknote className="w-5 h-5" />}
          label="Total MMK (All Banks)"
          value={formatAmount(totalMmk)}
          currency="MMK"
        />
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-800">Today's Cash Flow</h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <p className="text-sm font-semibold text-gray-700">Income</p>
            <div className="ml-auto flex gap-2">
              {incomeThb > 0 && (
                <span className="text-xs font-semibold text-emerald-600">
                  +{formatAmount(incomeThb)} THB
                </span>
              )}
              {incomeMmk > 0 && (
                <span className="text-xs font-semibold text-emerald-600">
                  +{formatAmount(incomeMmk)} MMK
                </span>
              )}
            </div>
          </div>
          {incomeEntries.length === 0 ? (
            <p className="text-xs text-gray-400 pl-6">No income today</p>
          ) : (
            <div className="space-y-1 pl-6">
              {incomeEntries.map(([name, e]) => (
                <div
                  key={`in-${name}`}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-gray-600">{name}</span>
                  <span className="font-medium text-emerald-600">
                    +{formatAmount(e.amount)} {e.currency}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-crimson-600" />
            <p className="text-sm font-semibold text-gray-700">Outflow</p>
            <div className="ml-auto flex gap-2">
              {outflowThb > 0 && (
                <span className="text-xs font-semibold text-crimson-600">
                  -{formatAmount(outflowThb)} THB
                </span>
              )}
              {outflowMmk > 0 && (
                <span className="text-xs font-semibold text-crimson-600">
                  -{formatAmount(outflowMmk)} MMK
                </span>
              )}
            </div>
          </div>
          {outflowEntries.length === 0 ? (
            <p className="text-xs text-gray-400 pl-6">No outflow today</p>
          ) : (
            <div className="space-y-1 pl-6">
              {outflowEntries.map(([name, e]) => (
                <div
                  key={`out-${name}`}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-gray-600">{name}</span>
                  <span className="font-medium text-crimson-600">
                    -{formatAmount(e.amount)} {e.currency}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!hasFlow && (
          <p className="text-xs text-gray-400 text-center pt-1">
            No transactions recorded today.
          </p>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-3 px-1">Account Balances</h3>
        <div className="space-y-2">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    acc.currency === 'THB'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">{acc.name}</p>
                  <p className="text-xs text-gray-400">{acc.currency}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 text-sm">
                  {formatAmount(acc.balance)}
                </p>
                <p className="text-xs text-gray-400">{acc.currency}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => onNavigate('exchange')}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 transition-all text-white font-semibold py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-2"
      >
        <ArrowLeftRight className="w-5 h-5" />
        Go to Exchange
      </button>

      <div className="bg-gradient-to-br from-green-600 to-emerald-500 text-white rounded-2xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium">ယနေ့အမြတ်ငွေ</p>
            <p className="text-[11px] opacity-90">Today's Profit</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold leading-tight">
            {formatAmount(todayProfit)}
          </p>
          <p className="text-xs font-medium opacity-95">THB</p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  currency,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  currency: string;
}) {
  return (
    <div className="bg-white text-green-900 rounded-2xl p-4 shadow-md border border-green-100">
      <div className="flex items-center justify-between mb-2">
        <div className="text-green-800">{icon}</div>
      </div>
      <p className="text-xs font-medium mb-1 text-green-700">{label}</p>
      <p className="text-2xl font-bold leading-tight text-green-900">{value}</p>
      <p className="text-xs font-medium mt-0.5 text-green-700">{currency}</p>
    </div>
  );
}
