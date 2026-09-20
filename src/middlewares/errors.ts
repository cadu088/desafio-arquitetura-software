import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class NotFoundError extends Error {
  constructor(message = "Recurso não encontrado") {
    super(message);
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      erro: "Dados inválidos",
      detalhes: err.issues.map((i) => ({
        campo: i.path.join("."),
        mensagem: i.message,
      })),
    });
  }
  if (err instanceof NotFoundError)
    return res.status(404).json({ erro: err.message });
  console.error(err);
  return res.status(500).json({ erro: "Erro interno do servidor" });
}

// Schemas de validação e o tratador de erros. Centralizar o tratamento evita `try/catch` repetido nos controllers (o Express 5 já repassa erros de funções async).
