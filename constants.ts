import { Asset, AssetStatus, HistoryEventType } from './types';

export const APP_NAME = "Make Gestão de Patrimônio";
export const ACCENT_COLOR_NAME = "teal"; // Tailwind color name
export const ACCENT_COLOR_CLASS_BG = `bg-${ACCENT_COLOR_NAME}-600`;
export const ACCENT_COLOR_CLASS_TEXT = `text-${ACCENT_COLOR_NAME}-600`;
export const ACCENT_COLOR_CLASS_BORDER = `border-${ACCENT_COLOR_NAME}-600`;
export const ACCENT_COLOR_CLASS_HOVER_BG = `hover:bg-${ACCENT_COLOR_NAME}-700`;

export const ASSET_STATUS_OPTIONS: AssetStatus[] = Object.values(AssetStatus);
export const HISTORY_EVENT_TYPE_OPTIONS: HistoryEventType[] = Object.values(HistoryEventType);

export const INITIAL_ASSETS: Asset[] = [
  {
    id: "MAKEDIST-MAQ-00123",
    id_interno: "MAKEDIST-MAQ-00123",
    nome: "Empacotadora Automática XPTO",
    numero_serie: "SN-XPTO-12345",
    modelo: "XPTO-2023",
    localizacao: "Setor A, Linha 1",
    status: AssetStatus.EmOperacao,
    data_aquisicao: new Date(2023, 0, 15).toISOString(),
    info_garantia: "Expira em 2025-01-15",
    ultima_atualizacao: new Date(2024, 4, 1).toISOString(),
    historico: [
      { id: "hist1-1", timestamp: new Date(2023, 1, 20, 10, 0).toISOString(), tipo_evento: HistoryEventType.ManutencaoPreventiva, descricao: "Lubrificação geral e verificação de sensores." },
      { id: "hist1-2", timestamp: new Date(2023, 5, 10, 14, 30).toISOString(), tipo_evento: HistoryEventType.MudancaLocalizacao, descricao: "Movida para Setor A, Linha 1." },
      { id: "hist1-3", timestamp: new Date(2024, 0, 5, 9, 0).toISOString(), tipo_evento: HistoryEventType.Observacao, descricao: "Operando normalmente. Nível de ruído ligeiramente elevado." },
    ],
  },
  {
    id: "MAKEDIST-MAQ-00456",
    id_interno: "MAKEDIST-MAQ-00456",
    nome: "Prensa Hidráulica YZ",
    numero_serie: "SN-YZ-67890",
    modelo: "YZ-HEAVY-2022",
    localizacao: "Setor B, Oficina",
    status: AssetStatus.EmManutencao,
    data_aquisicao: new Date(2022, 6, 1).toISOString(),
    info_garantia: "Expirada",
    ultima_atualizacao: new Date(2024, 3, 20).toISOString(),
    historico: [
      { id: "hist2-1", timestamp: new Date(2023, 8, 5, 9, 0).toISOString(), tipo_evento: HistoryEventType.ManutencaoCorretiva, descricao: "Falha no cilindro principal. Iniciada desmontagem." },
      { id: "hist2-2", timestamp: new Date(2023, 8, 15, 16,0).toISOString(), tipo_evento: HistoryEventType.MudancaStatus, descricao: "Status alterado para Em Manutenção. Peça solicitada." },
      { id: "hist2-3", timestamp: new Date(2024, 3, 20, 11,0).toISOString(), tipo_evento: HistoryEventType.Observacao, descricao: "Peça recebida. Agendada instalação para próxima semana." },
    ],
  },
  {
    id: "MAKEDIST-MAQ-00789",
    id_interno: "MAKEDIST-MAQ-00789",
    nome: "Esteira Transportadora ZW",
    numero_serie: "SN-ZW-11223",
    modelo: "ZW-FAST-2024",
    localizacao: "Setor C, Expedição",
    status: AssetStatus.ForaDeUso,
    data_aquisicao: new Date(2024, 2, 10).toISOString(),
    info_garantia: "Expira em 2026-03-10",
    ultima_atualizacao: new Date(2024, 4, 10).toISOString(),
    historico: [
      { id: "hist3-1", timestamp: new Date(2024, 3, 1, 11,0).toISOString(), tipo_evento: HistoryEventType.Observacao, descricao: "Detectado ruído estranho no motor. Necessita avaliação." },
      { id: "hist3-2", timestamp: new Date(2024, 3, 2, 11,0).toISOString(), tipo_evento: HistoryEventType.MudancaStatus, descricao: "Status alterado para Fora de Uso para inspeção detalhada." },
      { id: "hist3-3", timestamp: new Date(2024, 4, 10, 15,0).toISOString(), tipo_evento: HistoryEventType.ManutencaoCorretiva, descricao: "Inspeção revelou desalinhamento do eixo. Peças de reposição encomendadas." },
    ],
  }
];