export const EMIT = {
  cnpj: process.env.NFE_CNPJ ?? "",
  xNome: process.env.NFE_RAZAO_SOCIAL ?? "",
  xFant: process.env.NFE_NOME_FANTASIA ?? "",
  ie: "155403613112",
  crt: "3",
  ender: {
    xLgr: process.env.NFE_LOGRADOURO ?? "",
    nro: process.env.NFE_NUMERO ?? "",
    xBairro: process.env.NFE_BAIRRO ?? "",
    cMun: process.env.NFE_COD_MUN ?? "3550308",
    xMun: process.env.NFE_MUN ?? "SAO PAULO",
    uf: "SP",
    cep: process.env.NFE_CEP ?? "",
    cPais: "1058",
    xPais: "Brasil",
    fone: process.env.NFE_FONE ?? "",
  },
};

export const FISCAL = {
  mod: "55",
  serie: "1",
  tpNF: "1",
  idDest: "1",
  tpImp: "1",
  tpEmis: "1",
  tpAmb: process.env.NFE_TP_AMB ?? "1",
  finNFe: "1",
  indFinal: "1",
  indPres: "2",
  procEmi: "0",
  verProc: "4.00",
  ncm: "49019900",
  cfop: "5101",
  uCom: "UN",
  cstIcms: "41",
  cstPisCofins: "06",
  modFrete: "9",
  tPag: "99",
  infCpl:
    "Produto com Imunidade tributaria conforme alinea D, inciso VI, art. 150 CF/88.",
};

export const SEFAZ = {
  cUF: "35",
  urlAutorizacao:
    "https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx",
  urlHomologacao:
    "https://homologacao.nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx",
  namespace: "http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4",
  soapAction:
    "http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4/nfeAutorizacaoLote",
  nfeNS: "http://www.portalfiscal.inf.br/nfe",
};

export function sefazUrl(): string {
  return FISCAL.tpAmb === "1" ? SEFAZ.urlAutorizacao : SEFAZ.urlHomologacao;
}
