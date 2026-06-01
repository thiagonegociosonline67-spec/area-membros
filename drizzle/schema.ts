import { decimal, int, mysqlEnum, mysqlTable, mediumtext, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const nfeSequencia = mysqlTable("nfe_sequencia", {
  id: int("id").primaryKey(),
  serie: varchar("serie", { length: 3 }).notNull().default("1"),
  ultimoNumero: int("ultimo_numero").notNull().default(10889),
});

export const notasFiscais = mysqlTable("notas_fiscais", {
  id: int("id").autoincrement().primaryKey(),
  chNFe: varchar("ch_nfe", { length: 44 }).notNull().unique(),
  nNF: int("n_nf").notNull(),
  userId: int("user_id"),
  status: mysqlEnum("status", ["pendente", "autorizada", "rejeitada", "cancelada"])
    .notNull()
    .default("pendente"),
  cStat: varchar("c_stat", { length: 3 }),
  xMotivo: varchar("x_motivo", { length: 255 }),
  nProt: varchar("n_prot", { length: 20 }),
  valor: decimal("valor", { precision: 15, scale: 2 }).notNull(),
  destNome: varchar("dest_nome", { length: 60 }),
  destDoc: varchar("dest_doc", { length: 14 }),
  destEmail: varchar("dest_email", { length: 60 }),
  xmlNFe: mediumtext("xml_nfe"),
  dhEmi: timestamp("dh_emi").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotaFiscal = typeof notasFiscais.$inferSelect;
export type InsertNotaFiscal = typeof notasFiscais.$inferInsert;
