// types.ts
export enum AssetStatus {
  EmOperacao = "Em Operação",
  EmManutencao = "Em Manutencao",
  ForaDeUso = "Fora de Uso",
  AguardandoPecas = "Aguardando Pecas",
}

export enum HistoryEventType {
  ManutencaoCorretiva = "Manutencao Corretiva",
  ManutencaoPreventiva = "Manutencao Preventiva",
  MudancaStatus = "Mudanca Status",
  MudancaLocalizacao = "Mudanca Localizacao",
  Observacao = "Observacao",
}

export interface Category {
  id: number;
  name: string;
  prefix: string; // Ex: "PC", "NOTE"
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  tipo_evento: HistoryEventType;
  descricao: string;
  responsavel?: string;
}

export interface Asset {
  id: string;
  nome: string;
  descricao?: string;
  numero_serie: string;
  modelo: string;
  localizacao: string;
  status: AssetStatus;
  data_aquisicao: string;
  info_garantia: string;
  ultima_atualizacao: string;
  atualizado_por?: string;
  historico: HistoryEntry[];
  utilizador?: string;
  category_id?: number; // NOVO CAMPO: ID da categoria
  category_name?: string; // NOVO CAMPO (opcional, para exibição)
  category_prefix?: string; // NOVO CAMPO (opcional, para geração de ID)
}