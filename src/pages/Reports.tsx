import React, { useState } from 'react';
import { Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Sale } from '../types';

export default function Reports() {
  const { sales, products } = useStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'current' | 'historical'>('current');

  // Group sales by date
  const salesByDate = sales.reduce((acc, sale) => {
    const date = new Date(sale.date);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(sale);
    return acc;
  }, {} as Record<string, Sale[]>);

  // Get unique dates and sort them in descending order
  const availableDates = Object.keys(salesByDate).sort((a, b) => b.localeCompare(a));

  // Get sales for the selected date or current data
  const getRelevantSales = () => {
    if (viewMode === 'historical' && selectedDate) {
      const dateKey = selectedDate.toISOString().split('T')[0];
      return salesByDate[dateKey] || [];
    }
    return sales;
  };

  const relevantSales = getRelevantSales();
  const completedSales = relevantSales.filter(sale => sale.status !== 'cancelled');
  const canceledSales = relevantSales.filter(sale => sale.status === 'cancelled');

  const totalCompletedSales = completedSales.reduce((acc, sale) => acc + sale.total, 0);
  const totalCanceledSales = canceledSales.reduce((acc, sale) => acc + sale.total, 0);
  const totalDiscounts = completedSales.reduce((acc, sale) => acc + sale.totalDiscount, 0);
  const totalProducts = products.reduce((acc, product) => acc + product.stock, 0);
  const lowStock = products.filter((product) => product.stock < 10);

  const salesByPaymentMethod = completedSales.reduce(
    (acc, sale) => {
      acc[sale.paymentMethod] += sale.total;
      return acc;
    },
    { cash: 0, credit: 0, debit: 0, pix: 0 }
  );

  const canceledByPaymentMethod = canceledSales.reduce(
    (acc, sale) => {
      acc[sale.paymentMethod] += sale.total;
      return acc;
    },
    { cash: 0, credit: 0, debit: 0, pix: 0 }
  );

  const bestSellingProducts = completedSales
    .flatMap((sale) => sale.items)
    .reduce((acc, item) => {
      const existing = acc.find((p) => p.id === item.product.id);
      if (existing) {
        existing.quantity += item.quantity;
        existing.total += item.quantity * item.product.price;
        existing.totalDiscount += (item.quantity * item.product.price * item.discount) / 100;
      } else {
        acc.push({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          total: item.quantity * item.product.price,
          totalDiscount: (item.quantity * item.product.price * item.discount) / 100,
        });
      }
      return acc;
    }, [] as { id: string; name: string; quantity: number; total: number; totalDiscount: number }[])
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const generateReportText = () => {
    const reportDate = selectedDate || new Date();
    const dateStr = reportDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const formatCurrency = (value: number) => 
      value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const report = `
RELATÓRIO DE VENDAS - ${dateStr}
${viewMode === 'historical' ? '(Relatório Histórico)' : '(Relatório Atual)'}

RESUMO GERAL
-----------
Total em Vendas Concluídas (Bruto): ${formatCurrency(totalCompletedSales + totalDiscounts)}
Total em Descontos: ${formatCurrency(totalDiscounts)}
Total em Vendas Concluídas (Líquido): ${formatCurrency(totalCompletedSales)}
Total em Vendas Canceladas: ${formatCurrency(totalCanceledSales)}
Total de Produtos em Estoque: ${totalProducts}
Produtos com Estoque Baixo: ${lowStock.length}
Média por Venda: ${formatCurrency(completedSales.length ? totalCompletedSales / completedSales.length : 0)}

VENDAS CONCLUÍDAS POR FORMA DE PAGAMENTO
--------------------------------------
Dinheiro: ${formatCurrency(salesByPaymentMethod.cash)}
Cartão de Crédito: ${formatCurrency(salesByPaymentMethod.credit)}
Cartão de Débito: ${formatCurrency(salesByPaymentMethod.debit)}
PIX: ${formatCurrency(salesByPaymentMethod.pix)}

VENDAS CANCELADAS POR FORMA DE PAGAMENTO
-------------------------------------
Dinheiro: ${formatCurrency(canceledByPaymentMethod.cash)}
Cartão de Crédito: ${formatCurrency(canceledByPaymentMethod.credit)}
Cartão de Débito: ${formatCurrency(canceledByPaymentMethod.debit)}
PIX: ${formatCurrency(canceledByPaymentMethod.pix)}

PRODUTOS MAIS VENDIDOS
---------------------
${bestSellingProducts
  .map((product, index) => 
    `${index + 1}. ${product.name}
    Quantidade: ${product.quantity} unidades
    Valor Bruto: ${formatCurrency(product.total + product.totalDiscount)}
    Descontos: ${formatCurrency(product.totalDiscount)}
    Valor Líquido: ${formatCurrency(product.total)}`)
  .join('\n\n')}

PRODUTOS COM ESTOQUE BAIXO
-------------------------
${lowStock
  .map((product) => `${product.name} - ${product.stock} unidades`)
  .join('\n')}
`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-vendas-${dateStr.replace(/[/:]/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    if (!selectedDate) {
      setSelectedDate(new Date(availableDates[0]));
      return;
    }

    const currentIndex = availableDates.indexOf(selectedDate.toISOString().split('T')[0]);
    if (currentIndex === -1) return;

    const newIndex = direction === 'prev' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < availableDates.length) {
      setSelectedDate(new Date(availableDates[newIndex]));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setViewMode('current');
                setSelectedDate(null);
              }}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'current'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Atual
            </button>
            <button
              onClick={() => {
                setViewMode('historical');
                if (!selectedDate) {
                  setSelectedDate(new Date(availableDates[0]));
                }
              }}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'historical'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Histórico
            </button>
          </div>
          {viewMode === 'historical' && (
            <div className="flex items-center gap-2 bg-white rounded-lg shadow px-4 py-2">
              <button
                onClick={() => handleDateChange('prev')}
                className="p-1 hover:bg-gray-100 rounded"
                disabled={!availableDates.length}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span>
                  {selectedDate
                    ? selectedDate.toLocaleDateString('pt-BR')
                    : 'Selecione uma data'}
                </span>
              </div>
              <button
                onClick={() => handleDateChange('next')}
                className="p-1 hover:bg-gray-100 rounded"
                disabled={!availableDates.length}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
          <button
            onClick={generateReportText}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Download className="h-5 w-5" />
            Salvar Relatório
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total em Vendas Concluídas"
          value={totalCompletedSales.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        />
        <StatCard
          title="Total em Vendas Canceladas"
          value={totalCanceledSales.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
          highlight="text-red-600"
        />
        <StatCard
          title="Total em Descontos"
          value={totalDiscounts.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
          highlight="text-green-600"
        />
        <StatCard
          title="Média por Venda"
          value={
            completedSales.length
              ? (totalCompletedSales / completedSales.length).toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })
              : 'R$ 0,00'
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Vendas Concluídas por Forma de Pagamento</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Dinheiro</span>
              <span>
                {salesByPaymentMethod.cash.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cartão de Crédito</span>
              <span>
                {salesByPaymentMethod.credit.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Cartão de Débito</span>
              <span>
                {salesByPaymentMethod.debit.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>PIX</span>
              <span>
                {salesByPaymentMethod.pix.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Vendas Canceladas por Forma de Pagamento</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-red-600">
              <span>Dinheiro</span>
              <span>
                {canceledByPaymentMethod.cash.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Cartão de Crédito</span>
              <span>
                {canceledByPaymentMethod.credit.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Cartão de Débito</span>
              <span>
                {canceledByPaymentMethod.debit.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>PIX</span>
              <span>
                {canceledByPaymentMethod.pix.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Produtos Mais Vendidos</h2>
          <div className="space-y-6">
            {bestSellingProducts.map((product) => (
              <div key={product.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{product.name}</span>
                  <span>{product.quantity} unidades</span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Valor Bruto:</span>
                    <span>
                      {(product.total + product.totalDiscount).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Descontos:</span>
                    <span>
                      {product.totalDiscount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Valor Líquido:</span>
                    <span>
                      {product.total.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Produtos com Estoque Baixo</h2>
          <div className="space-y-4">
            {lowStock.map((product) => (
              <div key={product.id} className="flex justify-between">
                <span>{product.name}</span>
                <span className="text-red-600">{product.stock} unidades</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, highlight }: { title: string; value: string | number; highlight?: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`mt-2 text-3xl font-semibold ${highlight || 'text-gray-900'}`}>{value}</p>
    </div>
  );
}