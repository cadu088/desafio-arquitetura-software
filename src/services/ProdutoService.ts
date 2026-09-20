import {
  ProdutoRepository,
  type ProdutoInput,
} from "../repositories/ProdutoRepository.js";
import { NotFoundError } from "../middlewares/errors.js";

export class ProdutoService {
  constructor(private readonly repo = new ProdutoRepository()) {}

  async listarTodos(page?: number, limit?: number) {
    if (page === undefined && limit === undefined) {
      const { rows } = await this.repo.findAll();
      return { itens: rows, total: rows.length, paginado: false as const };
    }
    const p = page ?? 1,
      l = limit ?? 20;
    const { rows, count } = await this.repo.findAll({
      limit: l,
      offset: (p - 1) * l,
    });
    return {
      itens: rows,
      total: count,
      paginado: true as const,
      page: p,
      limit: l,
      totalPages: Math.ceil(count / l),
    };
  }
  contar() {
    return this.repo.count();
  }
  buscarPorNome(nome: string) {
    return this.repo.findByName(nome);
  }

  async buscarPorId(id: number) {
    const p = await this.repo.findById(id);
    if (!p) throw new NotFoundError(`Produto ${id} não encontrado`);
    return p;
  }
  criar(data: ProdutoInput) {
    return this.repo.create(data);
  }

  async substituir(id: number, data: ProdutoInput) {
    return this.atualizar(id, {
      descricao: null,
      categoria: null,
      estoque: 0,
      ...data,
    });
  }
  async atualizar(id: number, data: Partial<ProdutoInput>) {
    const p = await this.repo.update(id, data);
    if (!p) throw new NotFoundError(`Produto ${id} não encontrado`);
    return p;
  }
  async remover(id: number) {
    if (!(await this.repo.delete(id)))
      throw new NotFoundError(`Produto ${id} não encontrado`);
  }
}

// Onde ficam as regras de negócio e a decisão do que é erro de domínio, por exemplo lançar `NotFoundError` quando o produto não existe. Depende só do repository, não de Express nem de Sequelize.
