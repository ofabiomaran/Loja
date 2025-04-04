import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { PaymentFees, PaymentFeeConfig } from '../types';
import { Save, Percent, DollarSign } from 'lucide-react';

export default function Settings() {
  const { paymentFees, updatePaymentFees } = useStore();
  const [fees, setFees] = useState<PaymentFees>(paymentFees);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentFees(fees);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const updateFee = (
    method: keyof PaymentFees,
    updates: Partial<PaymentFeeConfig>
  ) => {
    setFees({
      ...fees,
      [method]: { ...fees[method], ...updates }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configurações</h1>

      {showSuccess && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">Taxas atualizadas com sucesso!</span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Taxas de Pagamento</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Cartão de Crédito</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateFee('credit', { type: 'fixed' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded ${
                      fees.credit.type === 'fixed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    Valor Fixo
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFee('credit', { type: 'percentage' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded ${
                      fees.credit.type === 'percentage'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Percent className="h-4 w-4" />
                    Porcentagem
                  </button>
                </div>
                <div className="relative">
                  {fees.credit.type === 'fixed' && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      R$
                    </span>
                  )}
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={fees.credit.type === 'percentage' ? 100 : undefined}
                    value={fees.credit.value}
                    onChange={(e) => updateFee('credit', { value: Number(e.target.value) })}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      fees.credit.type === 'fixed' ? 'pl-10' : ''
                    }`}
                  />
                  {fees.credit.type === 'percentage' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Cartão de Débito</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateFee('debit', { type: 'fixed' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded ${
                      fees.debit.type === 'fixed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    Valor Fixo
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFee('debit', { type: 'percentage' })}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded ${
                      fees.debit.type === 'percentage'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Percent className="h-4 w-4" />
                    Porcentagem
                  </button>
                </div>
                <div className="relative">
                  {fees.debit.type === 'fixed' && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      R$
                    </span>
                  )}
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={fees.debit.type === 'percentage' ? 100 : undefined}
                    value={fees.debit.value}
                    onChange={(e) => updateFee('debit', { value: Number(e.target.value) })}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                      fees.debit.type === 'fixed' ? 'pl-10' : ''
                    }`}
                  />
                  {fees.debit.type === 'percentage' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      %
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Save className="h-5 w-5" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}