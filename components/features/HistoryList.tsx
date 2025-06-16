
import React from 'react';
import { HistoryEntry } from '../../types';
import { IconTime } from '../../constants.tsx'; // Assuming you have an IconTime

interface HistoryListProps {
  history: HistoryEntry[];
}

const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  if (history.length === 0) {
    return <p className="text-slate-500 text-center py-4">Nenhum histórico registrado para esta máquina.</p>;
  }

  const formatDate = (isoString: string) => {
    if (!isoString) return 'Data inválida';
    try {
      return new Date(isoString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {history.map((entry) => (
        <div key={entry.id} className="p-3 bg-slate-50 rounded-md border border-slate-200">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-slate-700">{entry.tipo_evento}</p>
            <div className="flex items-center text-xs text-slate-500">
              <IconTime className="w-4 h-4 mr-1" />
              {formatDate(entry.timestamp)}
            </div>
          </div>
          <p className="text-sm text-slate-600">{entry.descricao}</p>
          {entry.responsavel && <p className="text-xs text-slate-500 mt-1">Responsável: {entry.responsavel}</p>}
        </div>
      ))}
    </div>
  );
};

export default HistoryList;
