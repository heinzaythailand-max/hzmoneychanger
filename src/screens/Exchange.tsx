import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { debounce } from '@/utils/debounce';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Exchange() {
  const { accounts, customers, buyRate, sellRate, setRates, addTransaction } =
    useStore();
  const [buy, setBuy] = useState(String(buyRate));
  const [sell, setSell] = useState(String(sellRate));
  const [direction, setDirection] = useState<'mmk_to_thb' | 'thb_to_mmk'>(
    'mmk_to_thb'
  );
  const [amount, setAmount] = useState('');
  const [received, setReceived] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [toast, setToast] = useState('');
  const buyRef = useRef(buy);
  const sellRef = useRef(sell);
  buyRef.current = buy;
  sellRef.current = sell;

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2000);
  };

  const saveRate = useCallback(() => {
    setRates(parseInt(buyRef.current, 10) || 0, parseInt(sellRef.current, 10) || 0);
  }, [setRates]);

  const debouncedSaveRate = useMemo(() => debounce(saveRate, 500), [saveRate]);

  useEffect(() => () => debouncedSaveRate.cancel(), [debouncedSaveRate]);

  const isMmkToThb = direction === 'mmk_to_thb';
  const rate = isMmkToThb ? sellRate : buyRate;

  const numericAmount = parseFloat(amount) || 0;
  const numericReceived = parseFloat(received) || 0;

  const paymentAccounts = accounts.filter((a) =>
    isMmkToThb ? a.currency === 'MMK' : a.currency === 'THB'
  );
  const payoutAccounts = accounts.filter((a) =>
    isMmkToThb ? a.currency === 'THB' : a.currency === 'MMK'
  );

  const canConfirm =
    numericAmount > 0 &&
    numericReceived > 0 &&
    paymentMethod &&
    payoutMethod &&
    customerId;

  const handleSendChange = (val: string) => {
    setAmount(val);
    if (val === '') {
      setReceived('');
      return;
    }
    const n = parseFloat(val);
    if (isNaN(n) || n <= 0) {
      setReceived('');
      return;
    }
    const r = isMmkToThb ? (n / 100000) * rate : (n / rate) * 100000;
    setReceived(String(Math.round(r * 100) / 100));
  };

  const handleReceiveChange = (val: string) => {
    setReceived(val);
    if (val === '') {
      setAmount('');
      return;
    }
    const n = parseFloat(val);
    if (isNaN(n) || n <= 0) {
      setAmount('');
      return;
    }
    const a = isMmkToThb ? (n / rate) * 100000 : (n / 100000) * rate;
    setAmount(String(Math.round(a * 100) / 100));
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    const customer = customers.find((c) => c.id === customerId);
    addTransaction({
      direction,
      amount: numericAmount,
      received: numericReceived,
      rate,
      paymentMethod,
      payoutMethod,
      customerId,
      customerName: customer?.name,
    });
    setAmount('');
    setReceived('');
    setPaymentMethod('');
    setPayoutMethod('');
    setCustomerId('');
    showToast('Transaction Completed');
  };

  const switchDirection = () => {
    setDirection(isMmkToThb ? 'thb_to_mmk' : 'mmk_to_thb');
    setAmount('');
    setReceived('');
    setPaymentMethod('');
    setPayoutMethod('');
  };

  return (
    <div className="animate-fade-in space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Exchange</h2>

      <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-5 bg-green-600 rounded-full" />
          Today's Exchange Rate
        </h3>
        <p className="text-xs text-gray-400 -mt-1">THB per 100,000 MMK</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">
              ဘတ်ပေးကျပ်ယူဈေး
            </label>
            <input
              type="number"
              step="1"
              value={buy}
              onChange={(e) => {
                setBuy(e.target.value);
                debouncedSaveRate();
              }}
              className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-crimson-300"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">
              ကျပ်ပေးဘတ်ယူဈေး
            </label>
            <input
              type="number"
              step="1"
              value={sell}
              onChange={(e) => {
                setSell(e.target.value);
                debouncedSaveRate();
              }}
              className="w-full bg-gray-50 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-crimson-300"
            />
          </div>
        </div>
      </section>

      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 grid grid-cols-2 gap-1">
        <button
          onClick={() => setDirection('mmk_to_thb')}
          className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
            isMmkToThb ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-sm' : 'text-gray-500'
          }`}
        >
          ကျပ်ပေးဘတ်ယူ
        </button>
        <button
          onClick={() => setDirection('thb_to_mmk')}
          className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
            !isMmkToThb ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-sm' : 'text-gray-500'
          }`}
        >
          ဘတ်ပေးကျပ်ယူ
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <span>Exchange Rate:</span>
        <span className="font-semibold text-green-700">
          {rate} THB per 100,000 MMK
        </span>
        <button
          onClick={switchDirection}
          className="ml-1 text-xs text-crimson-600 underline"
        >
          switch
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">
              Send Amount
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => handleSendChange(e.target.value)}
                placeholder="0"
                className="w-full text-lg font-bold text-gray-900 bg-gray-50 rounded-xl px-3 py-2.5 pr-12 outline-none focus:ring-2 focus:ring-crimson-300"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                {isMmkToThb ? 'MMK' : 'THB'}
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">
              Receive Amount
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={received}
                onChange={(e) => handleReceiveChange(e.target.value)}
                placeholder="0"
                className="w-full text-lg font-bold text-gold-700 bg-gold-50 rounded-xl px-3 py-2.5 pr-12 outline-none focus:ring-2 focus:ring-gold-300"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gold-600">
                {isMmkToThb ? 'THB' : 'MMK'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-8 h-8 rounded-full bg-crimson-50 border-2 border-white flex items-center justify-center shadow-sm">
            <ArrowRight className="w-4 h-4 text-green-700" />
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex flex-row items-center gap-2">
          <label className="text-xs text-gray-500 font-medium w-[110px] shrink-0">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="flex-1 bg-white rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 border border-gray-200 outline-none focus:ring-2 focus:ring-crimson-300 appearance-none"
          >
            <option value="">Select method</option>
            {paymentAccounts.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name} ({a.currency})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-row items-center gap-2">
          <label className="text-xs text-gray-500 font-medium w-[110px] shrink-0">
            Payout Method
          </label>
          <select
            value={payoutMethod}
            onChange={(e) => setPayoutMethod(e.target.value)}
            className="flex-1 bg-white rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 border border-gray-200 outline-none focus:ring-2 focus:ring-crimson-300 appearance-none"
          >
            <option value="">Select method</option>
            {payoutAccounts.map((a) => (
              <option key={a.id} value={a.name}>
                {a.name} ({a.currency})
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-row items-center gap-2">
          <label className="text-xs text-gray-500 font-medium w-[110px] shrink-0">
            Select Customer
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="flex-1 bg-white rounded-xl px-3 py-2.5 text-sm font-medium text-gray-800 border border-gray-200 outline-none focus:ring-2 focus:ring-crimson-300 appearance-none"
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={!canConfirm}
        className={`w-full font-semibold py-3.5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 ${
          canConfirm
            ? 'bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Confirm Transaction
      </button>

      {toast && (
        <div className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl px-6 py-5 shadow-xl flex flex-col items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <p className="font-semibold text-gray-800 text-sm">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
