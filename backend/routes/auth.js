import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "sua_chave_secreta_muito_forte_e_secreta";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: "Token de autenticação ausente." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Erro na verificação do token:", err);
      return res.status(403).json({ message: "Token de autenticação inválido ou expirado." });
    }
    req.user = user;
    next();
  });
};

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
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Nome de usuário ou senha inválidos.' });
    }
    const accessToken = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
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
    const existingUser = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "Nome de usuário já existe." });
    }

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


// GET /api/auth/users - Obter todos os usuários (Admin)
router.get('/users', authenticateToken, authorizeAdmin, async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, username, role, created_at FROM users ORDER BY username ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/users/:id - Atualizar um usuário (Admin)
router.put('/users/:id', authenticateToken, authorizeAdmin, async (req, res, next) => {
    const { id } = req.params;
    const { username, role } = req.body;

    if (!username || !role) {
        return res.status(400).json({ message: "Nome de usuário e Papel (role) são obrigatórios." });
    }
    if (req.user.id === parseInt(id, 10)) {
        return res.status(403).json({ message: "Administradores não podem alterar o próprio papel." });
    }

    try {
        const result = await db.query(
            'UPDATE users SET username = $1, role = $2 WHERE id = $3 RETURNING id, username, role',
            [username, role, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: "Este nome de usuário já está em uso." });
        }
        next(err);
    }
});

// PUT /api/auth/users/:id/password - Alterar senha de um usuário (Admin)
router.put('/users/:id/password', authenticateToken, authorizeAdmin, async (req, res, next) => {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: "A nova senha é obrigatória." });
    }

    try {
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const result = await db.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id',
            [passwordHash, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
        res.status(200).json({ message: "Senha do usuário atualizada com sucesso." });
    } catch (err) {
        next(err);
    }
});


// DELETE /api/auth/users/:id - Excluir um usuário (Admin)
router.delete('/users/:id', authenticateToken, authorizeAdmin, async (req, res, next) => {
    const { id } = req.params;

    if (req.user.id === parseInt(id, 10)) {
        return res.status(403).json({ message: "Não é permitido auto-excluir sua própria conta de administrador." });
    }

    try {
        const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id, username', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado para exclusão." });
        }
        res.status(200).json({ message: `Usuário '${result.rows[0].username}' excluído com sucesso.` });
    } catch (err) {
        next(err);
    }
});

export default router;
