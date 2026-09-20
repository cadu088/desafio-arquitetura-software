import { Router } from "express";
import { ProdutoController } from "../controllers/ProdutoController.js";

const c = new ProdutoController();
export const produtoRoutes = Router();

produtoRoutes.get("/", c.listarTodos);
produtoRoutes.get("/contar", c.contar);
produtoRoutes.get("/nome/:nome", c.buscarPorNome);
produtoRoutes.get("/:id", c.buscarPorId);
produtoRoutes.post("/", c.criar);
produtoRoutes.put("/:id", c.substituir);
produtoRoutes.patch("/:id", c.atualizar);
produtoRoutes.delete("/:id", c.remover);

// Implemente os seguintes métodos:
// ▪ CRUD: Criação (Create), Leitura (Read), Atualização (Update) e Exclusão
// (Delete).
// ▪ Contagem: Endpoint para retornar o número total de registros.
// ▪ Find All: Endpoint para retornar todos os registros.
// ▪ Find By ID: Endpoint para retornar um registro específico com base no
// ID.
// ▪ Find By Name: Endpoint para retornar registros que correspondam a
// um nome específico.

// Liga verbo e URL ao método do controller. As rotas fixas (`/contar`, `/nome/:nome`) ficam antes de `/:id`, senão o Express leria "contar" como um id.
