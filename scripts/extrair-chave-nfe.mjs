/**
 * Extrai a chave privada RSA de um arquivo .pfx/.p12
 * Uso: node scripts/extrair-chave-nfe.mjs /caminho/certificado.pfx SENHA_DO_CERT
 *
 * O resultado (NFE_KEY_PEM) deve ser copiado para o .env
 */
import { execSync } from "child_process";
import { existsSync } from "fs";

const [, , pfxPath, senha] = process.argv;

if (!pfxPath || !existsSync(pfxPath)) {
  console.error("Uso: node scripts/extrair-chave-nfe.mjs /caminho/cert.pfx SENHA");
  process.exit(1);
}

try {
  const key = execSync(
    `openssl pkcs12 -in "${pfxPath}" -nocerts -nodes -passin pass:${senha ?? ""}`,
    { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
  );

  // Extrai só o bloco RSA PRIVATE KEY
  const match = key.match(/(-----BEGIN (?:RSA )?PRIVATE KEY-----[\s\S]+?-----END (?:RSA )?PRIVATE KEY-----)/);
  if (!match) {
    console.error("Não foi possível extrair a chave privada. Verifique a senha.");
    process.exit(1);
  }

  const pem = match[1];
  // Converte newlines para \n literal (formato para o .env)
  const envValue = pem.replace(/\n/g, "\\n");

  console.log("\n✅ Copie a linha abaixo para o seu .env:\n");
  console.log(`NFE_KEY_PEM="${envValue}"`);
  console.log("\n✅ Ou no painel de env vars do servidor, cole o valor abaixo (sem aspas):\n");
  console.log(pem);
} catch (e) {
  console.error("Erro ao processar o certificado:", e.message);
  console.error("Verifique se o OpenSSL está instalado: openssl version");
  process.exit(1);
}
