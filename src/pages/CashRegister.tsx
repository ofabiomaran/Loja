import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function CashRegister() {
  const { currentCashRegister, openCashRegister, closeCashRegister, getCurrentCashSummary } = useStore();
  const [openingBalance, setOpeningBalance] = useState('');
  const [actualClosingBalance, setActualClosingBalance] = useState('');
  const [notes, setNotes] = useState('');

  const handleOpenCashRegister = (e: React.FormEvent) => {
    e.preventDefault();
    openCashRegister(Number(openingBalance), notes);
    setOpeningBalance('');
    setNotes('');
  };

  const handleCloseCashRegister = (e: React.FormEvent) => {
    e.preventDefault();
    closeCashRegister(Number(actualClosingBalance), notes);
    setActualClosingBalance('');
    setNotes('');
  };

  const summary = getCurrentCashSummary();
  const expectedClosingBalance = currentCashRegister 
    ? currentCashRegister.openingBalance + summary.cash 
    : 0;

  if (!currentCashRegister) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-6">Abrir Caixa</h2>
        <form onSubmit={handleOpenCashRegister} className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Saldo Inicial</label>
              <input
                type="number"
                step="0.01"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Observações</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Abrir Caixa
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Caixa Aberto</h2>
          <p className="text-gray-600">
            Aberto em:{' '}
            {currentCashRegister.openingDate.toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Saldo Inicial</h3>
            <p className="text-2xl font-bold text-gray-900">
              {currentCashRegister.openingBalance.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total em Vendas</h3>
            <p className="text-2xl font-bold text-gray-900">
              {summary.total.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold">Resumo por Forma de Pagamento</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>Dinheiro</span>
              <span className="font-semibold">
                {summary.cash.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>Cartão de Crédito</span>
              <span className="font-semibold">
                {summary.credit.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>Cartão de Débito</span>
              <span className="font-semibold">
                {summary.debit.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded">
              <span>PIX</span>
              <span className="font-semibold">
                {summary.pix.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded">
            <div className="flex justify-between">
              <span>Total em Descontos</span>
              <span className="font-semibold text-blue-600">
                {summary.totalDiscounts.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleCloseCashRegister} className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Fechamento de Caixa</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Saldo em Caixa Esperado
                </label>
                <p className="mt-1 text-2xl font-bold">
                  {expectedClosingBalance.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Saldo em Caixa Real
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={actualClosingBalance}
                  onChange={(e) => setActualClosingBalance(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              {actualClosingBalance && (
                <div className={`p-3 rounded ${
                  Number(actualClosingBalance) === expectedClosingBalance
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  <p className="font-medium">
                    {Number(actualClosingBalance) === expectedClosingBalance
                      ? 'Caixa conferido! Os valores batem.'
                      : `Diferença no caixa: ${(Number(actualClosingBalance) - expectedClosingBalance).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}`}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Observações de Fechamento
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Fechar Caixa
          </button>
        </form>
      </div>
    </div>
  );
}