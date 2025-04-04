import React, { useState } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Percent, Smartphone, DollarSign } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Product } from '../types';

export default function NewSale() {
  const { products, cart, addToCart, removeFromCart, finalizeSale, updateCartItemDiscount, paymentFees } = useStore();
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'value'>('percentage');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.barcode?.includes(search)
  );

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalDiscount = discountType === 'percentage' 
    ? (subtotal * discountAmount) / 100 
    : discountAmount;
  const subtotalAfterDiscount = Math.max(0, subtotal - totalDiscount);

  const calculateTotalWithFees = (paymentMethod: 'cash' | 'credit' | 'debit' | 'pix') => {
    // Only apply fees for credit and debit
    if (['cash', 'pix'].includes(paymentMethod)) {
      return {
        total: subtotalAfterDiscount,
        fee: 0
      };
    }

    const fee = paymentFees[paymentMethod];
    const feeAmount = fee.type === 'percentage'
      ? (subtotalAfterDiscount * fee.value) / 100
      : 0;
    
    return {
      total: subtotalAfterDiscount + feeAmount,
      fee: feeAmount
    };
  };

  const handleAddToCart = () => {
    if (selectedProduct && quantity > 0) {
      addToCart(selectedProduct, quantity);
      setSelectedProduct(null);
      setQuantity(1);
      setSearch('');
    }
  };

  const handleFinalizeSale = (paymentMethod: 'cash' | 'credit' | 'debit' | 'pix') => {
    const discountPercentage = discountType === 'percentage' 
      ? discountAmount 
      : (totalDiscount / subtotal) * 100;
    
    cart.forEach(item => {
      updateCartItemDiscount(item.product.id, discountPercentage);
    });
    finalizeSale(paymentMethod);
    setShowPaymentModal(false);
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          Venda concluída com sucesso!
        </div>
      )}

      <div className="flex-1">
        <h2 className="text-xl font-bold mb-4">Nova Venda</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto..."
              className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {search && (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`p-3 rounded-lg cursor-pointer active:bg-blue-100 ${
                    selectedProduct?.id === product.id
                      ? 'bg-blue-50 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500">Estoque: {product.stock}</p>
                    </div>
                    <p className="font-medium">
                      {product.price.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedProduct && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Quantidade</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center rounded-lg border-gray-300"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={handleAddToCart}
                  className="ml-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800"
                >
                  Adicionar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-96">
        <h2 className="text-xl font-bold mb-4">Carrinho</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto">
            {cart.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.quantity} x{' '}
                    {item.product.price.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-medium">
                    {(item.quantity * item.product.price).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-red-600 hover:text-red-800 active:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <>
              <div className="mt-6 pt-4 border-t space-y-4">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span>
                    {subtotal.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDiscountType('percentage')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded ${
                        discountType === 'percentage'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      <Percent className="h-4 w-4" />
                      %
                    </button>
                    <button
                      onClick={() => setDiscountType('value')}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded ${
                        discountType === 'value'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      <DollarSign className="h-4 w-4" />
                      R$
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {discountType === 'percentage' ? (
                      <Percent className="h-4 w-4 text-gray-500" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-gray-500" />
                    )}
                    <input
                      type="number"
                      min="0"
                      max={discountType === 'percentage' ? 100 : subtotal}
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      className="w-full rounded-md border-gray-300"
                      placeholder={discountType === 'percentage' ? '0%' : 'R$ 0,00'}
                    />
                  </div>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Desconto</span>
                    <span>
                      -{totalDiscount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Subtotal com Desconto</span>
                  <span>
                    {subtotalAfterDiscount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={() => handleFinalizeSale('cash')}
                  className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 active:bg-green-800 flex items-center justify-center gap-2"
                >
                  <DollarSign className="h-5 w-5" />
                  Dinheiro - {calculateTotalWithFees('cash').total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </button>
                <button
                  onClick={() => handleFinalizeSale('credit')}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-5 w-5" />
                  Crédito - {calculateTotalWithFees('credit').total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                  <span className="text-sm opacity-75">
                    (+{paymentFees.credit.value}%)
                  </span>
                </button>
                <button
                  onClick={() => handleFinalizeSale('debit')}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-5 w-5" />
                  Débito - {calculateTotalWithFees('debit').total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                  <span className="text-sm opacity-75">
                    (+{paymentFees.debit.value}%)
                  </span>
                </button>
                <button
                  onClick={() => handleFinalizeSale('pix')}
                  className="w-full bg-violet-600 text-white px-4 py-3 rounded-lg hover:bg-violet-700 active:bg-violet-800 flex items-center justify-center gap-2"
                >
                  <Smartphone className="h-5 w-5" />
                  PIX - {calculateTotalWithFees('pix').total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </button>
              </div>
            </>
          )}

          {cart.length === 0 && (
            <p className="text-center text-gray-500 py-8">Carrinho vazio</p>
          )}
        </div>
      </div>
    </div>
  );
}