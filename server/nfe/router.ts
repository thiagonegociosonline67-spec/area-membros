import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc.js";
import { TRPCError } from "@trpc/server";
import { buildNFeXML, buildEnviNFe } from "./xml.js";
import { signNFe } from "./sign.js";
import { enviarNFe } from "./sefaz.js";
import { proximoNNF, salvarNFe, listarNFes } from "./db.js";
import { EMIT } from "./constants.js";

const EnderecoSchema = z.object({
  xLgr: z.string().min(1).max(60),
  nro: z.string().min(1).max(60),
  xCpl: z.string().max(60).optional(),
  xBairro: z.string().min(1).max(60),
  cMun: z.string().length(7),
  xMun: z.string().min(1).max(60),
  uf: z.string().length(2),
  cep: z.string().regex(/^\d{8}$/, "CEP deve ter 8 dígitos"),
  cPais: z.string().optional(),
  xPais: z.string().optional(),
});

const DestinatarioSchema = z.object({
  cpf: z.string().regex(/^\d{11}$/).optional(),
  cnpj: z.string().regex(/^\d{14}$/).optional(),
  xNome: z.string().min(1).max(60),
  email: z.string().email().max(60).optional(),
  indIEDest: z.enum(["1", "2", "9"]).default("9"),
  enderDest: EnderecoSchema,
});

const ProdutoSchema = z.object({
  xProd: z.string().min(1).max(120),
  vUnCom: z.number().positive(),
  qCom: z.number().positive().default(1),
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
      // Validações de configuração
      if (!EMIT.cnpj) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "NFE_CNPJ não configurado",
        });
      }
      if (!EMIT.xNome) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "NFE_RAZAO_SOCIAL não configurado",
        });
      }

      const certBase64 = process.env.NFE_CERT_BASE64;
      const privateKeyPem = process.env.NFE_KEY_PEM;

      if (!certBase64 || !privateKeyPem) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Certificado digital não configurado (NFE_CERT_BASE64 / NFE_KEY_PEM)",
        });
      }

      // Garante que pelo menos CPF ou CNPJ foi informado
      if (!input.dest.cpf && !input.dest.cnpj) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Informe CPF ou CNPJ do destinatário",
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
