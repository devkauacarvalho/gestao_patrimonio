import 'dotenv/config';

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || "neondb_owner", 
  host: process.env.DB_HOST || "ep-rapid-hat-ac6u3nce-pooler.sa-east-1.aws.neon.tech", 
  database: process.env.DB_DATABASE || "neondb", 
  password: process.env.DB_PASSWORD || "npg_DtSQwLN6Y8Tp",
  port: parseInt(process.env.DB_PORT || "5432"), 
  ssl: true,
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Erro ao conectar ao banco de dados:", err.stack);
  }
  console.log("Conexão com o banco de dados PostgreSQL estabelecida com sucesso!");
  client.query("SELECT NOW()", (err, result) => {
    release(); 
    if (err) {
      return console.error("Erro ao executar query de teste:", err.stack);
    }
    console.log("Query de teste executada:", result.rows);
  });
});

export default {
  query: (text, params) => pool.query(text, params),
  pool: pool,
};