// Todos os valores extraídos da NF-e 10889 autorizada pela SEFAZ-SP

export const EMIT = {
  cnpj: "53263312000154",
  xNome: "53.263.312 RITA DE CASSIA SOARES STREICHER",
  xFant: "Comunidade do Autocuidado Emocional",
  ie: "155403613112",
  crt: "3",
  ender: {
    xLgr: "AVENIDA PAULISTA",
    nro: "1636",
    xCpl: "SALA 1105/2426",
    xBairro: "BELA VISTA",
    cMun: "3550308",
    xMun: "Sao Paulo",
    uf: "SP",
    cep: "01310200",
    cPais: "1058",
    xPais: "Brasil",
  },
};

export const FISCAL = {
  mod: "55",
  serie: "1",
  natOp: "VENDA DE MERCADORIA",
  tpNF: "1",
  idDest: "1",
  tpImp: "1",
  tpEmis: "1",
  tpAmb: process.env.NFE_TP_AMB ?? "1",
  finNFe: "1",
  indFinal: "1",
  indPres: "2",
  indIntermed: "0",
  procEmi: "0",
  verProc: "4.00",
  ncm: "49019900",
  cfop: "5101",
  cProd: "01",
  uCom: "UN",
  cstIcms: "41",
  cstPisCofins: "06",
  modFrete: "9",
  tPag: "99",
  xPag: "Outro",
  // Taxa IBPT NCM 49019900 (~31.45%)
  ibptRate: 0.3145,
  infCpl:
    "Produto com Imunidade tributaria conforme alinea D, do inciso VI, do art. 150 da CF/88. IPI Isento conforme cap. III secao I do decreto n 7.212/2010.",
};

// Certificado X.509 extraído da NF-e 10889 (chave pública — seguro hardcodar)
export const CERT_BASE64 =
  process.env.NFE_CERT_BASE64 ??
  "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";

export const SEFAZ = {
  cUF: "35",
  urlAutorizacao: "https://nfe.fazenda.sp.gov.br/ws/nfeautorizacao4.asmx",
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
