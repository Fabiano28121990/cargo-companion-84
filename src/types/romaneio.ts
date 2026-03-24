export interface RomaneioItem {
  id: string;
  user_id: string;
  transportadora: string;
  data: string;
  nota_fiscal: string;
  remessa: string;
  volume: number;
  valor: number;
  qtd_perfil: number;
  status: string;
  romaneio_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Romaneio {
  id: string;
  user_id: string;
  transportadora: string;
  numero: number;
  created_at: string;
}

export interface DesmonteItem {
  id: string;
  user_id: string;
  nota_fiscal: string;
  remessa: string;
  ordem_venda: string;
  cliente: string;
  valor: number;
  emissao: string;
  dias_parado: number;
  item_id: string;
  od: string;
  remessa_devolucao: string;
  status: string;
  inbound: string;
  aguardando_desmonte: boolean;
  desmonte_concluido: boolean;
  created_at: string;
  updated_at: string;
}
