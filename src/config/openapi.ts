const id = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "integer", minimum: 1 },
};
const erro = (d: string) => ({
  description: d,
  content: {
    "application/json": { schema: { $ref: "#/components/schemas/Erro" } },
  },
});
const produto = (d: string) => ({
  description: d,
  content: {
    "application/json": { schema: { $ref: "#/components/schemas/Produto" } },
  },
});
const body = (ref: string) => ({
  required: true,
  content: {
    "application/json": { schema: { $ref: `#/components/schemas/${ref}` } },
  },
});

export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "API de Produtos",
    version: "1.0.0",
    description:
      "API REST (arquitetura MVC) que expõe o catálogo de produtos aos parceiros.",
  },
  tags: [{ name: "Produtos" }],
  paths: {
    "/produtos": {
      get: {
        tags: ["Produtos"],
        summary: "Lista produtos (Find All)",
        description:
          "Sem parâmetros retorna todos. Com page/limit, retorna paginado. Metadados vão nos headers.",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          200: {
            description: "Lista de produtos",
            headers: {
              "X-Total-Count": {
                schema: { type: "integer" },
                description: "Total de registros",
              },
              "X-Page": {
                schema: { type: "integer" },
                description: "Página atual (só se paginado)",
              },
              "X-Limit": {
                schema: { type: "integer" },
                description: "Itens por página (só se paginado)",
              },
              "X-Total-Pages": {
                schema: { type: "integer" },
                description: "Total de páginas (só se paginado)",
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Produto" },
                },
              },
            },
          },
          400: erro("Parâmetros de paginação inválidos"),
        },
      },
      post: {
        tags: ["Produtos"],
        summary: "Cria produto (Create)",
        requestBody: body("ProdutoInput"),
        responses: {
          201: produto(
            "Produto criado (header Location aponta para o recurso)",
          ),
          400: erro("Dados inválidos"),
        },
      },
    },
    "/produtos/contar": {
      get: {
        tags: ["Produtos"],
        summary: "Conta produtos",
        responses: {
          200: {
            description: "Total de registros",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { total: { type: "integer" } },
                },
              },
            },
          },
        },
      },
    },
    "/produtos/nome/{nome}": {
      get: {
        tags: ["Produtos"],
        summary: "Busca por nome (Find By Name)",
        description:
          "Busca parcial (LIKE %termo%). No SQLite, ignora maiúsculas/minúsculas apenas para caracteres ASCII.",
        parameters: [
          {
            name: "nome",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Produtos cujo nome contém o termo",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Produto" },
                },
              },
            },
          },
        },
      },
    },
    "/produtos/{id}": {
      parameters: [id],
      get: {
        tags: ["Produtos"],
        summary: "Busca por ID (Find By ID)",
        responses: {
          200: produto("Produto encontrado"),
          400: erro("ID inválido"),
          404: erro("Não encontrado"),
        },
      },
      put: {
        tags: ["Produtos"],
        summary: "Substitui produto (Update completo)",
        description:
          "Exige todos os campos obrigatórios. Opcionais omitidos voltam ao padrão.",
        requestBody: body("ProdutoInput"),
        responses: {
          200: produto("Produto substituído"),
          400: erro("Dados inválidos"),
          404: erro("Não encontrado"),
        },
      },
      patch: {
        tags: ["Produtos"],
        summary: "Atualiza parcialmente (Update parcial)",
        description:
          "Altera só os campos enviados. Ao menos um campo é obrigatório.",
        requestBody: body("ProdutoPatch"),
        responses: {
          200: produto("Produto atualizado"),
          400: erro("Dados inválidos"),
          404: erro("Não encontrado"),
        },
      },
      delete: {
        tags: ["Produtos"],
        summary: "Remove produto (Delete)",
        responses: {
          204: { description: "Removido" },
          400: erro("ID inválido"),
          404: erro("Não encontrado"),
        },
      },
    },
  },
  components: {
    schemas: {
      Produto: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          nome: { type: "string", example: "Notebook Gamer" },
          descricao: { type: "string", nullable: true },
          preco: { type: "number", example: 4999.9 },
          estoque: { type: "integer", example: 5 },
          categoria: { type: "string", nullable: true, example: "Informática" },
          criadoEm: { type: "string", format: "date-time" },
          atualizadoEm: { type: "string", format: "date-time" },
        },
      },
      ProdutoInput: {
        type: "object",
        required: ["nome", "preco"],
        properties: {
          nome: { type: "string", maxLength: 120, example: "Notebook Gamer" },
          descricao: { type: "string", nullable: true },
          preco: { type: "number", minimum: 0, example: 4999.9 },
          estoque: { type: "integer", minimum: 0, default: 0 },
          categoria: { type: "string", nullable: true, maxLength: 60 },
        },
      },
      ProdutoPatch: {
        type: "object",
        minProperties: 1,
        properties: {
          nome: { type: "string", maxLength: 120 },
          descricao: { type: "string", nullable: true },
          preco: { type: "number", minimum: 0 },
          estoque: { type: "integer", minimum: 0 },
          categoria: { type: "string", nullable: true, maxLength: 60 },
        },
      },
      Erro: {
        type: "object",
        properties: {
          erro: { type: "string" },
          detalhes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                campo: { type: "string" },
                mensagem: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
} as const;
