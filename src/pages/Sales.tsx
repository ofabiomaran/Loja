import React, { useState } from 'react';
import { Pencil, Trash2, X, Percent, DollarSign } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Sale, SaleItem } from '../types';

export default function Sales() {
  const { sales, updateSale, cancelSale } = useStore();
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editedItems, setEditedItems] = useState<SaleItem[]>([]);
  const [editedPaymentMethod, setEditedPaymentMethod] = useState<'cash' | 'credit' | 'debit' | 'pix'>('cash');
  const [discountType, setDiscountType] = useState<'percentage' | 'value'>('percentage');
  const [discountAmount, setDiscountAmount] = useState(0);

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setEditedItems([...sale.items]);
    setEditedPaymentMethod(sale.paymentMethod);
    
    // Calculate existing discount percentage
    const discountPercentage = (sale.totalDiscount / sale.subtotal) * 100;
    setDiscountAmount(discountPercentage);
    setDiscountType('percentage');
  };

  const handleCancel = (saleId: string) => {
    if (confirm('Tem certeza que deseja cancelar esta venda?')) {
      cancelSale(saleId);
    }
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    setEditedItems(items =>
      items.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, newQuantity) }
          : item
      )
    );
  };

  const handleUpdateDiscount = (productId: string, newDiscount: number) => {
    setEditedItems(items =>
      items.map(item =>
        item.product.id === productId
          ? { ...item, discount: Math.max(0, Math.min(100, newDiscount)) }
          : item
      )
    );
  };

  const calculateTotals = () => {
    const subtotal = editedItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    let totalDiscount = 0;
    if (discountType === 'percentage') {
      totalDiscount = (subtotal * discountAmount) / 100;
    } else {
      totalDiscount = Math.min(discountAmount, subtotal);
    }

    const total = subtotal - totalDiscount;

    return { subtotal, totalDiscount, total };
  };

  const handleSaveEdit = () => {
    if (!editingSale) return;

    const { subtotal, totalDiscount, total } = calculateTotals();

    // Calculate individual item discounts based on the global discount
    const discountPercentage = (totalDiscount / subtotal) * 100;
    const updatedItems = editedItems.map(item => ({
      ...item,
      discount: discountPercentage
    }));

    const updatedSale: Sale = {
      ...editingSale,
      items: updatedItems,
      subtotal,
      totalDiscount,
      total,
      paymentMethod: editedPaymentMethod,
      status: 'edited'
    };

    updateSale(updatedSale);
    setEditingSale(null);
    setEditedItems([]);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Vendas</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pagamento</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id} className={`${sale.status === 'cancelled' ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.date.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 space-y-1">
                      {sale.items.map((item) => (
                        <div key={item.product.id}>
                          {item.quantity}x {item.product.name}
                          {item.discount > 0 && (
                            <span className="text-green-600 ml-2">
                              (-{item.discount.toFixed(2)}%)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sale.paymentMethod === 'cash' && 'Dinheiro'}
                    {sale.paymentMethod === 'credit' && 'Cartão de Crédito'}
                    {sale.paymentMethod === 'debit' && 'Cartão de Débito'}
                    {sale.paymentMethod === 'pix' && 'PIX'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600">
                    {sale.totalDiscount > 0 && (
                      sale.totalDiscount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {sale.total.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {sale.status === 'completed' && (
                      <span className="text-green-600">Concluída</span>
                    )}
                    {sale.status === 'cancelled' && (
                      <span className="text-red-600">Cancelada</span>
                    )}
                    {sale.status === 'edited' && (
                      <span className="text-blue-600">Editada</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {sale.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => handleEdit(sale)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCancel(sale.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Sale Modal */}
      {editingSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Venda</h2>
              <button
                onClick={() => setEditingSale(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded space-y-4">
                <p className="text-sm text-gray-600">
                  Data da venda:{' '}
                  {editingSale.date.toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <button
                      onClick={() => setEditedPaymentMethod('cash')}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        editedPaymentMethod === 'cash'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Dinheiro
                    </button>
                    <button
                      onClick={() => setEditedPaymentMethod('credit')}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        editedPaymentMethod === 'credit'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Crédito
                    </button>
                    <button
                      onClick={() => setEditedPaymentMethod('debit')}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        editedPaymentMethod === 'debit'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      Débito
                    </button>
                    <button
                      onClick={() => setEditedPaymentMethod('pix')}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        editedPaymentMethod === 'pix'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      PIX
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desconto Global
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDiscountType('percentage')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded ${
                          discountType === 'percentage'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <Percent className="h-4 w-4" />
                        Porcentagem
                      </button>
                      <button
                        onClick={() => setDiscountType('value')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded ${
                          discountType === 'value'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <DollarSign className="h-4 w-4" />
                        Valor
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
                        max={discountType === 'percentage' ? 100 : calculateTotals().subtotal}
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(Number(e.target.value))}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder={discountType === 'percentage' ? '0%' : 'R$ 0,00'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Preço Unit.</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {editedItems.map((item) => {
                      const itemTotal = item.product.price * item.quantity;
                      return (
                        <tr key={item.product.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.product.name}</td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.product.id, parseInt(e.target.value))}
                              className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-500">
                            {item.product.price.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            {itemTotal.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium">
                        Subtotal:
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        {calculateTotals().subtotal.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium text-green-600">
                        Desconto:
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-green-600">
                        {calculateTotals().totalDiscount.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right text-sm font-medium">
                        Total:
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        {calculateTotals().total.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setEditingSale(null)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}