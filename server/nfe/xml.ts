import { EMIT, FISCAL, SEFAZ } from "./constants.js";
import { buildChNFe } from "./chave.js";
import type { NFeDestinatario, NFeProduto } from "./types.js";

const NS = SEFAZ.nfeNS;

function pad(v: string | number, n: number) {
  return String(v).padStart(n, "0");
}

function fmtDh(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1, 2);
  const dd = pad(d.getDate(), 2);
  const hh = pad(d.getHours(), 2);
  const mi = pad(d.getMinutes(), 2);
  const ss = pad(d.getSeconds(), 2);
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}-03:00`;
}

function fv(n: number, dec = 2) {
  return n.toFixed(dec);
}

function buildIde(nNF: number, chNFe: string, dhEmi: Date): string {
  const cNF = chNFe.substring(35, 43);
  const cDV = chNFe[43];
  const dh = fmtDh(dhEmi);
  return (
    `<ide>` +
    `<cUF>${SEFAZ.cUF}</cUF>` +
    `<cNF>${cNF}</cNF>` +
    `<natOp>${FISCAL.natOp}</natOp>` +
    `<mod>${FISCAL.mod}</mod>` +
    `<serie>${FISCAL.serie}</serie>` +
    `<nNF>${nNF}</nNF>` +
    `<dhEmi>${dh}</dhEmi>` +
    `<dhSaiEnt>${dh}</dhSaiEnt>` +
    `<tpNF>${FISCAL.tpNF}</tpNF>` +
    `<idDest>${FISCAL.idDest}</idDest>` +
    `<cMunFG>${EMIT.ender.cMun}</cMunFG>` +
    `<tpImp>${FISCAL.tpImp}</tpImp>` +
    `<tpEmis>${FISCAL.tpEmis}</tpEmis>` +
    `<cDV>${cDV}</cDV>` +
    `<tpAmb>${FISCAL.tpAmb}</tpAmb>` +
    `<finNFe>${FISCAL.finNFe}</finNFe>` +
    `<indFinal>${FISCAL.indFinal}</indFinal>` +
    `<indPres>${FISCAL.indPres}</indPres>` +
    `<indIntermed>${FISCAL.indIntermed}</indIntermed>` +
    `<procEmi>${FISCAL.procEmi}</procEmi>` +
    `<verProc>${FISCAL.verProc}</verProc>` +
    `</ide>`
  );
}

function buildEmit(): string {
  const e = EMIT;
  const en = e.ender;
  return (
    `<emit>` +
    `<CNPJ>${e.cnpj}</CNPJ>` +
    `<xNome>${e.xNome}</xNome>` +
    `<xFant>${e.xFant}</xFant>` +
    `<enderEmit>` +
    `<xLgr>${en.xLgr}</xLgr>` +
    `<nro>${en.nro}</nro>` +
    `<xCpl>${en.xCpl}</xCpl>` +
    `<xBairro>${en.xBairro}</xBairro>` +
    `<cMun>${en.cMun}</cMun>` +
    `<xMun>${en.xMun}</xMun>` +
    `<UF>${en.uf}</UF>` +
    `<CEP>${en.cep}</CEP>` +
    `<cPais>${en.cPais}</cPais>` +
    `<xPais>${en.xPais}</xPais>` +
    `</enderEmit>` +
    `<IE>${e.ie}</IE>` +
    `<CRT>${e.crt}</CRT>` +
    `</emit>`
  );
}

function buildDest(dest: NFeDestinatario): string {
  const en = dest.enderDest;
  let xml = `<dest>`;
  if (dest.cpf) xml += `<CPF>${dest.cpf.replace(/\D/g, "")}</CPF>`;
  else if (dest.cnpj) xml += `<CNPJ>${dest.cnpj.replace(/\D/g, "")}</CNPJ>`;
  xml += `<xNome>${dest.xNome}</xNome>`;
  xml +=
    `<enderDest>` +
    `<xLgr>${en.xLgr}</xLgr>` +
    `<nro>${en.nro}</nro>`;
  if (en.xCpl) xml += `<xCpl>${en.xCpl}</xCpl>`;
  xml +=
    `<xBairro>${en.xBairro}</xBairro>` +
    `<cMun>${en.cMun}</cMun>` +
    `<xMun>${en.xMun}</xMun>` +
    `<UF>${en.uf}</UF>` +
    `<CEP>${en.cep.replace(/\D/g, "")}</CEP>` +
    `<cPais>${en.cPais ?? "1058"}</cPais>` +
    `<xPais>${en.xPais ?? "Brasil"}</xPais>` +
    `</enderDest>` +
    `<indIEDest>${dest.indIEDest}</indIEDest>`;
  if (dest.email) xml += `<email>${dest.email}</email>`;
  xml += `</dest>`;
  return xml;
}

function buildDet(produto: NFeProduto): string {
  const qCom = produto.qCom ?? 1;
  const vProd = fv(produto.vUnCom * qCom);
  const vUnComStr = fv(produto.vUnCom, 10);
  const qComStr = fv(qCom, 4);
  const vTotTrib = fv(produto.vUnCom * qCom * FISCAL.ibptRate);
  return (
    `<det nItem="1">` +
    `<prod>` +
    `<cProd>${FISCAL.cProd}</cProd>` +
    `<cEAN>SEM GTIN</cEAN>` +
    `<xProd>${produto.xProd}</xProd>` +
    `<NCM>${FISCAL.ncm}</NCM>` +
    `<CFOP>${FISCAL.cfop}</CFOP>` +
    `<uCom>${FISCAL.uCom}</uCom>` +
    `<qCom>${qComStr}</qCom>` +
    `<vUnCom>${vUnComStr}</vUnCom>` +
    `<vProd>${vProd}</vProd>` +
    `<cEANTrib>SEM GTIN</cEANTrib>` +
    `<uTrib>${FISCAL.uCom}</uTrib>` +
    `<qTrib>${qComStr}</qTrib>` +
    `<vUnTrib>${vUnComStr}</vUnTrib>` +
    `<indTot>1</indTot>` +
    `</prod>` +
    `<imposto>` +
    `<vTotTrib>${vTotTrib}</vTotTrib>` +
    `<ICMS><ICMS40><orig>0</orig><CST>${FISCAL.cstIcms}</CST></ICMS40></ICMS>` +
    `<PIS><PISNT><CST>${FISCAL.cstPisCofins}</CST></PISNT></PIS>` +
    `<COFINS><COFINSNT><CST>${FISCAL.cstPisCofins}</CST></COFINSNT></COFINS>` +
    `</imposto>` +
    `</det>`
  );
}

function buildTotal(vNF: number): string {
  const v = fv(vNF);
  const vTotTrib = fv(vNF * FISCAL.ibptRate);
  return (
    `<total><ICMSTot>` +
    `<vBC>0.00</vBC>` +
    `<vICMS>0.00</vICMS>` +
    `<vICMSDeson>0.00</vICMSDeson>` +
    `<vFCPUFDest>0.00</vFCPUFDest>` +
    `<vICMSUFDest>0.00</vICMSUFDest>` +
    `<vFCP>0.00</vFCP>` +
    `<vBCST>0.00</vBCST>` +
    `<vST>0.00</vST>` +
    `<vFCPST>0.00</vFCPST>` +
    `<vFCPSTRet>0.00</vFCPSTRet>` +
    `<vProd>${v}</vProd>` +
    `<vFrete>0.00</vFrete>` +
    `<vSeg>0.00</vSeg>` +
    `<vDesc>0.00</vDesc>` +
    `<vII>0.00</vII>` +
    `<vIPI>0.00</vIPI>` +
    `<vIPIDevol>0.00</vIPIDevol>` +
    `<vPIS>0.00</vPIS>` +
    `<vCOFINS>0.00</vCOFINS>` +
    `<vOutro>0.00</vOutro>` +
    `<vNF>${v}</vNF>` +
    `<vTotTrib>${vTotTrib}</vTotTrib>` +
    `</ICMSTot></total>`
  );
}

export interface BuildResult {
  nfeXml: string;
  infNFeXml: string;
  chNFe: string;
  vNF: number;
}

export function buildNFeXML(params: {
  nNF: number;
  dest: NFeDestinatario;
  produto: NFeProduto;
  vPag: number;
  dhEmi?: Date;
}): BuildResult {
  const dhEmi = params.dhEmi ?? new Date();
  const chNFe = buildChNFe(params.nNF, dhEmi);
  const vNF = params.produto.vUnCom * (params.produto.qCom ?? 1);

  const body =
    buildIde(params.nNF, chNFe, dhEmi) +
    buildEmit() +
    buildDest(params.dest) +
    buildDet(params.produto) +
    buildTotal(vNF) +
    `<transp><modFrete>${FISCAL.modFrete}</modFrete></transp>` +
    `<pag><detPag><tPag>${FISCAL.tPag}</tPag><xPag>${FISCAL.xPag}</xPag><vPag>${fv(params.vPag)}</vPag></detPag></pag>` +
    `<infAdic><infCpl>${FISCAL.infCpl}</infCpl></infAdic>`;

  // infNFe com xmlns explícito para digest SHA-1 (C14N subset inclui namespace herdado)
  const infNFeXml =
    `<infNFe xmlns="${NS}" Id="NFe${chNFe}" versao="4.00">` +
    body +
    `</infNFe>`;

  // NFe completa: xmlns no elemento raiz
  const nfeXml =
    `<NFe xmlns="${NS}">` +
    `<infNFe Id="NFe${chNFe}" versao="4.00">` +
    body +
    `</infNFe>` +
    `</NFe>`;

  return { nfeXml, infNFeXml, chNFe, vNF };
}

export function buildEnviNFe(signedNFe: string, lote: string): string {
  return (
    `<enviNFe xmlns="${NS}" versao="4.00">` +
    `<idLote>${lote}</idLote>` +
    `<indSinc>1</indSinc>` +
    signedNFe +
    `</enviNFe>`
  );
}
