import { getDb } from "../db.js";

const CREATE_NFE_SEQUENCIA = `
CREATE TABLE IF NOT EXISTS \`nfe_sequencia\` (
  \`id\` int NOT NULL,
  \`serie\` varchar(3) NOT NULL DEFAULT '1',
  \`ultimo_numero\` int NOT NULL DEFAULT 10889,
  PRIMARY KEY (\`id\`)
)
`;

const SEED_NFE_SEQUENCIA = `
INSERT IGNORE INTO \`nfe_sequencia\` (\`id\`, \`serie\`, \`ultimo_numero\`)
VALUES (1, '1', 10889)
`;

const CREATE_NOTAS_FISCAIS = `
CREATE TABLE IF NOT EXISTS \`notas_fiscais\` (
  \`id\` int AUTO_INCREMENT NOT NULL,
  \`ch_nfe\` varchar(44) NOT NULL,
  \`n_nf\` int NOT NULL,
  \`user_id\` int,
  \`status\` enum('pendente','autorizada','rejeitada','cancelada') NOT NULL DEFAULT 'pendente',
  \`c_stat\` varchar(3),
  \`x_motivo\` varchar(255),
  \`n_prot\` varchar(20),
  \`valor\` decimal(15,2) NOT NULL,
  \`dest_nome\` varchar(60),
  \`dest_doc\` varchar(14),
  \`dest_email\` varchar(60),
  \`xml_nfe\` mediumtext,
  \`dh_emi\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`notas_fiscais_ch_nfe_unique\` (\`ch_nfe\`)
)
`;

export async function runNfeMigration(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    await db.execute(CREATE_NFE_SEQUENCIA as any);
    await db.execute(SEED_NFE_SEQUENCIA as any);
    await db.execute(CREATE_NOTAS_FISCAIS as any);
    console.log("[nfe] Tabelas verificadas/criadas com sucesso");
  } catch (err) {
    console.error("[nfe] Erro ao criar tabelas:", err);
  }
}
