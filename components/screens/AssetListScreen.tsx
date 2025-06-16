
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Asset } from '../../types';
import AssetListItem from '../features/AssetListItem';
import Input from '../ui/Input';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { IconSearch, IconBack } from '../../constants.tsx';

interface AssetListScreenProps {
  assets: Asset[];
}

const AssetListScreen: React.FC<AssetListScreenProps> = ({ assets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredAssets = useMemo(() => {
    if (!searchTerm) return assets;
    return assets.filter(
      asset =>
        asset.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assets, searchTerm]);

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
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconSearch className="text-slate-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar por nome, ID, modelo, localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 !mt-0" // Override margin-top from Input component and add padding for icon
              containerClassName="!mb-0" // Override margin-bottom from Input component
            />
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
            {searchTerm ? "Nenhuma máquina encontrada com os critérios de busca." : "Nenhuma máquina cadastrada."}
          </p>
        )}
      </Card>
    </div>
  );
};

export default AssetListScreen;
