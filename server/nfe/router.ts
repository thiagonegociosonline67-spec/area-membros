import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc.js";
import { TRPCError } from "@trpc/server";
import { buildNFeXML, buildEnviNFe } from "./xml.js";
import { signNFe } from "./sign.js";
import { enviarNFe } from "./sefaz.js";
import { proximoNNF, salvarNFe, listarNFes } from "./db.js";

const EnderecoSchema = z.object({
  xLgr: z.string(),
  nro: z.string(),
  xCpl: z.string().optional(),
  xBairro: z.string(),
  cMun: z.string(),
  xMun: z.string(),
  uf: z.string().length(2),
  cep: z.string(),
  cPais: z.string().optional(),
  xPais: z.string().optional(),
});

const DestinatarioSchema = z.object({
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  xNome: z.string().max(60),
  email: z.string().email().optional(),
  indIEDest: z.enum(["1", "2", "9"]),
  enderDest: EnderecoSchema,
});

const ProdutoSchema = z.object({
  xProd: z.string().max(120),
  vUnCom: z.number().positive(),
  qCom: z.number().positive().optional(),
});

export const nfeRouter = router({
  emitir: adminProcedure
    .input(
      z.object({
        dest: DestinatarioSchema,
        produto: ProdutoSchema,
        vPag: z.number().positive(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const certBase64 = process.env.NFE_CERT_BASE64;
      const privateKeyPem = process.env.NFE_KEY_PEM;

      if (!certBase64 || !privateKeyPem) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Certificado digital não configurado (NFE_CERT_BASE64 / NFE_KEY_PEM)",
        });
      }

      const nNF = await proximoNNF();

      const { nfeXml, infNFeXml, chNFe, vNF } = buildNFeXML({
        nNF,
        dest: input.dest,
        produto: input.produto,
        vPag: input.vPag,
      });

      const signedXml = signNFe(nfeXml, infNFeXml, chNFe, certBase64, privateKeyPem);

      const lote = String(Date.now()).slice(-10);
      const enviNFe = buildEnviNFe(signedXml, lote);

      const { retorno, rawXml } = await enviarNFe(enviNFe);

      await salvarNFe({
        chNFe,
        nNF,
        userId: ctx.user.id,
        valor: vNF,
        destNome: input.dest.xNome,
        destDoc: input.dest.cpf ?? input.dest.cnpj,
        destEmail: input.dest.email,
        xmlNFe: rawXml,
        retorno,
      });

      return {
        success: retorno.cStat === "100",
        chNFe,
        cStat: retorno.cStat,
        xMotivo: retorno.xMotivo,
        nProt: retorno.nProt,
      };
    }),

  listar: adminProcedure.query(async () => {
    return listarNFes();
  }),
});
