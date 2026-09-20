import type { Produto } from "../models/Produto.js";

export const ProdutoView = {
  one(p: Produto) {
    return {
      id: p.id,
      nome: p.nome,
      descricao: p.descricao ?? null,
      preco: Number(p.preco),
      estoque: p.estoque,
      categoria: p.categoria ?? null,
      criadoEm: p.createdAt,
      atualizadoEm: p.updatedAt,
    };
  },
  many(list: Produto[]) {
    return list.map(ProdutoView.one);
  },
  count(total: number) {
    return { total };
  },
};

// Numa API não existe tela, então a view é a camada que decide como o Model aparece para quem consome: nomes dos campos (`criadoEm` em vez de `createdAt`), `preco` como número, campos vazios como `null`. Com isso o contrato com os parceiros não depende de como os dados são guardados.
