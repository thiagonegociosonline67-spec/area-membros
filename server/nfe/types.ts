export interface NFeEndereco {
  xLgr: string;
  nro: string;
  xCpl?: string;
  xBairro: string;
  cMun: string;
  xMun: string;
  uf: string;
  cep: string;
  cPais?: string;
  xPais?: string;
}

export interface NFeDestinatario {
  cpf?: string;
  cnpj?: string;
  xNome: string;
  email?: string;
  indIEDest: "1" | "2" | "9";
  enderDest: NFeEndereco;
}

export interface NFeProduto {
  xProd: string;
  vUnCom: number;
  qCom?: number;
}

export interface NFeInput {
  nNF: number;
  dest: NFeDestinatario;
  produto: NFeProduto;
  vPag: number;
  dhEmi?: Date;
}

export interface SefazRetorno {
  tpAmb: string;
  cStat: string;
  xMotivo: string;
  cUF: string;
  dhRecbto?: string;
  nProt?: string;
  chNFe?: string;
  digVal?: string;
}

export interface NFeResult {
  success: boolean;
  chNFe: string;
  cStat: string;
  xMotivo: string;
  nProt?: string;
  xml: string;
}
