import type { Request, Response } from "express";
import { ProdutoService } from "../services/ProdutoService.js";
import { ProdutoView } from "../views/ProdutoView.js";
import {
  idSchema,
  paginacaoSchema,
  produtoCreateSchema,
  produtoPatchSchema,
  produtoReplaceSchema,
} from "../middlewares/produtoSchemas.js";

export class ProdutoController {
  constructor(private readonly service = new ProdutoService()) {}

  listarTodos = async (req: Request, res: Response) => {
    const { page, limit } = paginacaoSchema.parse(req.query);
    const r = await this.service.listarTodos(page, limit);
    res.set("X-Total-Count", String(r.total));
    if (r.paginado) {
      res.set({
        "X-Page": String(r.page),
        "X-Limit": String(r.limit),
        "X-Total-Pages": String(r.totalPages),
      });
    }
    res.json(ProdutoView.many(r.itens));
  };

  contar = async (_req: Request, res: Response) =>
    res.json(ProdutoView.count(await this.service.contar()));

  buscarPorId = async (req: Request, res: Response) =>
    res.json(
      ProdutoView.one(
        await this.service.buscarPorId(idSchema.parse(req.params.id)),
      ),
    );

  buscarPorNome = async (req: Request, res: Response) =>
    res.json(
      ProdutoView.many(
        await this.service.buscarPorNome(String(req.params.nome)),
      ),
    );

  criar = async (req: Request, res: Response) => {
    const p = await this.service.criar(produtoCreateSchema.parse(req.body));
    res.status(201).location(`/produtos/${p.id}`).json(ProdutoView.one(p));
  };

  substituir = async (req: Request, res: Response) => {
    const p = await this.service.substituir(
      idSchema.parse(req.params.id),
      produtoReplaceSchema.parse(req.body),
    );
    res.json(ProdutoView.one(p));
  };

  atualizar = async (req: Request, res: Response) => {
    const p = await this.service.atualizar(
      idSchema.parse(req.params.id),
      produtoPatchSchema.parse(req.body),
    );
    res.json(ProdutoView.one(p));
  };

  remover = async (req: Request, res: Response) => {
    await this.service.remover(idSchema.parse(req.params.id));
    res.status(204).send();
  };
}

// Traduz HTTP para chamadas de serviço e de volta. Lê params, query e body, valida com zod, chama o service, escolhe o status code e devolve o resultado pela view. Não tem regra de negócio e não acessa o banco.
