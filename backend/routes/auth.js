// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Usaremos JWTs para autenticação simples
import db from '../db.js';

const router = express.Router();

// CHAVE SECRETA: Em um ambiente de produção, esta chave deve ser uma variável de ambiente forte e complexa.
// Por simplicidade, usaremos uma aqui. Não exponha esta chave publicamente!
const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_muito_forte_e_secreta";

// Middleware para verificar o token JWT (futuramente usado para rotas protegidas)
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (token == null) {
    return res.status(401).json({ message: "Token de autenticação ausente." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Erro na verificação do token:", err);
      return res.status(403).json({ message: "Token de autenticação inválido ou expirado." });
    }
    req.user = user; // Adiciona as informações do usuário decodificadas ao objeto de requisição
    next();
  });
};

// Middleware para verificar se o usuário é 'admin'
export const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Acesso negado. Requer privilégios de administrador." });
  }
  next();
};

// Rota de Login
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const userResult = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Nome de usuário ou senha inválidos.' });
    }

    // Comparar a senha fornecida com o hash armazenado
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(400).json({ message: 'Nome de usuário ou senha inválidos.' });
    }

    // Se a senha estiver correta, gerar um token JWT
    // O token conterá o ID e o papel do usuário (role)
    const accessToken = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' }); // Token expira em 1 hora

    res.json({ accessToken: accessToken, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    next(err);
  }
});

// Rota para criar um novo usuário (protegida por admin)
router.post('/users', authenticateToken, authorizeAdmin, async (req, res, next) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "Nome de usuário, senha e papel (role) são obrigatórios." });
  }

  try {
    // Verificar se o nome de usuário já existe
    const existingUser = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Nome de usuário já existe." });
    }

    // Gerar hash da senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await db.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, passwordHash, role]
    );
    res.status(201).json({ message: "Usuário criado com sucesso!", user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;