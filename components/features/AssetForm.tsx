// components/features/AssetForm.tsx
import React, { useState, useEffect } from 'react';
import { Asset, HistoryEntry, AssetStatus, HistoryEventType, Category } from '../../types'; // Importar Category
import { ASSET_STATUS_OPTIONS, HISTORY_EVENT_TYPE_OPTIONS } from '../../constants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';

interface AssetFormBaseProps {
  asset?: Asset;
  onCancel: () => void;
  isSubmitting?: boolean;
  categories: Category[]; // NOVO: Recebe a lista de categorias
  onAddCategory: (name: string, prefix: string) => Promise<Category | null>; // NOVO: Função para adicionar nova categoria
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
  const { mode, asset, onSubmit, onCancel, isSubmitting, categories, onAddCategory } = props; // Desestruturar novas props

  const [nome, setNome] = useState(asset?.nome || '');
  const [numeroSerie, setNumeroSerie] = useState(asset?.numero_serie || '');
  const [modelo, setModelo] = useState(asset?.modelo || '');
  const [localizacao, setLocalizacao] = useState(asset?.localizacao || '');
  const [status, setStatus] = useState<AssetStatus>(asset?.status || AssetStatus.EmOperacao);
  const [dataAquisicao, setDataAquisicao] = useState(asset?.data_aquisicao ? asset.data_aquisicao.split('T')[0] : '');
  const [infoGarantia, setInfoGarantia] = useState(asset?.info_garantia || '');
  const [descricaoAsset, setDescricaoAsset] = useState(asset?.descricao || '');
  const [utilizador, setUtilizador] = useState(asset?.utilizador || '');
  const [selectedCategory, setSelectedCategory] = useState<number | string>(asset?.category_id || ''); // NOVO: Estado para categoria selecionada
  const [newCategoryName, setNewCategoryName] = useState(''); // NOVO: Estado para nome da nova categoria
  const [newCategoryPrefix, setNewCategoryPrefix] = useState(''); // NOVO: Estado para prefixo da nova categoria
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false); // NOVO: Estado para mostrar input de nova categoria


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
      setUtilizador(asset.utilizador || '');
      setSelectedCategory(asset.category_id || ''); // Popula categoria ao editar
      setShowNewCategoryInput(false); // Esconde input de nova categoria
    } else if (mode === 'addAsset') {
      setNome('');
      setNumeroSerie('');
      setModelo('');
      setLocalizacao('');
      setStatus(AssetStatus.EmOperacao);
      setDataAquisicao('');
      setInfoGarantia('');
      setDescricaoAsset('');
      setUtilizador('');
      setSelectedCategory(''); // Reseta categoria ao adicionar
      setNewCategoryName('');
      setNewCategoryPrefix('');
      setShowNewCategoryInput(false);
    } else if (mode === 'addHistory') {
      setTipoEvento(HistoryEventType.Observacao);
      setDescricaoHistory('');
    }
  }, [asset, mode]);

  const handleSubmit = async (e: React.FormEvent) => { // Tornar handleSubmit assíncrono
    e.preventDefault();

    let finalCategoryId = selectedCategory;

    if (showNewCategoryInput && newCategoryName && newCategoryPrefix) {
      // Tentar adicionar a nova categoria
      const addedCategory = await onAddCategory(newCategoryName, newCategoryPrefix);
      if (addedCategory) {
        finalCategoryId = addedCategory.id;
      } else {
        // Se falhar ao adicionar categoria, não prosseguir com a submissão do ativo
        return;
      }
    }

    if (!finalCategoryId && (mode === 'addAsset' || mode === 'updateAsset')) {
      alert("Por favor, selecione ou adicione uma categoria.");
      return;
    }

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
        utilizador,
        category_id: finalCategoryId as number, // Inclui category_id
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
        utilizador,
        category_id: finalCategoryId as number, // Inclui category_id
      });
    }
  };

  const statusOptions = ASSET_STATUS_OPTIONS.map(statusValue => ({
    value: statusValue,
    label: statusValue
  }));

  const categoryOptions = categories.map(cat => ({
    value: cat.id.toString(), // Convertendo para string para o Select
    label: cat.name
  }));

  // Adiciona a opção "Adicionar nova categoria" no final
  const allCategoryOptions = [...categoryOptions, { value: 'addNew', label: 'Adicionar nova categoria' }];


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
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as AssetStatus)}
            options={statusOptions}
            required
          />

          {/* NOVO: Campo de seleção de Categoria */}
          <Select
            label="Categoria"
            id="category"
            name="category_id" // Nome do campo para o payload
            value={selectedCategory.toString()} // Converte para string para o Select
            onChange={(e) => {
              if (e.target.value === 'addNew') {
                setShowNewCategoryInput(true);
                setSelectedCategory(''); // Limpa a seleção para não ficar "addNew"
              } else {
                setShowNewCategoryInput(false);
                setSelectedCategory(parseInt(e.target.value)); // Converte de volta para número
              }
            }}
            options={allCategoryOptions}
            required
            placeholder="Selecione uma categoria"
          />

          {/* NOVO: Input para nova categoria (visível condicionalmente) */}
          {showNewCategoryInput && (
            <>
              <Input
                label="Nome da Nova Categoria"
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
              <Input
                label="Prefixo da Nova Categoria (Ex: PC, NOTE)"
                id="newCategoryPrefix"
                value={newCategoryPrefix}
                onChange={(e) => setNewCategoryPrefix(e.target.value.toUpperCase())} // Prefixo em maiúsculas
                required
              />
            </>
          )}

          <Input type="date" label="Data de Aquisição" id="dataAquisicao" value={dataAquisicao} onChange={(e) => setDataAquisicao(e.target.value)} required />
          <Textarea label="Informações de Garantia" id="infoGarantia" value={infoGarantia} onChange={(e) => setInfoGarantia(e.target.value)} />
          <Input label="Utilizador" id="utilizador" value={utilizador} onChange={(e) => setUtilizador(e.target.value)} />
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