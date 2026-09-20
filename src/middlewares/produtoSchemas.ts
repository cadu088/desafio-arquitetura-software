import { z } from "zod";

export const produtoCreateSchema = z.object({
  nome: z.string().trim().min(1, "nome é obrigatório").max(120),
  descricao: z.string().nullish(),
  preco: z.number().nonnegative("preco não pode ser negativo"),
  estoque: z.number().int().nonnegative().optional(),
  categoria: z.string().max(60).nullish(),
});
export const produtoReplaceSchema = produtoCreateSchema;
export const produtoPatchSchema = produtoCreateSchema
  .partial()
  .refine((o) => Object.keys(o).length > 0, "envie ao menos um campo");
export const paginacaoSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
export const idSchema = z.coerce.number().int().positive("id inválido");

// Schemas de validação e o tratador de erros. Centralizar o tratamento evita `try/catch` repetido nos controllers (o Express 5 já repassa erros de funções async).
