import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { formatAmount } from '@/utils/format';
import { Search, ArrowDownLeft, ArrowUpRight, User, Trash2, X } from 'lucide-react';

export default function History() {
  const { transactions, customers, removeTransaction } = useStore();
  const [query, setQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const pendingDelete = transactions.find((tx) => tx.id === pendingDeleteId);

  const filtered = transactions.filter((tx) => {
    const q = query.toLowerCase();
    const matchesQuery =
      tx.direction.toLowerCase().includes(q) ||
      tx.paymentMethod.toLowerCase().includes(q) ||
      tx.payoutMethod.toLowerCase().includes(q) ||
      (tx.customerName?.toLowerCase().includes(q) ?? false) ||
      tx.amount.toString().includes(q);
    const matchesCustomer =
      customerFilter === '' || tx.customerId === customerFilter;
    return matchesQuery && matchesCustomer;
  });

  const statusColor = (s: string) =>
    s === 'completed'
      ? 'bg-emerald-50 text-emerald-600'
      : s === 'pending'
      ? 'bg-amber-50 text-amber-600'
      : 'bg-crimson-50 text-crimson-600';

  const statusLabel = (s: string) =>
    s === 'completed' ? 'Completed' : s === 'pending' ? 'Pending' : 'Failed';

  const customer = customers.find((c) => c.id === customerFilter);
  const customerTx = customerFilter
    ? transactions.filter((tx) => tx.customerId === customerFilter)
    : [];

  // Income = money the business received from this customer.
  // For mmk_to_thb: customer sends MMK (amount), business receives THB (received).
  //   -> "income from customer" = the MMK amount they sent in.
  // For thb_to_mmk: customer sends THB (amount), business receives MMK (received).
  //   -> "income from customer" = the THB amount they sent in.
  // Outflow = money the business paid out to this customer (the `received` side).
  let incomeThb = 0;
  let incomeMmk = 0;
  let outflowThb = 0;
  let outflowMmk = 0;

  for (const tx of customerTx) {
    if (tx.direction === 'mmk_to_thb') {
      incomeMmk += tx.amount;
      outflowThb += tx.received;
    } else {
      incomeThb += tx.amount;
      outflowMmk += tx.received;
    }
  }

  return (
    <div className="animate-fade-in space-y-4">
      <h2 className="text-xl font-bold text-gray-900">History</h2>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search transactions..."
          className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-crimson-300"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 font-medium mb-1.5 block">
          Filter by Customer
        </label>
        <select
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          className="w-full bg-white rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 border border-gray-200 outline-none focus:ring-2 focus:ring-crimson-300 appearance-none"
        >
          <option value="">All customers</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {customer && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-crimson-50 text-crimson-700 flex items-center justify-center font-semibold text-xs">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">
                {customer.name}
              </p>
              <p className="text-xs text-gray-400">
                {customerTx.length} transaction{customerTx.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-emerald-50 rounded-xl p-3">
              <p className="text-[10px] text-emerald-700 font-semibold mb-1.5">
                Income from customer
              </p>
              {incomeThb > 0 && (
                <p className="text-xs font-semibold text-emerald-600">
                  +{formatAmount(incomeThb)} THB
                </p>
              )}
              {incomeMmk > 0 && (
                <p className="text-xs font-semibold text-emerald-600">
                  +{formatAmount(incomeMmk)} MMK
                </p>
              )}
              {incomeThb === 0 && incomeMmk === 0 && (
                <p className="text-xs text-gray-400">—</p>
              )}
            </div>
            <div className="bg-crimson-50 rounded-xl p-3">
              <p className="text-[10px] text-crimson-700 font-semibold mb-1.5">
                Outflow to customer
              </p>
              {outflowThb > 0 && (
                <p className="text-xs font-semibold text-crimson-600">
                  -{formatAmount(outflowThb)} THB
                </p>
              )}
              {outflowMmk > 0 && (
                <p className="text-xs font-semibold text-crimson-600">
                  -{formatAmount(outflowMmk)} MMK
                </p>
              )}
              {outflowThb === 0 && outflowMmk === 0 && (
                <p className="text-xs text-gray-400">—</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-12 text-sm">
            No transactions found
          </div>
        )}
        {filtered.map((tx) => {
          const isMmkToThb = tx.direction === 'mmk_to_thb';
          return (
            <div
              key={tx.id}
              className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isMmkToThb
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-crimson-50 text-crimson-600'
                    }`}
                  >
                    {isMmkToThb ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">
                      {isMmkToThb ? 'MMK to THB' : 'THB to MMK'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.date).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${statusColor(
                      tx.status
                    )}`}
                  >
                    {statusLabel(tx.status)}
                  </span>
                  <button
                    onClick={() => setPendingDeleteId(tx.id)}
                    className="text-gray-300 hover:text-crimson-500 p-1.5"
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {tx.customerName && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-crimson-700 bg-crimson-50 inline-flex px-2.5 py-1 rounded-full">
                  <User className="w-3 h-3" />
                  <span className="font-medium">{tx.customerName}</span>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-400 mb-0.5">Amount</p>
                  <p className="font-semibold text-gray-800">
                    {formatAmount(tx.amount)} {isMmkToThb ? 'MMK' : 'THB'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Received</p>
                  <p className="font-semibold text-gold-700">
                    {formatAmount(tx.received)} {isMmkToThb ? 'THB' : 'MMK'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-0.5">Rate</p>
                  <p className="font-semibold text-gray-700">{tx.rate}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
                <span>{tx.paymentMethod}</span>
                <span className="text-gray-300">→</span>
                <span>{tx.payoutMethod}</span>
              </div>
            </div>
          );
        })}
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Delete Transaction</h3>
              <button
                onClick={() => setPendingDeleteId(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              {pendingDelete.status === 'completed' ? (
                <>
                  {pendingDelete.paymentMethod} will decrease by{' '}
                  {formatAmount(pendingDelete.amount)} and {pendingDelete.payoutMethod} will
                  increase by {formatAmount(pendingDelete.received)}.
                </>
              ) : (
                'This transaction did not change any balances. It will only be removed from history.'
              )}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeTransaction(pendingDelete.id);
                  setPendingDeleteId(null);
                }}
                className="py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
