import { useState } from 'react';
import { useStore, type Currency, type Account } from '@/store/useStore';
import { formatAmount } from '@/utils/format';
import { Save, Plus, Trash2, CheckCircle2, RotateCcw, Pencil, X } from 'lucide-react';

export default function Settings() {
  const {
    accounts,
    addAccount,
    updateAccount,
    removeAccount,
    resetAll,
  } = useStore();

  const [newName, setNewName] = useState('');
  const [newCurrency, setNewCurrency] = useState<Currency>('THB');
  const [newBalance, setNewBalance] = useState('');
  const [toast, setToast] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [editName, setEditName] = useState('');
  const [editCurrency, setEditCurrency] = useState<Currency>('THB');
  const [editBalance, setEditBalance] = useState('');

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 1800);
  };

  const handleAddAccount = () => {
    if (!newName.trim()) return;
    addAccount(newName.trim(), newCurrency, parseFloat(newBalance) || 0);
    setNewName('');
    setNewBalance('');
  };

  const openEdit = (acc: Account) => {
    setEditing(acc);
    setEditName(acc.name);
    setEditCurrency(acc.currency);
    setEditBalance(String(acc.balance));
  };

  const handleSaveEdit = () => {
    if (!editing || !editName.trim()) return;
    updateAccount(editing.id, {
      name: editName.trim(),
      currency: editCurrency,
      balance: parseFloat(editBalance) || 0,
    });
    setEditing(null);
    showToast();
  };

  const handleResetAll = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete all history and reset all balances? This cannot be undone.'
    );
    if (confirmed) {
      resetAll();
      showToast();
    }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Settings</h2>

      <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-green-600 rounded-full" />
          Manage Bank Accounts
        </h3>
        <div className="space-y-2">
          {accounts.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between bg-gray-50 rounded-xl px-3.5 py-2.5"
            >
              <div>
                <p className="font-medium text-gray-800 text-sm">{a.name}</p>
                <p className="text-xs text-gray-400">
                  {formatAmount(a.balance)} {a.currency}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(a)}
                  className="text-gray-400 hover:text-crimson-600 p-1.5"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeAccount(a.id)}
                  className="text-gray-300 hover:text-crimson-500 p-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-2 border-t border-gray-100 space-y-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Account Name"
            className="w-full bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-crimson-300"
          />
          <div className="grid grid-cols-3 gap-2">
            <select
              value={newCurrency}
              onChange={(e) => setNewCurrency(e.target.value as Currency)}
              className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-crimson-300"
            >
              <option value="THB">THB</option>
              <option value="MMK">MMK</option>
            </select>
            <input
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              type="number"
              placeholder="0"
              className="col-span-2 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-crimson-300"
            />
          </div>
          <button
            onClick={handleAddAccount}
            className="w-full border-2 border-dashed border-green-200 text-green-700 hover:bg-green-50 font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </button>
        </div>
      </section>

      <button
        onClick={handleResetAll}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Reset All Data
      </button>

      {editing && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Edit Account</h3>
              <button
                onClick={() => setEditing(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                  Account Name
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-crimson-300"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                  Currency
                </label>
                <select
                  value={editCurrency}
                  onChange={(e) => setEditCurrency(e.target.value as Currency)}
                  className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-crimson-300"
                >
                  <option value="THB">THB</option>
                  <option value="MMK">MMK</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                  Account Balance
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  className="w-full bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-crimson-300"
                />
              </div>
            </div>
            <button
              onClick={handleSaveEdit}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl px-6 py-5 shadow-xl flex flex-col items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <p className="font-semibold text-gray-800 text-sm">Settings saved</p>
          </div>
        </div>
      )}
    </div>
  );
}
