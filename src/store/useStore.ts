import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'THB' | 'MMK';

export interface Account {
  id: string;
  name: string;
  currency: Currency;
  balance: number;
}

export interface Transaction {
  id: string;
  date: string;
  direction: 'mmk_to_thb' | 'thb_to_mmk';
  amount: number;
  received: number;
  rate: number;
  paymentMethod: string;
  payoutMethod: string;
  status: 'completed' | 'pending' | 'failed';
  customerId?: string;
  customerName?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface AppState {
  buyRate: number;
  sellRate: number;
  setRates: (buy: number, sell: number) => void;

  openingCash: number;
  openingCashMmk: number;

  accounts: Account[];
  addAccount: (name: string, currency: Currency, balance: number) => void;
  updateAccount: (id: string, data: Partial<Pick<Account, 'name' | 'currency' | 'balance'>>) => void;
  removeAccount: (id: string) => void;

  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'date' | 'status'>) => void;
  removeTransaction: (id: string) => void;

  customers: Customer[];
  addCustomer: (name: string, phone: string) => void;
  removeCustomer: (id: string) => void;

  resetAll: () => void;
}

const defaultAccounts: Account[] = [
  { id: 'kpay', name: 'Kpay', currency: 'MMK', balance: 8500000 },
  { id: 'wavepay', name: 'WavePay', currency: 'MMK', balance: 4200000 },
  { id: 'ktb', name: 'KTB Bank', currency: 'THB', balance: 125000 },
  { id: 'cb', name: 'CB Bank', currency: 'MMK', balance: 15000000 },
  { id: 'cash-thb', name: 'Cash (THB)', currency: 'THB', balance: 45000 },
];

const defaultTransactions: Transaction[] = [
  {
    id: 't1',
    date: '2026-10-26T10:30:00',
    direction: 'mmk_to_thb',
    amount: 1000000,
    received: 17000,
    rate: 58.8,
    paymentMethod: 'Kpay',
    payoutMethod: 'KTB Bank',
    status: 'completed',
    customerId: 'c1',
    customerName: 'U Aung Min',
  },
  {
    id: 't2',
    date: '2026-10-26T09:15:00',
    direction: 'thb_to_mmk',
    amount: 5000,
    received: 294000,
    rate: 58.8,
    paymentMethod: 'Cash (THB)',
    payoutMethod: 'WavePay',
    status: 'completed',
    customerId: 'c2',
    customerName: 'Daw Su Su',
  },
  {
    id: 't3',
    date: '2026-10-25T16:45:00',
    direction: 'mmk_to_thb',
    amount: 500000,
    received: 8500,
    rate: 58.8,
    paymentMethod: 'CB Bank',
    payoutMethod: 'Cash (THB)',
    status: 'completed',
    customerId: 'c1',
    customerName: 'U Aung Min',
  },
  {
    id: 't4',
    date: '2026-10-25T14:20:00',
    direction: 'thb_to_mmk',
    amount: 10000,
    received: 588000,
    rate: 58.8,
    paymentMethod: 'KTB Bank',
    payoutMethod: 'Kpay',
    status: 'pending',
    customerId: 'c3',
    customerName: 'Ko Thiha',
  },
];

const defaultCustomers: Customer[] = [
  { id: 'c1', name: 'U Aung Min', phone: '+95 9 123 456 789' },
  { id: 'c2', name: 'Daw Su Su', phone: '+95 9 987 654 321' },
  { id: 'c3', name: 'Ko Thiha', phone: '+95 9 555 123 456' },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      buyRate: 720,
      sellRate: 740,
      setRates: (buyRate, sellRate) => set({ buyRate, sellRate }),

      openingCash: 45000,
      openingCashMmk: 5000000,

      accounts: defaultAccounts,
      addAccount: (name, currency, balance) =>
        set((s) => ({
          accounts: [
            ...s.accounts,
            { id: `acc-${Date.now()}`, name, currency, balance },
          ],
        })),
      updateAccount: (id, data) =>
        set((s) => ({
          accounts: s.accounts.map((acc) =>
            acc.id === id ? { ...acc, ...data } : acc
          ),
        })),
      removeAccount: (id) =>
        set((s) => ({ accounts: s.accounts.filter((a) => a.id !== id) })),

      transactions: defaultTransactions,
      addTransaction: (t) =>
        set((s) => {
          const sendAmount = t.amount;
          const receiveAmount = t.received;
          const updatedAccounts = s.accounts.map((acc) => {
            if (acc.name === t.paymentMethod) {
              return { ...acc, balance: acc.balance + sendAmount };
            }
            if (acc.name === t.payoutMethod) {
              return { ...acc, balance: acc.balance - receiveAmount };
            }
            return acc;
          });
          return {
            accounts: updatedAccounts,
            transactions: [
              {
                ...t,
                id: `t-${Date.now()}`,
                date: new Date().toISOString(),
                status: 'completed' as const,
              },
              ...s.transactions,
            ],
          };
        }),
      removeTransaction: (id) =>
        set((s) => {
          const tx = s.transactions.find((item) => item.id === id);
          if (!tx) return s;

          const accounts =
            tx.status === 'completed'
              ? s.accounts.map((acc) => {
                  if (acc.name === tx.paymentMethod) {
                    return { ...acc, balance: acc.balance - tx.amount };
                  }
                  if (acc.name === tx.payoutMethod) {
                    return { ...acc, balance: acc.balance + tx.received };
                  }
                  return acc;
                })
              : s.accounts;

          return {
            accounts,
            transactions: s.transactions.filter((item) => item.id !== id),
          };
        }),

      customers: defaultCustomers,
      addCustomer: (name, phone) =>
        set((s) => ({
          customers: [
            ...s.customers,
            { id: `c-${Date.now()}`, name, phone },
          ],
        })),
      removeCustomer: (id) =>
        set((s) => ({ customers: s.customers.filter((c) => c.id !== id) })),

      resetAll: () =>
        set((s) => ({
          transactions: [],
          openingCash: 0,
          openingCashMmk: 0,
          accounts: s.accounts.map((acc) => ({ ...acc, balance: 0 })),
        })),
    }),
    { name: 'heinzay-remittance' }
  )
);
