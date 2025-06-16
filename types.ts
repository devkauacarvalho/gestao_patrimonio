export enum AssetStatus {
  EmOperacao = "Em Operação",
  EmManutencao = "Em Manutenção",
  ForaDeUso = "Fora de Uso",
  AguardandoPecas = "Aguardando Peças",
}

export enum HistoryEventType {
  ManutencaoCorretiva = "Manutenção Corretiva",
  ManutencaoPreventiva = "Manutenção Preventiva",
  MudancaStatus = "Mudança Status",
  MudancaLocalizacao = "Mudança Localização",
  Observacao = "Observação",
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
  id_interno: string; // should be same as id
  modelo: string;
  localizacao: string;
  status: AssetStatus;
  data_aquisicao: string; // ISO string
  info_garantia: string;
  ultima_atualizacao: string; // ISO string
  atualizado_por?: string; // Optional
  historico: HistoryEntry[];
}