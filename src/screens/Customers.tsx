import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Search, UserPlus, Phone, X, Trash2 } from 'lucide-react';

export default function Customers() {
  const { customers, addCustomer, removeCustomer } = useStore();
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query)
  );

  const handleAdd = () => {
    if (!name.trim() || !phone.trim()) return;
    addCustomer(name.trim(), phone.trim());
    setName('');
    setPhone('');
    setShowForm(false);
  };

  return (
    <div className="animate-fade-in space-y-4 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Customers</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 transition-colors text-white text-sm font-semibold px-3.5 py-2 rounded-xl"
        >
          <UserPlus className="w-4 h-4" />
          Add New Customer
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search customers..."
          className="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-crimson-300"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-12 text-sm">
            No customers yet
          </div>
        )}
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-crimson-50 text-crimson-700 flex items-center justify-center font-semibold text-sm">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {c.phone}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeCustomer(c.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-crimson-500 p-2"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-30 bg-black/40 flex items-end sm:items-center justify-center"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Add New Customer</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                  Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Customer name"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-crimson-300"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                  Phone
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-crimson-300"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 text-gray-600 font-semibold py-3 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
