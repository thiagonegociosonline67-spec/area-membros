export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // NF-e
  nfeCnpj: process.env.NFE_CNPJ ?? "",
  nfeRazaoSocial: process.env.NFE_RAZAO_SOCIAL ?? "",
  nfeCertBase64: process.env.NFE_CERT_BASE64 ?? "",
  nfeKeyPem: process.env.NFE_KEY_PEM ?? "",
  nfeTpAmb: process.env.NFE_TP_AMB ?? "1",
};
