// backend/routes/assets.js
import express from 'express';
const router = express.Router();
import db from '../db.js';

// GET /api/assets - Obter todos os ativos
router.get("/", async (req, res, next) => {
  try {
    // Adiciona 'utilizador' na seleção explícita
    const result = await db.query("SELECT id, nome, descricao, numero_serie, modelo, localizacao, status, data_aquisicao, info_garantia, ultima_atualizacao, atualizado_por, utilizador FROM assets ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/assets/:id - Obter um ativo específico pelo ID
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    // Adiciona 'utilizador' na seleção explícita
    const assetResult = await db.query("SELECT id, nome, descricao, numero_serie, modelo, localizacao, status, data_aquisicao, info_garantia, ultima_atualizacao, atualizado_por, utilizador FROM assets WHERE id = $1", [id]);
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

// POST /api/assets - Adicionar um novo ativo (para criação)
router.post("/", async (req, res, next) => {
  // Adiciona 'utilizador' na desestruturação do corpo da requisição
  const { nome, descricao, numero_serie, modelo, localizacao, status, data_aquisicao, info_garantia, utilizador } = req.body;

  if (!nome || !modelo || !localizacao || !status || !data_aquisicao) {
    return res.status(400).json({ message: "Nome, Modelo, Localização, Status e Data de Aquisição são obrigatórios para criar um ativo." });
  }

  try {
    const seqResult = await db.query("SELECT nextval('asset_id_seq') as next_num");
    const nextNum = seqResult.rows[0].next_num;
    const newId = `MAKEDIST-MAQ-${String(nextNum).padStart(5, '0')}`;

    // Adiciona 'utilizador' na consulta INSERT e nos valores
    const result = await db.query(
      `INSERT INTO assets (id, nome, descricao, numero_serie, modelo, localizacao, status, data_aquisicao, info_garantia, ultima_atualizacao, utilizador)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, $10) RETURNING *`,
      [newId, nome, descricao, numero_serie, modelo, localizacao, status, data_aquisicao, info_garantia, utilizador]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/assets/:id - Atualizar um ativo (para edição)
router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  // Adiciona 'utilizador' na desestruturação do corpo da requisição
  const { nome, descricao, localizacao, status, utilizador } = req.body;

  if (!nome || !status) {
    return res.status(400).json({ message: "Nome e Status são obrigatórios." });
  }

  try {
    // Adiciona 'utilizador' na consulta UPDATE
    const result = await db.query(
      "UPDATE assets SET nome = $1, descricao = $2, localizacao = $3, status = $4, utilizador = $5, ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *",
      [nome, descricao, localizacao, status, utilizador, id]
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
router.post("/:assetId/history", async (req, res, next) => {
  const { tipo_evento, descricao, responsavel } = req.body;
  const { assetId } = req.params;

  // Validação básica
  if (!tipo_evento || !descricao) {
    return res.status(400).json({ message: "Tipo e Descrição são obrigatórios para o histórico." });
  }

  try {
    const assetCheck = await db.query("SELECT id FROM assets WHERE id = $1", [assetId]);
    if (assetCheck.rows.length === 0) {
        return res.status(404).json({ message: "Ativo não encontrado para adicionar histórico." });
    }

    const result = await db.query(
      'INSERT INTO history_entries (asset_id, tipo_evento, descricao, responsavel) VALUES ($1, $2, $3, $4) RETURNING *',
      [assetId, tipo_evento, descricao, responsavel]
    );

    await db.query("UPDATE assets SET ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = $1", [assetId]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});


// DELETE /api/assets/:id - Apagar um ativo (Opcional)
router.delete("/:id", async (req, res, next) => {
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