import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import { IconQrCode, IconBack, IconCameraOff } from '../../constants.tsx';

interface ScanScreenProps {
  onScan: (id: string) => void;
}

const ScanScreen: React.FC<ScanScreenProps> = ({ onScan }) => {
  const navigate = useNavigate();
  const [assetId, setAssetId] = useState('');
  const [scannerErrorMessage, setScannerErrorMessage] = useState<string | null>(null);

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (assetId.trim()) {
      onScan(assetId.trim());
    }
  };

  const handleDecodeScanner = (result: string) => {
    console.log('QR Code lido:', result);
    onScan(result);
  };

  const handleErrorScanner = (error: any) => {
    console.error('Erro ao aceder à câmara:', error);
    let message = 'Ocorreu um erro ao tentar aceder à câmara.';
    if (error?.name === 'NotAllowedError') {
      message = 'Permissão para aceder à câmara foi negada. Por favor, habilite a permissão nas configurações do seu navegador.';
    } else if (error?.name === 'NotFoundError') {
      message = 'Nenhuma câmara encontrada no dispositivo.';
    } else if (error?.name === 'NotReadableError') {
      message = 'A câmara está a ser utilizada por outra aplicação ou o sistema operativo impediu o acesso.';
    }
    setScannerErrorMessage(message + ' Certifique-se de que está a aceder via HTTPS ou localhost.');
  };

  return (
    <div className="max-w-md mx-auto">
      <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-4"
          leftIcon={<IconBack />}
        >
          Voltar
      </Button>
      <Card title="Identificar Máquina">
        <form onSubmit={handleSubmitManual} className="mb-6 pb-6 border-b border-slate-200">
          <p className="text-sm text-slate-600 mb-3">
            Insira o ID da máquina manualmente:
          </p>
          <Input
            label="ID da Máquina"
            id="assetId"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            placeholder="Ex: MAKEDIST-MAQ-00123"
            required
          />
          <Button type="submit" fullWidth className="mt-3">
            Buscar por ID
          </Button>
        </form>

        <div>
          <p className="text-sm text-slate-600 mb-4 text-center">
            Ou aponte a câmara para o QR code:
          </p>
          {scannerErrorMessage ? (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300 flex items-center">
              <IconCameraOff className="w-5 h-5 mr-2" /> 
              {scannerErrorMessage}
            </div>
          ) : (
            <div className="relative w-full aspect-square overflow-hidden rounded-md border border-slate-300 mb-4 bg-slate-100">
              <Scanner
                onScan={(result) => handleDecodeScanner(result[0].rawValue)}
                onError={handleErrorScanner}
                components={{ onOff: false, torch: false, zoom: false }}
                styles={{
                  container: { width: '100%', height: '100%', paddingTop: '0' },
                  video: { objectFit: 'cover' },
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
            <p><strong>Nota:</strong> O acesso à câmara para leitura de QR Code requer permissão e geralmente funciona apenas em conexões seguras (HTTPS) ou localhost.</p>
        </div>
      </Card>
    </div>
  );
};

export default ScanScreen;