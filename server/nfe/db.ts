import { getDb } from "../db.js";
import { notasFiscais, nfeSequencia } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import type { SefazRetorno } from "./types.js";

export async function proximoNNF(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  // Incremento atômico + leitura em duas queries dentro da mesma conexão
  await db.execute(
    "UPDATE nfe_sequencia SET ultimo_numero = ultimo_numero + 1 WHERE id = 1",
  );
  const [rows] = await db.execute(
    "SELECT ultimo_numero FROM nfe_sequencia WHERE id = 1",
  );
  const row = (rows as unknown as Array<{ ultimo_numero: number }>)[0];
  return row.ultimo_numero;
}

export async function salvarNFe(params: {
  chNFe: string;
  nNF: number;
  userId: number;
  valor: number;
  destNome: string;
  destDoc?: string;
  destEmail?: string;
  xmlNFe: string;
  retorno: SefazRetorno;
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  const status: "autorizada" | "rejeitada" | "cancelada" | "pendente" =
    params.retorno.cStat === "100"
      ? "autorizada"
      : params.retorno.cStat === "110"
        ? "cancelada"
        : "rejeitada";

  await db.insert(notasFiscais).values({
    chNFe: params.chNFe,
    nNF: params.nNF,
    userId: params.userId,
    status,
    cStat: params.retorno.cStat,
    xMotivo: params.retorno.xMotivo,
    nProt: params.retorno.nProt,
    valor: String(params.valor),
    destNome: params.destNome,
    destDoc: params.destDoc,
    destEmail: params.destEmail,
    xmlNFe: params.xmlNFe,
  });
}

export async function listarNFes() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notasFiscais)
    .orderBy(notasFiscais.createdAt);
}
