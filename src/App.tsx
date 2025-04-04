import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Store, Package, ShoppingCart, BarChart, DollarSign, Menu, X, Settings as SettingsIcon } from 'lucide-react';
import Products from './pages/Products';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import NewSale from './pages/NewSale';
import CashRegister from './pages/CashRegister';
import Settings from './pages/Settings';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed top-4 right-4 z-50 bg-white p-2 rounded-lg shadow-lg"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Sidebar */}
        <nav className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:static
          top-0 left-0
          h-full
          w-64
          bg-white shadow-lg
          transition-transform duration-300
          z-40
          md:z-auto
        `}>
          <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Store className="h-8 w-8 text-blue-600" />
              Sistema PDV
            </h1>
          </div>
          <div className="mt-8" onClick={() => setIsMobileMenuOpen(false)}>
            <NavLink to="/cash-register" icon={<DollarSign />} text="Caixa" />
            <NavLink to="/products" icon={<Package />} text="Produtos" />
            <NavLink to="/new-sale" icon={<ShoppingCart />} text="Nova Venda" />
            <NavLink to="/sales" icon={<Store />} text="Vendas" />
            <NavLink to="/reports" icon={<BarChart />} text="Relatórios" />
            <NavLink to="/settings" icon={<SettingsIcon />} text="Configurações" />
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8">
            <Routes>
              <Route path="/products" element={<Products />} />
              <Route path="/new-sale" element={<NewSale />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/cash-register" element={<CashRegister />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/" element={<CashRegister />} />
            </Routes>
          </main>
          
          {/* Footer */}
          <footer className="bg-white border-t py-4 px-8 text-center text-gray-600">
            Desenvolvido por: Fabio Maran
          </footer>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

function NavLink({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors active:bg-blue-100"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}

export default App;