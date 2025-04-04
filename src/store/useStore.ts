import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Sale, SaleItem, CashRegister, PaymentSummary, PaymentFees } from '../types';

interface StoreState {
  products: Product[];
  sales: Sale[];
  cart: SaleItem[];
  currentCashRegister: CashRegister | null;
  cashRegisters: CashRegister[];
  paymentFees: PaymentFees;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addToCart: (product: Product, quantity: number) => void;
  updateCartItemDiscount: (productId: string, discount: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  finalizeSale: (paymentMethod: 'cash' | 'credit' | 'debit' | 'pix') => void;
  openCashRegister: (openingBalance: number, notes?: string) => void;
  closeCashRegister: (actualClosingBalance: number, notes?: string) => void;
  getCurrentCashSummary: () => PaymentSummary;
  updateSale: (sale: Sale) => void;
  cancelSale: (saleId: string) => void;
  updatePaymentFees: (fees: PaymentFees) => void;
}

const parseDates = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj;
  
  if (typeof obj === 'string') {
    const date = new Date(obj);
    return isNaN(date.getTime()) ? obj : date;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(parseDates);
  }
  
  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, parseDates(value)])
    );
  }
  
  return obj;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      sales: [],
      cart: [],
      currentCashRegister: null,
      cashRegisters: [],
      paymentFees: {
        cash: { type: 'fixed', value: 0 },
        credit: { type: 'percentage', value: 3.5 },
        debit: { type: 'percentage', value: 2 },
        pix: { type: 'fixed', value: 0 }
      },

      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, { ...product, id: crypto.randomUUID() }],
        })),

      updateProduct: (product) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === product.id ? product : p)),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      addToCart: (product, quantity) =>
        set((state) => {
          const existingItem = state.cart.find((item) => item.product.id === product.id);
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            cart: [...state.cart, { product, quantity, discount: 0 }],
          };
        }),

      updateCartItemDiscount: (productId, discount) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId ? { ...item, discount } : item
          ),
        })),

      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId),
        })),

      clearCart: () => set({ cart: [] }),

      finalizeSale: (paymentMethod) =>
        set((state) => {
          if (!state.currentCashRegister) {
            alert('O caixa precisa estar aberto para realizar vendas!');
            return state;
          }

          const subtotal = state.cart.reduce(
            (acc, item) => acc + item.product.price * item.quantity,
            0
          );

          const totalDiscount = state.cart.reduce(
            (acc, item) => acc + (item.product.price * item.quantity * item.discount) / 100,
            0
          );

          const subtotalAfterDiscount = subtotal - totalDiscount;
          
          // Only apply fees for credit and debit
          const fee = state.paymentFees[paymentMethod];
          const paymentFee = ['credit', 'debit'].includes(paymentMethod) && fee.type === 'percentage'
            ? (subtotalAfterDiscount * fee.value) / 100
            : 0;

          const total = subtotalAfterDiscount + paymentFee;

          const sale: Sale = {
            id: crypto.randomUUID(),
            items: [...state.cart],
            subtotal,
            totalDiscount,
            paymentFee,
            total,
            date: new Date(),
            paymentMethod,
            status: 'completed',
          };

          const updatedProducts = state.products.map((product) => {
            const saleItem = state.cart.find((item) => item.product.id === product.id);
            if (saleItem) {
              return {
                ...product,
                stock: product.stock - saleItem.quantity,
              };
            }
            return product;
          });

          const updatedCashRegister = {
            ...state.currentCashRegister,
            sales: [...state.currentCashRegister.sales, sale],
          };

          return {
            sales: [...state.sales, sale],
            products: updatedProducts,
            cart: [],
            currentCashRegister: updatedCashRegister,
          };
        }),

      openCashRegister: (openingBalance, notes) =>
        set((state) => ({
          currentCashRegister: {
            id: crypto.randomUUID(),
            openingDate: new Date(),
            openingBalance,
            sales: [],
            status: 'open',
            notes,
          },
        })),

      closeCashRegister: (actualClosingBalance, notes) =>
        set((state) => {
          if (!state.currentCashRegister) return state;

          const summary = get().getCurrentCashSummary();
          const expectedClosingBalance = state.currentCashRegister.openingBalance + summary.cash;
          const cashShortage = actualClosingBalance - expectedClosingBalance;

          const closedRegister: CashRegister = {
            ...state.currentCashRegister,
            closingDate: new Date(),
            closingBalance: expectedClosingBalance,
            actualClosingBalance,
            cashShortage,
            status: 'closed',
            notes: notes,
          };

          return {
            currentCashRegister: null,
            cashRegisters: [...state.cashRegisters, closedRegister],
          };
        }),

      getCurrentCashSummary: () => {
        const state = get();
        if (!state.currentCashRegister) {
          return {
            cash: 0,
            credit: 0,
            debit: 0,
            pix: 0,
            total: 0,
            totalDiscounts: 0,
            totalPaymentFees: 0
          };
        }

        return state.currentCashRegister.sales.reduce(
          (acc: PaymentSummary, sale) => {
            if (sale.status !== 'cancelled') {
              acc[sale.paymentMethod] += sale.total;
              acc.total += sale.total;
              acc.totalDiscounts += sale.totalDiscount;
              acc.totalPaymentFees += sale.paymentFee;
            }
            return acc;
          },
          { cash: 0, credit: 0, debit: 0, pix: 0, total: 0, totalDiscounts: 0, totalPaymentFees: 0 }
        );
      },

      updateSale: (updatedSale) =>
        set((state) => ({
          sales: state.sales.map((sale) => (sale.id === updatedSale.id ? updatedSale : sale)),
        })),

      cancelSale: (saleId) =>
        set((state) => ({
          sales: state.sales.map((sale) =>
            sale.id === saleId ? { ...sale, status: 'cancelled' } : sale
          ),
        })),

      updatePaymentFees: (fees) =>
        set((state) => ({
          paymentFees: fees,
        })),
    }),
    {
      name: 'pdv-storage',
      serialize: (state) => JSON.stringify(state),
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        return parseDates(parsed);
      },
    }
  )
);