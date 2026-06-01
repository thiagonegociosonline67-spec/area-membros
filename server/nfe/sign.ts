import crypto from "crypto";

const XMLDSIG = "http://www.w3.org/2000/09/xmldsig#";
const C14N = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";

function sha1b64(data: string): string {
  return crypto.createHash("sha1").update(data, "utf8").digest("base64");
}

function rsaSha1b64(data: string, privKeyPem: string): string {
  const sign = crypto.createSign("RSA-SHA1");
  sign.update(data, "utf8");
  return sign.sign(privKeyPem, "base64");
}

function normPem(pem: string): string {
  return pem.replace(/\\n/g, "\n");
}

export function signNFe(
  nfeXml: string,
  infNFeXml: string,
  chNFe: string,
  certBase64: string,
  privateKeyPem: string,
): string {
  const digest = sha1b64(infNFeXml);

  const siContent =
    `<CanonicalizationMethod Algorithm="${C14N}"></CanonicalizationMethod>` +
    `<SignatureMethod Algorithm="${XMLDSIG}rsa-sha1"></SignatureMethod>` +
    `<Reference URI="#NFe${chNFe}">` +
    `<Transforms>` +
    `<Transform Algorithm="${XMLDSIG}enveloped-signature"></Transform>` +
    `<Transform Algorithm="${C14N}"></Transform>` +
    `</Transforms>` +
    `<DigestMethod Algorithm="${XMLDSIG}sha1"></DigestMethod>` +
    `<DigestValue>${digest}</DigestValue>` +
    `</Reference>`;

  // SignedInfo com xmlns explícito para assinatura (C14N de subset inclui namespace herdado)
  const siForSign = `<SignedInfo xmlns="${XMLDSIG}">${siContent}</SignedInfo>`;
  const sigVal = rsaSha1b64(siForSign, normPem(privateKeyPem));

  const signature =
    `<Signature xmlns="${XMLDSIG}">` +
    `<SignedInfo>${siContent}</SignedInfo>` +
    `<SignatureValue>${sigVal}</SignatureValue>` +
    `<KeyInfo><X509Data><X509Certificate>${certBase64}</X509Certificate></X509Data></KeyInfo>` +
    `</Signature>`;

  // Insere Signature antes do fechamento de </NFe>
  return nfeXml.replace("</NFe>", `${signature}</NFe>`);
}
