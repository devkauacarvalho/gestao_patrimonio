// components/features/AssetForm.tsx
import React, { useState, useEffect } from 'react';
import { Asset, HistoryEntry, AssetStatus, HistoryEventType } from '../../types';
import { ASSET_STATUS_OPTIONS, HISTORY_EVENT_TYPE_OPTIONS } from '../../constants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';

interface AssetFormBaseProps {
  asset?: Asset;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface UpdateAssetFormProps extends AssetFormBaseProps {
  mode: 'updateAsset';
  onSubmit: (data: Partial<Omit<Asset, 'historico' | 'ultima_atualizacao'>>) => void;
}

interface AddHistoryFormProps extends AssetFormBaseProps {
  mode: 'addHistory';
  onSubmit: (data: Omit<HistoryEntry, 'id' | 'timestamp' | 'asset_id'>) => void;
}

interface AddAssetFormProps extends AssetFormBaseProps {
  mode: 'addAsset';
  onSubmit: (data: Omit<Asset, 'historico' | 'ultima_atualizacao' | 'id' | 'id_interno' | 'atualizado_por'>) => void;
}

type AssetFormProps = UpdateAssetFormProps | AddHistoryFormProps | AddAssetFormProps;

const AssetForm: React.FC<AssetFormProps> = (props) => {
  const { mode, asset, onSubmit, onCancel, isSubmitting } = props;

  const [nome, setNome] = useState(asset?.nome || '');
  const [numeroSerie, setNumeroSerie] = useState(asset?.numero_serie || '');
  const [modelo, setModelo] = useState(asset?.modelo || '');
  const [localizacao, setLocalizacao] = useState(asset?.localizacao || '');
  const [status, setStatus] = useState<AssetStatus>(asset?.status || AssetStatus.EmOperacao);
  const [dataAquisicao, setDataAquisicao] = useState(asset?.data_aquisicao ? asset.data_aquisicao.split('T')[0] : '');
  const [infoGarantia, setInfoGarantia] = useState(asset?.info_garantia || '');
  const [descricaoAsset, setDescricaoAsset] = useState(asset?.descricao || '');
  const [utilizador, setUtilizador] = useState(asset?.utilizador || ''); // Estado para utilizador

  const [tipoEvento, setTipoEvento] = useState<HistoryEventType>(HistoryEventType.Observacao);
  const [descricaoHistory, setDescricaoHistory] = useState('');

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
      setUtilizador(asset.utilizador || ''); // Popula o campo utilizador ao editar
    } else if (mode === 'addAsset') {
      setNome('');
      setNumeroSerie('');
      setModelo('');
      setLocalizacao('');
      setStatus(AssetStatus.EmOperacao);
      setDataAquisicao('');
      setInfoGarantia('');
      setDescricaoAsset('');
      setUtilizador(''); // Reseta o campo utilizador ao adicionar
    } else if (mode === 'addHistory') {
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
        utilizador, // Inclui utilizador para atualização
      });
    } else if (props.mode === 'addHistory') {
      (props.onSubmit as AddHistoryFormProps['onSubmit'])({
        tipo_evento: tipoEvento,
        descricao: descricaoHistory,
      });
    } else if (props.mode === 'addAsset') {
      (props.onSubmit as AddAssetFormProps['onSubmit'])({
        nome,
        descricao: descricaoAsset,
        numero_serie: numeroSerie,
        modelo,
        localizacao,
        status,
        data_aquisicao: dataAquisicao ? new Date(dataAquisicao).toISOString() : '',
        info_garantia: infoGarantia,
        utilizador, // Inclui utilizador para criação
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(mode === 'updateAsset' || mode === 'addAsset') && (
        <>
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
          <Input label="Utilizador" id="utilizador" value={utilizador} onChange={(e) => setUtilizador(e.target.value)} /> {/* Campo de Input para Utilizador */}
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