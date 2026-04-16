export type StatusSistema = 'Entrada' | 'Saída' | 'Não lançado' | 'Cancelada';

export interface NotaFiscal {
  chaveAcesso: string;
  dataEmissao: string;
  cfop: string;
  cnpjEmitente: string;
  nomeEmitente: string;
  cpfCnpjDestinatario: string;
  nomeDestinatario: string;
  numeroNF: string;
  valorNF: number;
  statusSistema: string;
  statusSefaz: string;
  tipoNota?: string;
  filial: string; 
}