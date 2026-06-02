import express from "express";
import axios from "axios";
import { buildNFeXML, buildEnviNFe } from "../nfe/xml.js";
import { signNFe } from "../nfe/sign.js";
import { enviarNFe } from "../nfe/sefaz.js";
import { proximoNNF, salvarNFe } from "../nfe/db.js";
import { CERT_BASE64 } from "../nfe/constants.js";
import type { NFeDestinatario, NFeProduto } from "../nfe/types.js";

// Hotmart purchase events that mean "payment confirmed"
const PAID_EVENTS = new Set(["PURCHASE_COMPLETE", "PURCHASE_APPROVED"]);

interface HotmartAddress {
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
}

interface HotmartBuyer {
  name?: string;
  email?: string;
  doc?: string;
  cpf?: string;
  address?: HotmartAddress;
}

interface HotmartPayload {
  event?: string;
  data?: {
    product?: { id?: number; name?: string };
    purchase?: { price?: { value?: number; currency_value?: string }; transaction?: string };
    buyer?: HotmartBuyer;
  };
}

async function lookupCep(cep: string): Promise<{ ibge: string; logradouro: string; bairro: string; localidade: string; uf: string } | null> {
  try {
    const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, { timeout: 8000 });
    if (data?.erro) return null;
    return data;
  } catch {
    return null;
  }
}

async function emitirNFeHotmart(payload: HotmartPayload): Promise<void> {
  const privateKeyPem = process.env.NFE_KEY_PEM;
  if (!privateKeyPem) throw new Error("NFE_KEY_PEM não configurado");

  const buyer = payload.data?.buyer;
  const purchase = payload.data?.purchase;
  const product = payload.data?.product;

  const cpf = (buyer?.doc ?? buyer?.cpf ?? "").replace(/\D/g, "");
  if (!cpf || cpf.length !== 11) throw new Error(`CPF inválido ou ausente: "${buyer?.doc ?? buyer?.cpf}"`);

  const name = buyer?.name?.trim();
  if (!name) throw new Error("Nome do comprador ausente");

  const valor = purchase?.price?.value;
  if (!valor || valor <= 0) throw new Error(`Valor inválido: ${valor}`);

  const addr = buyer?.address;
  const cep = (addr?.zipcode ?? "").replace(/\D/g, "");
  if (!cep || cep.length !== 8) throw new Error(`CEP inválido: "${addr?.zipcode}"`);

  // Lookup IBGE city code from CEP
  const cepInfo = await lookupCep(cep);
  if (!cepInfo) throw new Error(`CEP ${cep} não encontrado no ViaCEP`);

  const dest: NFeDestinatario = {
    cpf,
    xNome: name.substring(0, 60),
    email: buyer?.email?.substring(0, 60),
    indIEDest: "9",
    enderDest: {
      xLgr: ((addr?.address || cepInfo.logradouro) ?? "").substring(0, 60) || "SEM LOGRADOURO",
      nro: (addr?.number ?? "SN").substring(0, 60),
      xCpl: addr?.complement ? addr.complement.substring(0, 60) : undefined,
      xBairro: ((addr?.neighborhood || cepInfo.bairro) ?? "").substring(0, 60) || "SEM BAIRRO",
      cMun: cepInfo.ibge,
      xMun: ((addr?.city || cepInfo.localidade) ?? "").substring(0, 60),
      uf: ((addr?.state || cepInfo.uf) ?? "").substring(0, 2).toUpperCase(),
      cep,
    },
  };

  const produto: NFeProduto = {
    xProd: (product?.name ?? "Produto Digital").substring(0, 120),
    vUnCom: valor,
    qCom: 1,
  };

  const nNF = await proximoNNF();
  const { nfeXml, infNFeXml, chNFe, vNF } = buildNFeXML({ nNF, dest, produto, vPag: valor });
  const signedXml = signNFe(nfeXml, infNFeXml, chNFe, CERT_BASE64, privateKeyPem);
  const lote = String(Date.now()).slice(-10);
  const enviNFe = buildEnviNFe(signedXml, lote);
  const { retorno, rawXml } = await enviarNFe(enviNFe);

  await salvarNFe({
    chNFe,
    nNF,
    userId: null,
    valor: vNF,
    destNome: dest.xNome,
    destDoc: cpf,
    destEmail: dest.email,
    xmlNFe: rawXml,
    retorno,
  });

  console.log(`[webhook/hotmart] NF-e ${chNFe} — cStat:${retorno.cStat} ${retorno.xMotivo}`);
}

export function registerHotmartWebhook(app: express.Application): void {
  app.post("/api/webhook/hotmart", express.json({ limit: "1mb" }), (req, res) => {
    // Validate hottok if configured
    const hottok = process.env.HOTMART_HOTTOK;
    if (hottok) {
      const received = req.headers["x-hotmart-hottok"];
      if (received !== hottok) {
        console.warn("[webhook/hotmart] Hottok inválido — requisição rejeitada");
        res.sendStatus(401);
        return;
      }
    }

    const payload: HotmartPayload = req.body;
    const event = payload?.event ?? "";

    // Acknowledge immediately so Hotmart doesn't timeout
    res.json({ ok: true, event });

    if (!PAID_EVENTS.has(event)) {
      console.log(`[webhook/hotmart] Evento ignorado: ${event}`);
      return;
    }

    // Emit NF-e asynchronously — never let errors reach Hotmart
    emitirNFeHotmart(payload).catch((err: Error) => {
      console.error(`[webhook/hotmart] Falha ao emitir NF-e:`, err.message);
    });
  });
}
