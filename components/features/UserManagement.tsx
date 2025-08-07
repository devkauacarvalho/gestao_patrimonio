import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { IconEdit, IconDelete, IconUserAdd } from '../../constants.tsx';

interface UserManagementProps {
  apiBaseUrl: string;
  getAuthHeaders: () => Record<string, string>;
  handleLogout: () => void;
  currentUser: User | null;
}

const UserManagement: React.FC<UserManagementProps> = ({ apiBaseUrl, getAuthHeaders, handleLogout, currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para os modais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Estados para formulário de edição
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');

  // Estados para formulário de adição
  const [addUsername, setAddUsername] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addConfirmPassword, setAddConfirmPassword] = useState('');
  const [addRole, setAddRole] = useState('user');
  
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/users`, { headers: getAuthHeaders() });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) handleLogout();
        throw new Error(`Erro ao buscar usuários: ${response.statusText}`);
      }
      const data: User[] = await response.json();
      setUsers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, getAuthHeaders, handleLogout]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditUsername(user.username);
    setEditRole(user.role);
    setEditNewPassword('');
    setEditConfirmPassword('');
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const openAddModal = () => {
    setAddUsername('');
    setAddPassword('');
    setAddConfirmPassword('');
    setAddRole('user');
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedUser(null);
    setError(null);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ username: editUsername, role: editRole }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Falha ao atualizar usuário');
      }

      if (editNewPassword) {
        if (editNewPassword !== editConfirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        const passResponse = await fetch(`${apiBaseUrl}/api/auth/users/${selectedUser.id}/password`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ password: editNewPassword }),
        });
        if (!passResponse.ok) {
          const errData = await passResponse.json();
          throw new Error(errData.message || 'Falha ao atualizar a senha');
        }
      }

      closeModal();
      fetchUsers();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Falha ao excluir usuário');
      }
      closeModal();
      fetchUsers();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (addPassword !== addConfirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ username: addUsername, password: addPassword, role: addRole }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Falha ao criar usuário.');
      }

      closeModal();
      fetchUsers(); 
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Carregando usuários...</p>;

  return (
    <Card>
      <div className="p-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-700">Gerenciamento de Usuários</h2>
        <Button variant="primary" size="sm" onClick={openAddModal} leftIcon={<IconUserAdd />}>
          Adicionar Usuário
        </Button>
      </div>

      {error && !isAddModalOpen && !isEditModalOpen && <div className="p-4 bg-red-100 border-t border-red-200 text-red-700">{error}</div>}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Papel (Role)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Button variant="secondary" size="sm" onClick={() => openEditModal(user)} leftIcon={<IconEdit />}>Editar</Button>
                  <Button variant="danger" size="sm" onClick={() => openDeleteModal(user)} leftIcon={<IconDelete />} disabled={currentUser?.id === user.id}>Excluir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={closeModal} title="Adicionar Novo Usuário">
        <form onSubmit={handleAddNewUser} className="space-y-4">
          <Input label="Nome de Usuário" id="addUsername" value={addUsername} onChange={(e) => setAddUsername(e.target.value)} required />
          <Select
            label="Papel (Role)"
            id="addRole"
            value={addRole}
            onChange={(e) => setAddRole(e.target.value)}
            options={[{ value: 'user', label: 'User' }, { value: 'admin', label: 'Admin' }]}
            required
          />
          <Input label="Senha" id="addPassword" type="password" value={addPassword} onChange={(e) => setAddPassword(e.target.value)} required />
          <Input label="Confirmar Senha" id="addConfirmPassword" type="password" value={addConfirmPassword} onChange={(e) => setAddConfirmPassword(e.target.value)} required />
          
          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Criando...' : 'Criar Usuário'}</Button>
          </div>
        </form>
      </Modal>

      {selectedUser && (
        <Modal isOpen={isEditModalOpen} onClose={closeModal} title={`Editar Usuário: ${selectedUser.username}`}>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <Input label="Nome de Usuário" id="editUsername" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} required />
            <Select
              label="Papel (Role)"
              id="editRole"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              options={[{ value: 'admin', label: 'Admin' }, { value: 'user', label: 'User' }]}
              disabled={currentUser?.id === selectedUser.id}
            />
            <p className="text-sm font-semibold pt-4 border-t border-slate-200">Alterar Senha (opcional)</p>
            <Input label="Nova Senha" id="editNewPassword" type="password" value={editNewPassword} onChange={(e) => setEditNewPassword(e.target.value)} />
            <Input label="Confirmar Nova Senha" id="editConfirmPassword" type="password" value={editConfirmPassword} onChange={(e) => setEditConfirmPassword(e.target.value)} />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {selectedUser && (
        <Modal isOpen={isDeleteModalOpen} onClose={closeModal} title="Confirmar Exclusão" size="sm">
          <p>Tem certeza que deseja excluir o usuário <span className="font-bold">{selectedUser.username}</span>?</p>
          <p className="text-sm text-red-600 my-2">Esta ação é irreversível.</p>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>Cancelar</Button>
            <Button type="button" variant="danger" onClick={handleDeleteUser} disabled={isSubmitting}>{isSubmitting ? 'Excluindo...' : 'Excluir'}</Button>
          </div>
        </Modal>
      )}
    </Card>
  );
};

export default UserManagement;
