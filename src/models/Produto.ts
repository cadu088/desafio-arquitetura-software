import {
  DataTypes,
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  type CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class Produto extends Model<
  InferAttributes<Produto>,
  InferCreationAttributes<Produto>
> {
  declare id: CreationOptional<number>;
  declare nome: string;
  declare descricao: string | null;
  declare preco: number;
  declare estoque: CreationOptional<number>;
  declare categoria: string | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Produto.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING(120), allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: true },
    preco: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    estoque: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    categoria: { type: DataTypes.STRING(60), allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "produtos", timestamps: true },
);

// Descreve o produto e a tabela onde ele é guardado. Não tem regra de negócio nem conhece HTTP.
