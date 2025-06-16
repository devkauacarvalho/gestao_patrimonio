import express from 'express';
import cors from 'cors';
import db from './db.js';

import 'dotenv/config';

const app = express();
const port = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API de Gestão de Património está a funcionar!");
});

import assetsRouter from "./routes/assets.js";
app.use("/api/assets", assetsRouter);

// ESTA É A SEÇÃO CRÍTICA QUE PRECISA ESTAR CORRETA
app.use((err, req, res, next) => {
  console.error(err.stack); // ISSO VAI MOSTRAR O ERRO REAL NO SEU TERMINAL DE BACKEND
  res.status(500).json({ message: err.message || "Ocorreu um erro interno no servidor!" });
});

app.listen(port, () => {
  console.log(`Servidor backend a correr em http://localhost:${port}`);
});