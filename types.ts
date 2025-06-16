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

export interface HistoryEntry {
  id: string; // unique id for mapping, e.g., UUID
  timestamp: string; // ISO string
  tipo_evento: HistoryEventType;
  descricao: string;
  responsavel?: string; // Optional, as authentication is optional
}

export interface Asset {
  id: string; // e.g., MAKEDIST-MAQ-00123
  nome: string;
  descricao?: string; // Descrição opcional da máquina
  numero_serie: string;
  modelo: string;
  localizacao: string;
  status: AssetStatus;
  data_aquisicao: string; // ISO string
  info_garantia: string;
  ultima_atualizacao: string; // ISO string
  atualizado_por?: string; // Optional
  historico: HistoryEntry[];
  utilizador?: string; // NOVO CAMPO: Utilizador da máquina
}