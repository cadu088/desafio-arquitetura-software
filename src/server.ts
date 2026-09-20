import { mkdirSync } from "node:fs";
import { app } from "./app.js";
import { sequelize } from "./config/database.js";
import "./models/Produto.js";

mkdirSync("./data", { recursive: true });
await sequelize.sync();
const port = Number(process.env.PORT ?? 3000);
app.listen(port, () =>
  console.log(
    `API rodando em http://localhost:${port} | Para acessar a documentação, abra http://localhost:${port}/docs`,
  ),
);
