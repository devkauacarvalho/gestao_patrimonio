
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import assetsRouter from "./routes/assets.js";
import authRoutes from "./routes/auth.js";

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*'
};

app.use(cors(corsOptions));
app.use(express.json());

app.get("/api", (req, res) => {
  res.send("API de Gestão de Património está a funcionar!");
});

app.use("/api/assets", assetsRouter);
app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Ocorreu um erro interno no servidor!" });
});

export default app;
