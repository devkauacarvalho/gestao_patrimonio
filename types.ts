// types.ts
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
  id: string;
  timestamp: string;
  tipo_evento: HistoryEventType;
  descricao: string;
  responsavel?: string;
  user_id?: number;
}

export interface Category {
  id: number;
  name: string;
  prefix: string;
  sequence_name?: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
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
  category_id?: number;
  category_name?: string;
  category_prefix?: string;
}