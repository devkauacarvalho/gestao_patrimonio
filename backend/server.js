// backend/server.js
import express from 'express';
import cors from 'cors';
import db from './db.js';

import 'dotenv/config';

import assetsRouter from "./routes/assets.js";
import authRoutes from "./routes/auth.js"; 

const app = express();
const port = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET não definido. Usando valor padrão. (Em produção, defina uma variável de ambiente forte!)");
  process.env.JWT_SECRET = "sua_chave_secreta_muito_forte_e_secreta"; 
}


app.get("/", (req, res) => {
  res.send("API de Gestão de Património está a funcionar!");
});

app.use("/api/assets", assetsRouter);
app.use("/api/auth", authRoutes); 

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Ocorreu um erro interno no servidor!" });
});

app.listen(port, () => {
  console.log(`Servidor backend a correr em http://localhost:${port}`);
});