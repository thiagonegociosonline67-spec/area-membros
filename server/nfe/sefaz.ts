import axios from "axios";
import https from "https";
import { SEFAZ, sefazUrl } from "./constants.js";
import type { SefazRetorno } from "./types.js";

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function buildSoap(enviNFeXml: string): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"` +
    ` xmlns:xsd="http://www.w3.org/2001/XMLSchema"` +
    ` xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">` +
    `<soap12:Body>` +
    `<nfeAutorizacaoLote xmlns="${SEFAZ.namespace}">` +
    `<nfeDadosMsg>` +
    enviNFeXml +
    `</nfeDadosMsg>` +
    `</nfeAutorizacaoLote>` +
    `</soap12:Body>` +
    `</soap12:Envelope>`
  );
}

function extract(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return m?.[1]?.trim() ?? "";
}

function parseRetorno(xml: string): SefazRetorno {
  const infProt = extract(xml, "infProt");
  if (infProt) {
    return {
      tpAmb: extract(infProt, "tpAmb"),
      cStat: extract(infProt, "cStat"),
      xMotivo: extract(infProt, "xMotivo"),
      cUF: extract(infProt, "cUF"),
      dhRecbto: extract(infProt, "dhRecbto"),
      nProt: extract(infProt, "nProt"),
      chNFe: extract(infProt, "chNFe"),
      digVal: extract(infProt, "digVal"),
    };
  }
  return {
    tpAmb: extract(xml, "tpAmb"),
    cStat: extract(xml, "cStat"),
    xMotivo: extract(xml, "xMotivo"),
    cUF: extract(xml, "cUF"),
    dhRecbto: extract(xml, "dhRecbto"),
  };
}

export async function enviarNFe(enviNFeXml: string): Promise<{
  retorno: SefazRetorno;
  rawXml: string;
}> {
  const soap = buildSoap(enviNFeXml);

  const response = await axios.post(sefazUrl(), soap, {
    headers: {
      "Content-Type": `application/soap+xml;charset=UTF-8;action="${SEFAZ.soapAction}"`,
    },
    httpsAgent,
    timeout: 30000,
  });

  const rawXml = String(response.data);
  return { retorno: parseRetorno(rawXml), rawXml };
}
