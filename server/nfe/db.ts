import { getDb } from "../db.js";
import { notasFiscais, nfeSequencia } from "../../drizzle/schema.js";
import { eq, sql } from "drizzle-orm";
import type { SefazRetorno } from "./types.js";

export async function proximoNNF(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");

  await db
    .update(nfeSequencia)
    .set({ ultimoNumero: sql`${nfeSequencia.ultimoNumero} + 1` })
    .where(eq(nfeSequencia.id, 1));

  const [seq] = await db
    .select({ n: nfeSequencia.ultimoNumero })
    .from(nfeSequencia)
    .where(eq(nfeSequencia.id, 1));

  if (!seq) throw new Error("Sequência NF-e não encontrada. Execute a migration 0001_nfe_tables.sql");
  return seq.n;
}

export async function salvarNFe(params: {
  chNFe: string;
  nNF: number;
  userId: number | null;
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
  return db.select().from(notasFiscais).orderBy(notasFiscais.createdAt);
}
