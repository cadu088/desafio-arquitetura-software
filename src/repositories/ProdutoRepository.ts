import { Op } from "sequelize";
import { Produto } from "../models/Produto.js";

export type ProdutoInput = {
  nome: string;
  descricao?: string | null;
  preco: number;
  estoque?: number;
  categoria?: string | null;
};

export class ProdutoRepository {
  findAll(page?: { limit: number; offset: number }) {
    return Produto.findAndCountAll({ order: [["id", "ASC"]], ...page });
  }
  findById(id: number) {
    return Produto.findByPk(id);
  }
  findByName(nome: string) {
    return Produto.findAll({ where: { nome: { [Op.like]: `%${nome}%` } } });
  }
  count() {
    return Produto.count();
  }
  create(data: ProdutoInput) {
    return Produto.create(data);
  }
  async update(id: number, data: Partial<ProdutoInput>) {
    const p = await Produto.findByPk(id);
    return p ? p.update(data) : null;
  }
  async delete(id: number) {
    return (await Produto.destroy({ where: { id } })) > 0;
  }
}

// Único lugar que fala com o banco. Trocar SQLite por Postgres, ou Sequelize por outro ORM, mexe só nesta camada e em `config/database.ts`.
