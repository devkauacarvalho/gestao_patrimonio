import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { IconQrCode, IconList, IconAdd } from '../../constants.tsx'; // Import IconAdd
import { ACCENT_COLOR_CLASS_TEXT } from '../../constants';

interface HomeScreenProps {
  onAddAsset: () => void; // Function to navigate to add asset screen
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onAddAsset }) => {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <Card className="text-center">
        <div className="p-6">
          <h2 className={`text-2xl font-bold ${ACCENT_COLOR_CLASS_TEXT} mb-2`}>Bem-vindo!</h2>
          <p className="text-slate-600 mb-8">
            Gerencie o patrimônio de forma simples e eficiente.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New button to add a new asset */}
            <Button variant="primary" size="lg" fullWidth leftIcon={<IconAdd className="w-6 h-6" />} onClick={onAddAsset}>
              Adicionar Nova Máquina
            </Button>
            <Link to="/scan">
              <Button variant="primary" size="lg" fullWidth leftIcon={<IconQrCode className="w-6 h-6" />}>
                Escanear QR Code
              </Button>
            </Link>
            <Link to="/assets">
              <Button variant="secondary" size="lg" fullWidth leftIcon={<IconList className="w-6 h-6" />}>
                Ver Todas as Máquinas
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <Card title="Como usar">
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li><strong>Escanear QR Code:</strong> Aponte a câmera para o QR code de uma máquina para ver seus detalhes e histórico. (Simulado com entrada de ID)</li>
            <li><strong>Ver Todas as Máquinas:</strong> Navegue por uma lista completa de todas as máquinas cadastradas.</li>
            <li><strong>Atualizar Dados:</strong> Modifique informações como localização e status.</li>
            <li><strong>Adicionar Histórico:</strong> Registre manutenções, observações e outras ocorrências.</li>
            <li><strong>Adicionar Nova Máquina:</strong> Cadastre um novo item ao patrimônio.</li>
          </ul>
      </Card>
    </div>
  );
};

export default HomeScreen;