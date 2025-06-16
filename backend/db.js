import 'dotenv/config';

import pg from 'pg';
const { Pool } = pg;

// Configuração do pool de conexões
// Lê as credenciais das variáveis de ambiente para segurança
const pool = new Pool({
  user: process.env.DB_USER || "postgres", // Usuário do banco (padrão: postgres)
  host: process.env.DB_HOST || "localhost", // Host do banco (padrão: localhost)
  database: process.env.DB_DATABASE || "asset_management", // Nome do banco de dados
  password: process.env.DB_PASSWORD || "admin123", // Senha do banco
  port: parseInt(process.env.DB_PORT || "5432"), // Porta do banco (padrão: 5432)
});

// Função para testar a conexão (opcional, mas útil)
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Erro ao conectar ao banco de dados:", err.stack);
  }
  console.log("Conexão com o banco de dados PostgreSQL estabelecida com sucesso!");
  client.query("SELECT NOW()", (err, result) => {
    release(); // Libera o cliente de volta para o pool
    if (err) {
      return console.error("Erro ao executar query de teste:", err.stack);
    }
    console.log("Query de teste executada:", result.rows);
  });
});

// Exporta uma função para executar queries
// No final do arquivo
export default {
  query: (text, params) => pool.query(text, params),
  pool: pool,
};