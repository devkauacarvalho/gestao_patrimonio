import express from 'express';
const router = express.Router();
import db from '../db.js'; // Importa a conexão com o banco

// GET /api/assets - Obter todos os ativos
router.get("/", async (req, res, next) => {
  try {
    // Ordena por ID para consistência, pode ajustar conforme necessário
    const result = await db.query("SELECT * FROM assets ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    next(err); // Passa o erro para o middleware de tratamento de erros
  }
});

// GET /api/assets/:id - Obter um ativo específico pelo ID
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const assetResult = await db.query("SELECT * FROM assets WHERE id = $1", [id]);
    if (assetResult.rows.length === 0) {
      return res.status(404).json({ message: "Ativo não encontrado" });
    }
    // Busca também o histórico associado
    const historyResult = await db.query(
      'SELECT * FROM history_entries WHERE asset_id = $1 ORDER BY "timestamp" DESC',
      [id]
    );
    // Combina os resultados
    const asset = assetResult.rows[0];
    asset.historico = historyResult.rows; // Adiciona o histórico ao objeto do ativo
    res.json(asset);
  } catch (err) {
    next(err);
  }
});

// POST /api/assets - Adicionar um novo ativo (para criação)
router.post("/", async (req, res, next) => {
  // Extrai os campos do corpo da requisição.
  // Assume que o ID será fornecido pelo frontend ou gerado aqui.
  // Para simplificar, vamos assumir que o frontend pode enviar um `id_interno` que será usado como `id`.
  const { id, nome, descricao, numero_serie, id_interno, modelo, localizacao, status, data_aquisicao, info_garantia } = req.body;

  // Validação básica
  if (!id || !nome || !id_interno || !modelo || !localizacao || !status || !data_aquisicao) {
    return res.status(400).json({ message: "ID, Nome, ID Interno, Modelo, Localização, Status e Data de Aquisição são obrigatórios para criar um ativo." });
  }

  try {
    // Verifica se o ID já existe
    const existingAsset = await db.query("SELECT id FROM assets WHERE id = $1", [id]);
    if (existingAsset.rows.length > 0) {
      return res.status(409).json({ message: `Ativo com ID "${id}" já existe.` });
    }

    const result = await db.query(
      `INSERT INTO assets (id, nome, descricao, numero_serie, id_interno, modelo, localizacao, status, data_aquisicao, info_garantia, ultima_atualizacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP) RETURNING *`,
      [id, nome, descricao, numero_serie, id_interno, modelo, localizacao, status, data_aquisicao, info_garantia]
    );
    res.status(201).json(result.rows[0]); // Retorna o ativo criado
  } catch (err) {
    next(err);
  }
});


// PUT /api/assets/:id - Atualizar um ativo (para edição)
router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  // Extrai apenas os campos permitidos para atualização do corpo da requisição
  const { nome, descricao, localizacao, status } = req.body;

  // Validação básica (pode ser mais robusta)
  if (!nome || !status) {
    return res.status(400).json({ message: "Nome e Status são obrigatórios." });
  }

  try {
    const result = await db.query(
      "UPDATE assets SET nome = $1, descricao = $2, localizacao = $3, status = $4, ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *",
      [nome, descricao, localizacao, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ativo não encontrado para atualização" });
    }
    res.json(result.rows[0]); // Retorna o ativo atualizado
  } catch (err) {
    next(err);
  }
});

// POST /api/assets/:assetId/history - Adicionar uma nova entrada de histórico
router.post("/:assetId/history", async (req, res, next) => {
  const { assetId } = req.params;
  const { tipo, descricao, usuario } = req.body;

  // Validação básica
  if (!tipo || !descricao) {
    return res.status(400).json({ message: "Tipo e Descrição são obrigatórios para o histórico." });
  }

  try {
    // Verifica se o ativo existe antes de adicionar histórico
    const assetCheck = await db.query("SELECT id FROM assets WHERE id = $1", [assetId]);
    if (assetCheck.rows.length === 0) {
        return res.status(404).json({ message: "Ativo não encontrado para adicionar histórico." });
    }

    // Insere a nova entrada de histórico
    // O timestamp e id são gerados automaticamente pelo banco (DEFAULT)
    const result = await db.query(
      'INSERT INTO history_entries (asset_id, tipo, descricao, usuario) VALUES ($1, $2, $3, $4) RETURNING *',
      [assetId, tipo, descricao, usuario]
    );

    // Atualiza também a ultima_atualizacao do ativo principal
    await db.query("UPDATE assets SET ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = $1", [assetId]);

    res.status(201).json(result.rows[0]); // Retorna a entrada de histórico criada
  } catch (err) {
    next(err);
  }
});


// DELETE /api/assets/:id - Apagar um ativo (Opcional)
// ATENÇÃO: Habilitar esta rota permite apagar dados permanentemente.
/*
router.delete("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    // O ON DELETE CASCADE na tabela history_entries apagará o histórico associado
    const result = await db.query("DELETE FROM assets WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Ativo não encontrado para apagar" });
    }
    res.status(200).json({ message: "Ativo apagado com sucesso", deletedAsset: result.rows[0] });
  } catch (err) {
    next(err);
  }
});
*/

export default router;