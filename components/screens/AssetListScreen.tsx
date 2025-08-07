import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Asset, Category } from '../../types';
import AssetListItem from '../features/AssetListItem';
import Input from '../ui/Input';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { IconSearch, IconBack } from '../../constants.tsx';

interface AssetListScreenProps {
  assets: Asset[];
  categories: Category[];
}

const AssetListScreen: React.FC<AssetListScreenProps> = ({ assets, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleCategoryFilterClick = (categoryId: number | null) => {
    setSelectedCategoryId(prevId => (prevId === categoryId ? null : categoryId));
  };

  const filteredAssets = useMemo(() => {
    let currentFiltered = assets;

    if (searchTerm) {
      currentFiltered = currentFiltered.filter(
        asset =>
          asset.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.localizacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.utilizador?.toLowerCase().includes(searchTerm.toLowerCase()) // ADICIONADO: busca por utilizador
      );
    }

    if (selectedCategoryId !== null) {
      currentFiltered = currentFiltered.filter(asset => asset.category_id === selectedCategoryId);
    }

    return currentFiltered;
  }, [assets, searchTerm, selectedCategoryId]);

  return (
    <div className="max-w-3xl mx-auto">
       <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
          leftIcon={<IconBack />}
        >
          Voltar
      </Button>
      <Card>
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-700 mb-1">Lista de Máquinas</h2>
          <p className="text-sm text-slate-500">Total de máquinas: {assets.length}</p>

          <div className="mt-4 relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconSearch className="text-slate-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por nome, ID, modelo, localização, categoria, utilizador..." // ADICIONADO: utilizador no placeholder
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 !mt-0"
              containerClassName="!mb-0"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedCategoryId === null ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleCategoryFilterClick(null)}
            >
              Todas as Categorias
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategoryId === category.id ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleCategoryFilterClick(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
        {filteredAssets.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {filteredAssets.map(asset => (
              <AssetListItem key={asset.id} asset={asset} />
            ))}
          </div>
        ) : (
          <p className="p-4 text-center text-slate-500">
            {searchTerm || selectedCategoryId !== null ? "Nenhuma máquina encontrada com os critérios de busca." : "Nenhuma máquina cadastrada."}
          </p>
        )}
      </Card>
    </div>
  );
};

export default AssetListScreen;