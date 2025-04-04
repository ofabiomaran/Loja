export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  category: string;
  barcode?: string;
  imageUrl?: string;
}

export interface SaleItem {
  product: Product;
  quantity: number;
  discount: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  subtotal: number;
  totalDiscount: number;
  paymentFee: number;
  date: Date;
  paymentMethod: 'cash' | 'credit' | 'debit' | 'pix';
  status: 'completed' | 'cancelled' | 'edited';
  notes?: string;
}

export interface CashRegister {
  id: string;
  openingDate: Date;
  closingDate?: Date;
  openingBalance: number;
  closingBalance?: number;
  actualClosingBalance?: number;
  cashShortage?: number;
  sales: Sale[];
  status: 'open' | 'closed';
  notes?: string;
}

export type PaymentSummary = {
  cash: number;
  credit: number;
  debit: number;
  pix: number;
  total: number;
  totalDiscounts: number;
  totalPaymentFees: number;
};

export interface PaymentFeeConfig {
  type: 'fixed' | 'percentage';
  value: number;
}

export interface PaymentFees {
  cash: PaymentFeeConfig;
  credit: PaymentFeeConfig;
  debit: PaymentFeeConfig;
  pix: PaymentFeeConfig;
}

export const PAYMENT_FEES: PaymentFees = {
  cash: { type: 'fixed', value: 0 },
  credit: { type: 'percentage', value: 3.5 },
  debit: { type: 'percentage', value: 2 },
  pix: { type: 'fixed', value: 0 }
};