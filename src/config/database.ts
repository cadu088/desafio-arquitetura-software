import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.DB_PATH ?? "./data/produtos.sqlite",
  logging: false,
});
