Todos os pontos entregáveis abaixo estão descritos neste documento. 
Resumo dos Entregáveis: 
1. Arquitetura do software (C4 Model/UML/Outro Diagrama no Draw.io). 
2. Estrutura de pastas do projeto MVC. 
3. Explicação da estrutura e dos elementos que comporão o código. 
4. Opcional (código funcionando). 
5. Opcional (persistência funcionando). 

# API de Produtos

Para esse desafio, utilizei a sugestão de criar o dominio de produto. 
Ele é por onde dados dos produtos serão recuperados, editados e removidos. 

API REST em Node.js que expõe o catálogo de produtos de uma empresa de vendas online para os parceiros. 
Segue o padrão arquitetural MVC, com uma camada de Service e outra de Repository entre o controller e o banco.

Os diagramas C4 (contexto, containers e componentes) estão em [`docs/arquitetura-c4.drawio`](docs/arquitetura-c4.drawio). 
O arquivo tem uma página para cada nível e abre no [draw.io](https://app.diagrams.net).


## Stack

- Node.js 22 e TypeScript
- Express 5 (HTTP)
- Sequelize + SQLite (persistência, arquivo local)
- Zod (validação de entrada)
- Swagger UI (documentação em `/docs`)

## Como rodar

```bash
npm install
npm run dev        # desenvolvimento, com reload
# ou
npm run build && npm start
```

A API sobe em `http://localhost:3000`. O banco é criado sozinho em `./data/produtos.sqlite` na primeira execução.

Variáveis opcionais: `PORT` (padrão 3000) e `DB_PATH` (padrão `./data/produtos.sqlite`).

A documentação interativa fica em `http://localhost:3000/docs` e a especificação OpenAPI em `/openapi.json`.

## Endpoints

| Operação | Método e rota | Sucesso | Erros |
|---|---|---|---|
| Criar | `POST /produtos` | 201 + header `Location` | 400 |
| Listar todos (Find All) | `GET /produtos` | 200 | 400 |
| Buscar por ID (Find By ID) | `GET /produtos/:id` | 200 | 400, 404 |
| Buscar por nome (Find By Name) | `GET /produtos/nome/:nome` | 200 | - |
| Contar | `GET /produtos/contar` | 200 `{ "total": n }` | - |
| Substituir (Update completo) | `PUT /produtos/:id` | 200 | 400, 404 |
| Atualizar parcialmente | `PATCH /produtos/:id` | 200 | 400, 404 |
| Remover | `DELETE /produtos/:id` | 204 | 400, 404 |

### Exemplo de produto

```json
{
  "id": 1,
  "nome": "Notebook Gamer",
  "descricao": null,
  "preco": 4999.9,
  "estoque": 5,
  "categoria": "Informática",
  "criadoEm": "2026-09-20T18:34:36.812Z",
  "atualizadoEm": "2026-09-20T18:34:36.812Z"
}
```

### Detalhes que vale saber

**Paginação.** `GET /produtos` sem parâmetros devolve todos os registros. Com `?page=2&limit=10` devolve só aquela página (`limit` padrão 20, máximo 100). O corpo é sempre um array; os metadados vão nos headers `X-Total-Count`, `X-Page`, `X-Limit` e `X-Total-Pages`. Assim o formato da resposta não muda conforme o parâmetro.

**PUT e PATCH.** O `PUT` substitui o recurso inteiro: `nome` e `preco` são obrigatórios e os opcionais omitidos voltam ao padrão (`descricao` e `categoria` viram `null`, `estoque` vira `0`). O `PATCH` altera só o que for enviado e exige pelo menos um campo.

**Busca por nome.** É parcial (`LIKE %termo%`). No SQLite isso ignora maiúsculas e minúsculas só para caracteres ASCII, então "café" e "CAFÉ" não são tratados como iguais.

**Erros.** Sempre em JSON. Dados inválidos retornam 400 com a lista de campos:

```json
{
  "erro": "Dados inválidos",
  "detalhes": [{ "campo": "preco", "mensagem": "preco não pode ser negativo" }]
}
```

## Arquitetura

Os diagramas C4 (contexto, containers e componentes) estão em [`docs/arquitetura-c4.drawio`](docs/arquitetura-c4.drawio). O arquivo tem uma página para cada nível e abre no [draw.io](https://app.diagrams.net).

### Fluxo de uma requisição

```
Parceiro → Routes → Controller → Service → Repository → Model → SQLite
                        │
                        └→ View (formata a resposta JSON)
```

O controller valida a entrada, pede o trabalho ao service e entrega o resultado para a view montar o JSON. Erros lançados em qualquer camada caem no middleware de erros, que decide o status HTTP.

### Estrutura de pastas

```
src/
├── config/
│   ├── database.ts        # conexão com o banco
│   └── openapi.ts         # especificação OpenAPI (Swagger)
├── models/
│   └── Produto.ts         # entidade de domínio (Model)
├── repositories/
│   └── ProdutoRepository.ts  # acesso ao banco
├── services/
│   └── ProdutoService.ts  # regras de negócio
├── controllers/
│   └── ProdutoController.ts  # entrada e saída HTTP (Controller)
├── views/
│   └── ProdutoView.ts     # formato público do JSON (View)
├── routes/
│   └── produtoRoutes.ts   # verbo + URL → método do controller
├── middlewares/
│   ├── produtoSchemas.ts  # schemas de validação (zod)
│   └── errors.ts          # erros de domínio e tratador central
├── app.ts                 # monta o Express (JSON, rotas, docs, erros)
└── server.ts              # sobe o servidor e sincroniza o banco
docs/
└── arquitetura-c4.drawio  # diagramas C4 (níveis 1, 2 e 3)
```

### Papel de cada componente

**Model** (`models/`). Descreve o produto e a tabela onde ele é guardado. Não tem regra de negócio nem conhece HTTP.

**View** (`views/`). Numa API não existe tela, então a view é a camada que decide como o Model aparece para quem consome: nomes dos campos (`criadoEm` em vez de `createdAt`), `preco` como número, campos vazios como `null`. Com isso o contrato com os parceiros não depende de como os dados são guardados.

**Controller** (`controllers/`). Traduz HTTP para chamadas de serviço e de volta. Lê params, query e body, valida com zod, chama o service, escolhe o status code e devolve o resultado pela view. Não tem regra de negócio e não acessa o banco.

**Service** (`services/`). Onde ficam as regras de negócio e a decisão do que é erro de domínio, por exemplo lançar `NotFoundError` quando o produto não existe. Depende só do repository, não de Express nem de Sequelize.

**Repository** (`repositories/`). Único lugar que fala com o banco. Trocar SQLite por Postgres, ou Sequelize por outro ORM, mexe só nesta camada e em `config/database.ts`.

**Routes** (`routes/`). Liga verbo e URL ao método do controller. As rotas fixas (`/contar`, `/nome/:nome`) ficam antes de `/:id`, senão o Express leria "contar" como um id.

**Middlewares** (`middlewares/`). Schemas de validação e o tratador de erros. Centralizar o tratamento evita `try/catch` repetido nos controllers (o Express 5 já repassa erros de funções async).

### Por que Service e Repository, se o MVC clássico só tem três letras

O MVC sozinho tende a empurrar regra de negócio e SQL para dentro do controller ou do model. Separar em Service e Repository mantém cada camada com uma responsabilidade só, deixa o service fácil de testar sem banco e torna a troca de tecnologia de persistência barata. O enunciado sugere a mesma organização.

## Decisões de design

- **SQLite** para a persistência: não exige instalar nada e o banco vai junto com o projeto. Para produção com vários parceiros, o passo natural é Postgres; como o acesso está isolado no repository, a troca é pequena.
- **Zod** para validar na borda (controller), assim o service sempre recebe dados já válidos.
- **Header em vez de envelope** na paginação, pelo motivo explicado acima.
- **`PUT` e `PATCH` separados**, seguindo a semântica HTTP.

## Limites atuais

A API não tem autenticação nem limite de requisições. Como ela é pública para parceiros, o próximo passo seria uma chave de API ou OAuth por parceiro, mais rate limiting. Também não há testes automatizados; os endpoints foram verificados manualmente com `curl`.
