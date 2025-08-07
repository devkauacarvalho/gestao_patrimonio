import React, { useState, useEffect, useCallback } from 'react';
import { Category } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import { IconEdit, IconDelete, IconCategory } from '../../constants.tsx';

interface CategoryManagementProps {
  apiBaseUrl: string;
  getAuthHeaders: () => Record<string, string>;
  handleLogout: () => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ apiBaseUrl, getAuthHeaders, handleLogout }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados dos modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Estados dos formulários
  const [categoryName, setCategoryName] = useState('');
  const [categoryPrefix, setCategoryPrefix] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/assets/categories`, { headers: getAuthHeaders() });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) handleLogout();
        throw new Error(`Erro ao buscar categorias: ${response.statusText}`);
      }
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, getAuthHeaders, handleLogout]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const closeModal = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedCategory(null);
    setError(null);
  };

  const openAddModal = () => {
    setCategoryName('');
    setCategoryPrefix('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/assets/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ name: categoryName, prefix: categoryPrefix.toUpperCase().trim() }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Falha ao adicionar categoria.');
      }
      closeModal();
      fetchCategories();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/assets/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ name: categoryName }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Falha ao editar categoria.');
      }
      closeModal();
      fetchCategories();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/assets/categories/${selectedCategory.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Falha ao excluir categoria.');
      }
      closeModal();
      fetchCategories();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Carregando categorias...</p>;

  return (
    <Card>
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-700">Gerenciamento de Categorias</h2>
            <Button variant="primary" size="sm" onClick={openAddModal} leftIcon={<IconCategory />}>
                Adicionar Categoria
            </Button>
        </div>

        {error && !isAddModalOpen && !isEditModalOpen && !isDeleteModalOpen && <div className="p-4 bg-red-100 border-t border-red-200 text-red-700">{error}</div>}

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Prefixo</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {categories.map((category) => (
                        <tr key={category.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{category.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{category.prefix}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <Button variant="secondary" size="sm" onClick={() => openEditModal(category)} leftIcon={<IconEdit />}>Editar</Button>
                                <Button variant="danger" size="sm" onClick={() => openDeleteModal(category)} leftIcon={<IconDelete />}>Excluir</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <Modal isOpen={isAddModalOpen} onClose={closeModal} title="Adicionar Nova Categoria">
            <form onSubmit={handleAddCategory} className="space-y-4">
                <Input label="Nome da Categoria" id="addCategoryName" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
                <Input label="Prefixo (3-4 letras, ex: NOTE, IMP)" id="addCategoryPrefix" value={categoryPrefix} onChange={(e) => setCategoryPrefix(e.target.value.toUpperCase().trim())} required maxLength={4} />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Adicionando...' : 'Adicionar'}</Button>
                </div>
            </form>
        </Modal>

        {selectedCategory && (
            <Modal isOpen={isEditModalOpen} onClose={closeModal} title={`Editar Categoria: ${selectedCategory.name}`}>
                <form onSubmit={handleEditCategory} className="space-y-4">
                    <Input label="Nome da Categoria" id="editCategoryName" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required />
                    <Input label="Prefixo" id="editCategoryPrefix" value={selectedCategory.prefix} disabled />
                    <p className="text-xs text-slate-500 -mt-2">O prefixo não pode ser alterado após a criação.</p>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>Cancelar</Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
                    </div>
                </form>
            </Modal>
        )}

        {selectedCategory && (
            <Modal isOpen={isDeleteModalOpen} onClose={closeModal} title="Confirmar Exclusão">
                <p>Tem certeza que deseja excluir a categoria <span className="font-bold">{selectedCategory.name}</span>?</p>
                <p className="text-sm text-red-600 my-2">Esta ação só é permitida se nenhuma máquina estiver usando esta categoria.</p>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="button" variant="danger" onClick={handleDeleteCategory} disabled={isSubmitting}>{isSubmitting ? 'Excluindo...' : 'Confirmar Exclusão'}</Button>
                </div>
            </Modal>
        )}
    </Card>
  );
};

export default CategoryManagement;
