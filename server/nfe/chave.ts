import { EMIT, FISCAL, SEFAZ } from "./constants.js";

function pad(v: string | number, n: number): string {
  return String(v).padStart(n, "0");
}

function calcDV(chave43: string): string {
  const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
  let soma = 0;
  for (let i = chave43.length - 1; i >= 0; i--) {
    soma += parseInt(chave43[i]) * pesos[(chave43.length - 1 - i) % 8];
  }
  const resto = soma % 11;
  return String(resto < 2 ? 0 : 11 - resto);
}

export function buildChNFe(nNF: number, dhEmi: Date, cNF?: string): string {
  const aamm =
    pad(dhEmi.getFullYear() % 100, 2) + pad(dhEmi.getMonth() + 1, 2);
  const cnpj = EMIT.cnpj.replace(/\D/g, "");
  const serie = pad(FISCAL.serie, 3);
  const nNFStr = pad(nNF, 9);
  const cNFStr = cNF ?? pad(Math.floor(Math.random() * 99999998) + 1, 8);

  const chave43 =
    pad(SEFAZ.cUF, 2) +
    aamm +
    cnpj +
    FISCAL.mod +
    serie +
    nNFStr +
    FISCAL.tpEmis +
    cNFStr;

  return chave43 + calcDV(chave43);
}
