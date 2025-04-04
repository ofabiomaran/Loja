import React, { useState } from 'react';
import { Plus, Edit, Trash2, Image } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Product } from '../types';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const product = {
      id: editingProduct?.id || '',
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      barcode: formData.get('barcode') as string,
      imageUrl: formData.get('imageUrl') as string,
    };

    if (editingProduct) {
      updateProduct(product);
    } else {
      addProduct(product);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 active:bg-blue-800"
        >
          <Plus className="h-5 w-5" />
          Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <Image className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-gray-600">{product.category}</p>
              <div className="mt-2 flex justify-between items-center">
                <p className="font-bold text-lg">
                  {product.price.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
                <p className={`text-sm ${product.stock < 10 ? 'text-red-600' : 'text-gray-600'}`}>
                  Estoque: {product.stock}
                </p>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-blue-600 hover:text-blue-800 active:text-blue-900"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="p-2 text-red-600 hover:text-red-800 active:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingProduct?.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">URL da Imagem</label>
                <input
                  type="url"
                  name="imageUrl"
                  defaultValue={editingProduct?.imageUrl}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoria</label>
                <input
                  type="text"
                  name="category"
                  defaultValue={editingProduct?.category}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Preço</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  defaultValue={editingProduct?.price}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estoque</label>
                <input
                  type="number"
                  name="stock"
                  defaultValue={editingProduct?.stock}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Código de Barras</label>
                <input
                  type="text"
                  name="barcode"
                  defaultValue={editingProduct?.barcode}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800"
                >
                  {editingProduct ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}