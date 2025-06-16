import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Asset, HistoryEntry, AssetStatus } from '../../types';
import { ACCENT_COLOR_CLASS_TEXT } from '../../constants';
import { IconBack, IconEdit, IconAdd, IconTime, IconSave, IconCancel, IconQrCode } from '../../constants.tsx'; // Importar IconQrCode
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import AssetForm from '../features/AssetForm';
import HistoryList from '../features/HistoryList';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import QRCodeGenerator from '../features/QRCodeGenerator'; // Importar o novo componente

// Define props for viewing/editing an existing asset
interface ViewEditAssetProps {
  mode?: 'view' | 'updateAsset';
  onUpdateAsset: (updatedAsset: Omit<Asset, 'historico' | 'ultima_atualizacao'>) => Promise<boolean>;
  onAddHistoryEntry: (assetId: string, entry: Omit<HistoryEntry, 'id' | 'timestamp' | 'asset_id'>) => Promise<boolean>;
  assetId?: string;
  onAddAsset?: never;
}

// Define props for adding a new asset
interface AddNewAssetProps {
  mode: 'addAsset';
  onAddAsset: (newAsset: Omit<Asset, 'historico' | 'ultima_atualizacao'>) => Promise<boolean>;
  onUpdateAsset?: (updatedAsset: Omit<Asset, 'historico' | 'ultima_atualizacao'>) => Promise<boolean>;
  onAddHistoryEntry?: (assetId: string, entry: Omit<HistoryEntry, 'id' | 'timestamp' | 'asset_id'>) => Promise<boolean>;
  assetId?: never;
}

type AssetDetailScreenProps = (ViewEditAssetProps | AddNewAssetProps) & {
  apiBaseUrl: string;
};

const getStatusPillClasses = (status: AssetStatus | string) => {
  switch (status) {
    case AssetStatus.EmOperacao: return `bg-green-100 text-green-700 border-green-300`;
    case AssetStatus.EmManutencao: return `bg-yellow-100 text-yellow-700 border-yellow-300`;
    case AssetStatus.AguardandoPecas: return `bg-orange-100 text-orange-700 border-orange-300`;
    case AssetStatus.ForaDeUso: return `bg-red-100 text-red-700 border-red-300`;
    default: return `bg-slate-100 text-slate-700 border-slate-300`;
  }
};

const AssetDetailScreen: React.FC<AssetDetailScreenProps> = (props) => {
  const { onUpdateAsset, onAddHistoryEntry, onAddAsset, apiBaseUrl } = props;
  const { assetId: paramAssetId } = useParams<{ assetId: string }>();

  const navigate = useNavigate();

  const currentAssetId = props.mode === 'addAsset' ? undefined : paramAssetId;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(props.mode === 'addAsset');
  const [editFormData, setEditFormData] = useState<Partial<Asset>>({});

  const [isAddHistoryModalOpen, setIsAddHistoryModalOpen] = useState(false);
  const [isViewHistoryModalOpen, setIsViewHistoryModalOpen] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false); // Novo estado para o modal do QR Code
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssetDetails = useCallback(async () => {
    if (!currentAssetId) {
      setLoading(false);
      setAsset(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBaseUrl}/api/assets/${currentAssetId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Máquina não encontrada.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      const data: Asset = await response.json();
      setAsset({ ...data, historico: data.historico || [] });
      setEditFormData({
        nome: data.nome,
        descricao: data.descricao,
        localizacao: data.localizacao,
        status: data.status,
      });
    } catch (e: any) {
      console.error("Erro ao buscar detalhes do ativo:", e);
      setError(e.message || "Falha ao carregar dados da máquina.");
      setAsset(null);
    } finally {
      setLoading(false);
    }
  }, [currentAssetId, apiBaseUrl]);

  useEffect(() => {
    fetchAssetDetails();
  }, [fetchAssetDetails]);

  const handleEditToggle = () => {
    if (isEditing && asset) {
      setEditFormData({
        nome: asset.nome,
        descricao: asset.descricao,
        localizacao: asset.localizacao,
        status: asset.status,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!asset) return;
    setIsSubmitting(true);
    setError(null);

    const updatePayload: Omit<Asset, 'historico' | 'ultima_atualizacao'> = {
        id: asset.id,
        nome: editFormData.nome || asset.nome,
        descricao: editFormData.descricao,
        localizacao: editFormData.localizacao || '',
        status: editFormData.status || asset.status,
        data_aquisicao: asset.data_aquisicao,
        id_interno: asset.id_interno,
        info_garantia: asset.info_garantia,
        modelo: asset.modelo,
        numero_serie: asset.numero_serie,
    };

    const success = await (onUpdateAsset?.(updatePayload));
    setIsSubmitting(false);

    if (success) {
      setIsEditing(false);
      fetchAssetDetails();
    } else {
      setError("Falha ao salvar alterações.");
    }
  };

  const handleAddNewAssetSubmit = async (data: Omit<Asset, 'historico' | 'ultima_atualizacao' | 'ultima_atualizacao' | 'atualizado_por'>) => {
    setIsSubmitting(true);
    setError(null);
    const success = await (onAddAsset?.(data));
    setIsSubmitting(false);
    if (success) {
      navigate(`/asset/${data.id}`, { replace: true });
    } else {
       setError("Falha ao adicionar nova máquina.");
    }
  };


  const handleAddHistorySubmit = async (data: Omit<HistoryEntry, 'id' | 'timestamp' | 'asset_id'>) => {
    if (!asset) return;
    setIsSubmitting(true);
    const success = await (onAddHistoryEntry?.(asset.id, data));
    setIsSubmitting(false);
    if (success) {
      setIsAddHistoryModalOpen(false);
      fetchAssetDetails();
    } else {
       setError("Falha ao adicionar histórico.");
    }
  };

  const formatDate = (isoString?: string | null, includeTime = false) => {
    if (!isoString) return 'N/A';
    try {
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.second = '2-digit';
        options.timeZoneName = 'short';
      }
      return new Date(isoString).toLocaleString('pt-BR', options);
    } catch (e) {
      return 'Data Inválida';
    }
  };

  // --- Render Logic ---

  if (loading && props.mode !== 'addAsset') {
    return <div className="text-center py-10">Carregando dados da máquina...</div>;
  }

  if (error && props.mode !== 'addAsset') {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-red-600">Erro ao Carregar</h2>
        <p className="text-slate-500 mt-2">{error}</p>
        <Button onClick={() => navigate('/assets')} className="mt-6" variant="secondary">
          Ver Todas as Máquinas
        </Button>
      </div>
    );
  }

  if (!asset && props.mode !== 'addAsset') {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-red-600">Máquina não encontrada.</h2>
        <Button onClick={() => navigate('/assets')} className="mt-6" variant="primary">
          Ver Todas as Máquinas
        </Button>
      </div>
    );
  }

  const sortedHistory = asset ? [...(asset.historico || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : [];
  const historyPreview = sortedHistory.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-0 self-start"
        leftIcon={<IconBack />}
      >
        Voltar
      </Button>

      {error && !loading && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Erro: </strong>
            <span className="block sm:inline">{error}</span>
            <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-500">X</button>
          </div>
      )}

      <Card
        title={props.mode === 'addAsset' ? 'Adicionar Nova Máquina' : (isEditing ? 'Editando Máquina:' : asset?.nome)}
        titleClassName={`!text-2xl ${ACCENT_COLOR_CLASS_TEXT}`}
        actions={props.mode !== 'addAsset' && (
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button variant="secondary" size="sm" onClick={handleEditToggle} leftIcon={<IconCancel />} disabled={isSubmitting}>Cancelar</Button>
                <Button variant="primary" size="sm" onClick={handleSaveChanges} leftIcon={<IconSave />} disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={handleEditToggle} leftIcon={<IconEdit />}>Editar</Button>
                <Button variant="primary" size="sm" onClick={() => setIsAddHistoryModalOpen(true)} leftIcon={<IconAdd />}>+ Histórico</Button>
                {/* Novo botão para gerar QR Code */}
                <Button variant="ghost" size="sm" onClick={() => setIsQRCodeModalOpen(true)} leftIcon={<IconQrCode />}>QR Code</Button>
              </>
            )}
          </div>
        )}
      >
        {props.mode === 'addAsset' ? (
          <AssetForm mode="addAsset" onSubmit={handleAddNewAssetSubmit} onCancel={() => navigate(-1)} isSubmitting={isSubmitting} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            {isEditing ? (
              <Input label="Nome" name="nome" value={editFormData.nome || ''} onChange={handleInputChange} required />
            ) : (
              <InfoItem label="Nome" value={asset?.nome} />
            )}
            {isEditing ? (
              <Textarea label="Descrição" name="descricao" value={editFormData.descricao || ''} onChange={handleInputChange} rows={3} />
            ) : (
              <InfoItem label="Descrição" value={asset?.descricao} />
            )}
            {isEditing ? (
              <Input label="Localização Atual" name="localizacao" value={editFormData.localizacao || ''} onChange={handleInputChange} />
            ) : (
              <InfoItem label="Localização Atual" value={asset?.localizacao} />
            )}
            {isEditing ? (
              <Select
                label="Status"
                name="status"
                value={editFormData.status || ''}
                onChange={handleInputChange}
                required options={[]}            >
                <option value="" disabled>Selecione...</option>
                {Object.values(AssetStatus).map(statusValue => (
                  <option key={statusValue} value={statusValue}>{statusValue}</option>
                ))}
              </Select>
            ) : (
               <div>
                <strong className="block text-slate-500">Status:</strong>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusPillClasses(asset?.status || '')}`}>
                  {asset?.status}
                </span>
              </div>
            )}
            <InfoItem label="ID (Interno/Externo)" value={asset?.id} />
            <InfoItem label="ID Interno (Legado)" value={asset?.id_interno} />
            <InfoItem label="Número de Série" value={asset?.numero_serie} />
            <InfoItem label="Modelo" value={asset?.modelo} />
            <InfoItem label="Data de Aquisição" value={formatDate(asset?.data_aquisicao)} />
            <InfoItem label="Informações de Garantia" value={asset?.info_garantia} />
            <InfoItem label="Última Atualização" value={formatDate(asset?.ultima_atualizacao, true)} icon={<IconTime className="text-slate-400"/>} />
          </div>
        )}
      </Card>

      {props.mode !== 'addAsset' && (
        <Card title="Histórico Recente">
          {historyPreview.length > 0 ? (
            <>
              <HistoryList history={historyPreview} />
              {sortedHistory.length > 3 && (
                <div className="mt-4 text-center">
                  <Button variant="ghost" onClick={() => setIsViewHistoryModalOpen(true)}>
                    Ver Histórico Completo ({sortedHistory.length} entradas)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-500 text-center py-4">Nenhum histórico registrado para esta máquina.</p>
          )}
        </Card>
      )}

      {/* Modals */}
      <Modal isOpen={isAddHistoryModalOpen} onClose={() => setIsAddHistoryModalOpen(false)} title={`Adicionar Histórico: ${asset?.nome || ''}`} size="md">
        <AssetForm mode="addHistory" onSubmit={handleAddHistorySubmit} onCancel={() => setIsAddHistoryModalOpen(false)} isSubmitting={isSubmitting} />
      </Modal>

      <Modal isOpen={isViewHistoryModalOpen} onClose={() => setIsViewHistoryModalOpen(false)} title={`Histórico Completo: ${asset?.nome || ''}`} size="lg">
        <HistoryList history={sortedHistory} />
      </Modal>

      <Modal isOpen={isQRCodeModalOpen} onClose={() => setIsQRCodeModalOpen(false)} title={``} size="sm">
        {asset?.id ? (
          <div className="flex flex-col items-center">
            <QRCodeGenerator value={asset.id} size={256} className="mb-4" /> {/* Aumenta o tamanho para melhor leitura */}
            <p className="text-center text-slate-600 text-sm">ID: <span className="font-semibold">{asset.id}</span></p>
            <p className="text-center text-slate-600 text-sm">Nome: <span className="font-semibold">{asset.nome}</span></p>
            <div className="mt-4">
              {/* Adicione a classe 'hide-on-print' aqui */}
              <Button onClick={() => window.print()} variant="secondary" className="hide-on-print">Imprimir QR Code</Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-500">ID do ativo não disponível para gerar QR Code.</p>
        )}
      </Modal>
    </div>
  );
};

interface InfoItemProps {
  label: string;
  value?: string | React.ReactNode | null;
  icon?: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon }) => (
  <div>
    <strong className="block text-slate-500 flex items-center">
      {icon && <span className="mr-1.5">{icon}</span>}
      {label}:
    </strong>
    <span className="text-slate-700">{value !== null && value !== undefined && value !== '' ? value : 'N/A'}</span>
  </div>
);

export default AssetDetailScreen;