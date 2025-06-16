import React, { useState, useEffect } from 'react';
import { Asset, HistoryEntry, AssetStatus, HistoryEventType } from '../../types';
import { ASSET_STATUS_OPTIONS, HISTORY_EVENT_TYPE_OPTIONS } from '../../constants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';

// Define base props common to both modes
interface AssetFormBaseProps {
  asset?: Asset;
  onCancel: () => void;
  isSubmitting?: boolean; // Added to handle loading state in buttons
}

// Define props specific to updating an asset
interface UpdateAssetFormProps extends AssetFormBaseProps {
  mode: 'updateAsset';
  onSubmit: (data: Partial<Omit<Asset, 'historico' | 'ultima_atualizacao'>>) => void; // Only editable asset fields
}

// Define props specific to adding history
interface AddHistoryFormProps extends AssetFormBaseProps {
  mode: 'addHistory';
  onSubmit: (data: Omit<HistoryEntry, 'id' | 'timestamp' | 'asset_id'>) => void; // Only history fields
}

// Define props specific to adding a new asset
interface AddAssetFormProps extends AssetFormBaseProps {
  mode: 'addAsset';
  onSubmit: (data: Omit<Asset, 'historico' | 'ultima_atualizacao' | 'ultima_atualizacao' | 'atualizado_por'>) => void; // All asset fields for creation
}

// Combine props using a discriminated union
type AssetFormProps = UpdateAssetFormProps | AddHistoryFormProps | AddAssetFormProps;

const AssetForm: React.FC<AssetFormProps> = (props) => {
  const { mode, asset, onSubmit, onCancel, isSubmitting } = props;

  // Asset fields
  const [id, setId] = useState(asset?.id || ''); // For addAsset mode
  const [nome, setNome] = useState(asset?.nome || '');
  const [numeroSerie, setNumeroSerie] = useState(asset?.numero_serie || '');
  const [idInterno, setIdInterno] = useState(asset?.id_interno || ''); // For addAsset mode
  const [modelo, setModelo] = useState(asset?.modelo || '');
  const [localizacao, setLocalizacao] = useState(asset?.localizacao || '');
  const [status, setStatus] = useState<AssetStatus>(asset?.status || AssetStatus.EmOperacao);
  const [dataAquisicao, setDataAquisicao] = useState(asset?.data_aquisicao ? asset.data_aquisicao.split('T')[0] : '');
  const [infoGarantia, setInfoGarantia] = useState(asset?.info_garantia || '');
  const [descricaoAsset, setDescricaoAsset] = useState(asset?.descricao || ''); // State for asset description

  // History fields (only relevant for addHistory mode)
  const [tipoEvento, setTipoEvento] = useState<HistoryEventType>(HistoryEventType.Observacao);
  const [descricaoHistory, setDescricaoHistory] = useState(''); // Separate state for history description

  // Effect to reset form based on mode and asset changes
  useEffect(() => {
    if (mode === 'updateAsset' && asset) {
      setNome(asset.nome);
      setNumeroSerie(asset.numero_serie);
      setModelo(asset.modelo);
      setLocalizacao(asset.localizacao);
      setStatus(asset.status);
      setDataAquisicao(asset.data_aquisicao ? asset.data_aquisicao.split('T')[0] : '');
      setInfoGarantia(asset.info_garantia);
      setDescricaoAsset(asset.descricao || '');
    } else if (mode === 'addAsset') {
      // Reset all fields for new asset
      setId('');
      setNome('');
      setNumeroSerie('');
      setIdInterno('');
      setModelo('');
      setLocalizacao('');
      setStatus(AssetStatus.EmOperacao);
      setDataAquisicao('');
      setInfoGarantia('');
      setDescricaoAsset('');
    } else if (mode === 'addHistory') {
      // Reset history fields when switching to addHistory mode
      setTipoEvento(HistoryEventType.Observacao);
      setDescricaoHistory('');
    }
  }, [asset, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (props.mode === 'updateAsset' && asset) {
      (props.onSubmit as UpdateAssetFormProps['onSubmit'])({
        nome,
        descricao: descricaoAsset,
        numero_serie: numeroSerie,
        modelo,
        localizacao,
        status,
        data_aquisicao: dataAquisicao ? new Date(dataAquisicao).toISOString() : '',
        info_garantia: infoGarantia,
      });
    } else if (props.mode === 'addHistory') {
      (props.onSubmit as AddHistoryFormProps['onSubmit'])({
        tipo_evento: tipoEvento,
        descricao: descricaoHistory,
      });
    } else if (props.mode === 'addAsset') {
      (props.onSubmit as AddAssetFormProps['onSubmit'])({
        id,
        nome,
        descricao: descricaoAsset,
        numero_serie: numeroSerie,
        id_interno: idInterno,
        modelo,
        localizacao,
        status,
        data_aquisicao: dataAquisicao ? new Date(dataAquisicao).toISOString() : '',
        info_garantia: infoGarantia,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Render fields based on mode */}
      {(mode === 'updateAsset' || mode === 'addAsset') && (
        <>
          {mode === 'addAsset' && (
            <>
              <Input label="ID da Máquina" id="id" value={id} onChange={(e) => setId(e.target.value)} required />
              <Input label="ID Interno (Legado)" id="idInterno" value={idInterno} onChange={(e) => setIdInterno(e.target.value)} required />
            </>
          )}
          <Input label="Nome da Máquina" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
          <Textarea label="Descrição da Máquina" id="descricaoAsset" value={descricaoAsset} onChange={(e) => setDescricaoAsset(e.target.value)} rows={3} />
          <Input label="Número de Série" id="numeroSerie" value={numeroSerie} onChange={(e) => setNumeroSerie(e.target.value)} />
          <Input label="Modelo" id="modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} required />
          <Input label="Localização Atual" id="localizacao" value={localizacao} onChange={(e) => setLocalizacao(e.target.value)} required />
          <Select
            label="Status"
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as AssetStatus)}
            options={ASSET_STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
            required
          />
          <Input type="date" label="Data de Aquisição" id="dataAquisicao" value={dataAquisicao} onChange={(e) => setDataAquisicao(e.target.value)} required />
          <Textarea label="Informações de Garantia" id="infoGarantia" value={infoGarantia} onChange={(e) => setInfoGarantia(e.target.value)} />
        </>
      )}

      {mode === 'addHistory' && (
        <>
          <Select
            label="Tipo de Evento"
            id="tipoEvento"
            value={tipoEvento}
            onChange={(e) => setTipoEvento(e.target.value as HistoryEventType)}
            options={HISTORY_EVENT_TYPE_OPTIONS.map(type => ({ value: type, label: type }))}
            required
          />
          <Textarea label="Descrição do Evento/Observação" id="descricaoHistory" value={descricaoHistory} onChange={(e) => setDescricaoHistory(e.target.value)} required />
        </>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};

export default AssetForm;