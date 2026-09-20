import express from "express";
import { produtoRoutes } from "./routes/produtoRoutes.js";
import swaggerUi from "swagger-ui-express";
import { openapi } from "./config/openapi.js";
import { errorHandler } from "./middlewares/errors.js";

export const app = express();
app.use(express.json());
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/openapi.json", (_req, res) => res.json(openapi)); //banco rsrs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi as any));
app.use("/produtos", produtoRoutes);
app.use(errorHandler);
