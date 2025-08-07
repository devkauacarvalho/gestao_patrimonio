import express from 'express';
const router = express.Router();
import db from '../db.js';
import { authenticateToken, authorizeAdmin } from './auth.js';

// --- ROTAS DE CATEGORIAS ---

// GET /api/assets/categories - Obter todas as categorias (Público)
router.get("/categories", async (req, res, next) => {
  try {
    const result = await db.query("SELECT id, name, prefix, sequence_name FROM categories ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/assets/categories - Adicionar nova categoria (Admin)
router.post("/categories", authenticateToken, authorizeAdmin, async (req, res, next) => {
  const { name, prefix } = req.body;
  if (!name || !prefix) {
    return res.status(400).json({ message: "Nome e Prefixo da categoria são obrigatórios." });
  }

  const sequenceName = `${prefix.toLowerCase().replace(/[^a-z0-9]/g, '')}_seq`;

  try {
    await db.query(`CREATE SEQUENCE IF NOT EXISTS ${sequenceName} START WITH 1 INCREMENT BY 1`);
    const result = await db.query(
      "INSERT INTO categories (name, prefix, sequence_name) VALUES ($1, $2, $3) RETURNING *",
      [name, prefix, sequenceName]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
        return res.status(409).json({ message: "Nome ou Prefixo da categoria já existe." });
    }
    next(err);
  }
});

// PUT /api/assets/categories/:id - Atualizar uma categoria (Admin)
router.put("/categories/:id", authenticateToken, authorizeAdmin, async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "O nome da categoria é obrigatório." });
  }

  try {
    const result = await db.query(
      "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Categoria não encontrada." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
        return res.status(409).json({ message: "Este nome de categoria já existe." });
    }
    next(err);
  }
});

// DELETE /api/assets/categories/:id - Apagar uma categoria (Admin)
router.delete("/categories/:id", authenticateToken, authorizeAdmin, async (req, res, next) => {
  const { id } = req.params;
  try {
    const assetCheck = await db.query("SELECT id FROM assets WHERE category_id = $1 LIMIT 1", [id]);
    if (assetCheck.rows.length > 0) {
      return res.status(400).json({ message: "Não é possível excluir a categoria, pois ela já está sendo utilizada por um ou mais ativos." });
    }

    const result = await db.query("DELETE FROM categories WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Categoria não encontrada para apagar." });
    }
    res.status(200).json({ message: "Categoria apagada com sucesso." });
  } catch (err) {
    next(err);
  }
});


// --- ROTAS DE ATIVOS ---

// GET /api/assets - Obter todos os ativos
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT a.*, c.name as category_name, c.prefix as category_prefix
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY a.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/assets/:id - Obter um ativo específico
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const assetResult = await db.query(`
      SELECT a.*, c.name as category_name, c.prefix as category_prefix
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = $1
    `, [id]);
    if (assetResult.rows.length === 0) {
      return res.status(404).json({ message: "Ativo não encontrado" });
    }
    const historyResult = await db.query(
      'SELECT * FROM history_entries WHERE asset_id = $1 ORDER BY "timestamp" DESC',
      [id]
    );
    const asset = assetResult.rows[0];
    asset.historico = historyResult.rows;
    res.json(asset);
  } catch (err) {
    next(err);
  }
});

// POST /api/assets - Adicionar um novo ativo
router.post("/", authenticateToken, async (req, res, next) => {
  const { nome, descricao, numero_serie, modelo, localizacao, status, data_aquisicao, info_garantia, utilizador, category_id } = req.body;

  if (!nome || !modelo || !localizacao || !status || !data_aquisicao || !category_id) {
    return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos." });
  }

  try {
    const categoryResult = await db.query("SELECT prefix, sequence_name FROM categories WHERE id = $1", [category_id]);
    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ message: "Categoria selecionada inválida." });
    }
    const { prefix: categoryPrefix, sequence_name: categorySequenceName } = categoryResult.rows[0];

    const seqResult = await db.query(`SELECT nextval('${categorySequenceName}') as next_num`);
    const nextNum = seqResult.rows[0].next_num;

    const newId = `MAKEDIST-${categoryPrefix}-${String(nextNum).padStart(5, '0')}`;

    const result = await db.query(
      `INSERT INTO assets (id, nome, descricao, numero_serie, modelo, localizacao, status, data_aquisicao, info_garantia, ultima_atualizacao, utilizador, category_id, atualizado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, $10, $11, $12) RETURNING *`,
      [newId, nome, descricao, numero_serie, modelo, localizacao, status, data_aquisicao, info_garantia, utilizador, category_id, req.user.username]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/assets/:id - Atualizar um ativo
router.put("/:id", authenticateToken, async (req, res, next) => {
  const { id } = req.params;
  const { nome, descricao, localizacao, status, utilizador, category_id } = req.body;

  if (!nome || !status || !category_id) {
    return res.status(400).json({ message: "Nome, Status e Categoria são obrigatórios." });
  }

  try {
    const result = await db.query(
      "UPDATE assets SET nome = $1, descricao = $2, localizacao = $3, status = $4, utilizador = $5, category_id = $6, ultima_atualizacao = CURRENT_TIMESTAMP, atualizado_por = $7 WHERE id = $8 RETURNING *",
      [nome, descricao, localizacao, status, utilizador, category_id, req.user.username, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ativo não encontrado para atualização" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/assets/:assetId/history - Adicionar uma nova entrada de histórico
router.post("/:assetId/history", authenticateToken, async (req, res, next) => {
  const { tipo_evento, descricao } = req.body;
  const { assetId } = req.params;

  if (!tipo_evento || !descricao) {
    return res.status(400).json({ message: "Tipo e Descrição são obrigatórios para o histórico." });
  }

  try {
    const assetCheck = await db.query("SELECT id FROM assets WHERE id = $1", [assetId]);
    if (assetCheck.rows.length === 0) {
        return res.status(404).json({ message: "Ativo não encontrado para adicionar histórico." });
    }

    const result = await db.query(
      'INSERT INTO history_entries (asset_id, tipo_evento, descricao, responsavel, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [assetId, tipo_evento, descricao, req.user.username, req.user.id]
    );

    await db.query("UPDATE assets SET ultima_atualizacao = CURRENT_TIMESTAMP, atualizado_por = $1 WHERE id = $2", [req.user.username, assetId]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/assets/:id - Apagar um ativo
router.delete("/:id", authenticateToken, authorizeAdmin, async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM assets WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ativo não encontrado para apagar" });
    }
    res.status(200).json({ message: "Ativo apagado com sucesso", deletedAsset: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
