import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Product, Sale, CashRegister, PaymentFees } from '../types';

interface PDVDatabase extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: { 'by-name': string };
  };
  sales: {
    key: string;
    value: Sale;
    indexes: { 'by-date': Date };
  };
  cashRegisters: {
    key: string;
    value: CashRegister;
    indexes: { 'by-date': Date };
  };
  settings: {
    key: string;
    value: {
      paymentFees: PaymentFees;
    };
  };
}

let db: IDBPDatabase<PDVDatabase>;

export async function initDB() {
  db = await openDB<PDVDatabase>('pdv-db', 1, {
    upgrade(db) {
      // Products store
      const productStore = db.createObjectStore('products', { keyPath: 'id' });
      productStore.createIndex('by-name', 'name');

      // Sales store
      const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
      salesStore.createIndex('by-date', 'date');

      // Cash registers store
      const cashRegisterStore = db.createObjectStore('cashRegisters', { keyPath: 'id' });
      cashRegisterStore.createIndex('by-date', 'openingDate');

      // Settings store
      db.createObjectStore('settings');
    },
  });
}

// Products
export async function getAllProducts(): Promise<Product[]> {
  return db.getAll('products');
}

export async function addProduct(product: Product): Promise<void> {
  await db.add('products', product);
}

export async function updateProduct(product: Product): Promise<void> {
  await db.put('products', product);
}

export async function deleteProduct(id: string): Promise<void> {
  await db.delete('products', id);
}

// Sales
export async function getAllSales(): Promise<Sale[]> {
  return db.getAll('sales');
}

export async function addSale(sale: Sale): Promise<void> {
  await db.add('sales', sale);
}

export async function updateSale(sale: Sale): Promise<void> {
  await db.put('sales', sale);
}

// Cash Registers
export async function getAllCashRegisters(): Promise<CashRegister[]> {
  return db.getAll('cashRegisters');
}

export async function getCurrentCashRegister(): Promise<CashRegister | undefined> {
  const allRegisters = await getAllCashRegisters();
  return allRegisters.find(register => register.status === 'open');
}

export async function addCashRegister(register: CashRegister): Promise<void> {
  await db.add('cashRegisters', register);
}

export async function updateCashRegister(register: CashRegister): Promise<void> {
  await db.put('cashRegisters', register);
}

// Settings
export async function getSettings(): Promise<{ paymentFees: PaymentFees }> {
  const settings = await db.get('settings', 'paymentFees');
  return settings || {
    paymentFees: {
      cash: { type: 'fixed', value: 0 },
      credit: { type: 'percentage', value: 3.5 },
      debit: { type: 'percentage', value: 2 },
      pix: { type: 'fixed', value: 0 }
    }
  };
}

export async function updateSettings(settings: { paymentFees: PaymentFees }): Promise<void> {
  await db.put('settings', settings, 'paymentFees');
}