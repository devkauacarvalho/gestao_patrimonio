import React from 'react';
import { Link } from 'react-router-dom';
import { Asset, AssetStatus } from '../../types';
import { ACCENT_COLOR_CLASS_TEXT } from '../../constants';

interface AssetListItemProps {
  asset: Asset;
}

const getStatusColor = (status: AssetStatus): string => {
  switch (status) {
    case AssetStatus.EmOperacao:
      return 'bg-green-100 text-green-800';
    case AssetStatus.EmManutencao:
      return 'bg-yellow-100 text-yellow-800';
    case AssetStatus.AguardandoPecas:
      return 'bg-orange-100 text-orange-800';
    case AssetStatus.ForaDeUso:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

const AssetListItem: React.FC<AssetListItemProps> = ({ asset }) => {
  return (
    <Link to={`/asset/${asset.id}`} className="block hover:bg-slate-50 transition-colors duration-150">
      <div className="p-4 border-b border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`text-lg font-semibold ${ACCENT_COLOR_CLASS_TEXT}`}>{asset.nome}</h3>
            {/* <p className="text-sm text-slate-500">{asset.id_interno}</p> REMOVIDO */}
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
            {asset.status}
          </span>
        </div>
        <div className="mt-2 text-sm text-slate-600 space-y-1">
          <p><strong>Modelo:</strong> {asset.modelo}</p>
          <p><strong>Localização:</strong> {asset.localizacao}</p>
        </div>
      </div>
    </Link>
  );
};

export default AssetListItem;