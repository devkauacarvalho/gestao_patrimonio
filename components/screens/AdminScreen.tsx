import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../types';
import UserManagement from '../features/UserManagement';
import CategoryManagement from '../features/CategoryManagement'; // NOVO: Importa o componente de categorias
import { ACCENT_COLOR_CLASS_TEXT} from '../../constants';
import { IconUsers, IconCategory, IconQrCode, IconTrash, IconBack } from '../../constants.tsx';
import Button from '../ui/Button';

interface AdminScreenProps {
  apiBaseUrl: string;
  getAuthHeaders: () => Record<string, string>;
  handleLogout: () => void;
  currentUser: User | null;
}

type AdminView = 'users' | 'categories' | 'qrcodes' | 'deleted';

const AdminScreen: React.FC<AdminScreenProps> = (props) => {
  const [activeView, setActiveView] = useState<AdminView>('users');
  const navigate = useNavigate();

  const renderActiveView = () => {
    switch (activeView) {
      case 'users':
        return <UserManagement {...props} />;
      case 'categories': 
        return <CategoryManagement {...props} />;
      case 'qrcodes':
        return <Placeholder title="Visualização de QR Codes" />;
      case 'deleted':
        return <Placeholder title="Itens Excluídos" />;
      default:
        return <UserManagement {...props} />;
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-4"
        leftIcon={<IconBack />}
      >
        Voltar para o Início
      </Button>

      <h1 className="text-3xl font-bold text-slate-800 mb-6">Painel do Administrador</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="md:col-span-1">
          <nav className="flex flex-col space-y-2">
            <AdminMenuButton
              label="Usuários"
              icon={<IconUsers />}
              isActive={activeView === 'users'}
              onClick={() => setActiveView('users')}
            />
            <AdminMenuButton
              label="Categorias"
              icon={<IconCategory />}
              isActive={activeView === 'categories'}
              onClick={() => setActiveView('categories')}
            />
            <AdminMenuButton
              label="QR Codes"
              icon={<IconQrCode />}
              isActive={activeView === 'qrcodes'}
              onClick={() => setActiveView('qrcodes')}
            />
            <AdminMenuButton
              label="Excluídos"
              icon={<IconTrash />}
              isActive={activeView === 'deleted'}
              onClick={() => setActiveView('deleted')}
            />
          </nav>
        </div>

        <div className="md:col-span-3">
          {renderActiveView()}
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para os botões do menu
interface AdminMenuButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const AdminMenuButton: React.FC<AdminMenuButtonProps> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = `bg-teal-100 ${ACCENT_COLOR_CLASS_TEXT} font-semibold`;
  const inactiveClasses = 'text-slate-600 hover:bg-slate-100 hover:text-slate-800';

  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full text-left px-4 py-2.5 text-sm rounded-lg transition-colors duration-150 ${isActive ? activeClasses : inactiveClasses}`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </button>
  );
};

// Componente para as seções em construção
const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-6 bg-white rounded-lg shadow-md text-center">
    <h2 className="text-xl font-semibold text-slate-700">{title}</h2>
    <p className="mt-2 text-slate-500">Esta seção está em construção.</p>
  </div>
);

export default AdminScreen;
