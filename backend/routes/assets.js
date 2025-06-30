// backend/routes/assets.js
import express from 'express';
const router = express.Router();
import db from '../db.js';

// Rota para Categorias
router.get("/categories", async (req, res, next) => {
  try {
    // Retorna também o sequence_name
    const result = await db.query("SELECT id, name, prefix, sequence_name FROM categories ORDER BY name ASC");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST para adicionar uma nova categoria e sua sequência correspondente
router.post("/categories", async (req, res, next) => {
  const { name, prefix } = req.body;
  if (!name || !prefix) {
    return res.status(400).json({ message: "Nome e Prefixo da categoria são obrigatórios." });
  }

  const sequenceName = `${prefix.toLowerCase()}_seq`; // Cria o nome da sequência (ex: pc_seq)

  try {
    // 1. Criar a nova sequência no banco de dados
    // Usar IF NOT EXISTS para evitar erro se a sequência já existir
    // É importante para evitar que tente criar uma sequência que já existe,
    // o que pode acontecer se o frontend tentar adicionar uma categoria duplicada.
    await db.query(`CREATE SEQUENCE IF NOT EXISTS ${sequenceName} START WITH 1 INCREMENT BY 1`);

    // 2. Inserir a nova categoria na tabela categories, vinculando-a à sequência criada
    const result = await db.query(
      "INSERT INTO categories (name, prefix, sequence_name) VALUES ($1, $2, $3) RETURNING *",
      [name, prefix, sequenceName]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao adicionar categoria ou sequência:", err.message); // Log para depuração
    if (err.code === '23505') { // Código de erro para violação de unicidade (duplicate key)
        return res.status(409).json({ message: "Nome ou Prefixo da categoria já existe." });
    }
    next(err); // Passa outros erros para o middleware de tratamento de erros
  }
});

// GET /api/assets - Obter todos os ativos (com JOIN de categoria)
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT a.*, c.name as category_name, c.prefix as category_prefix, c.sequence_name
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      ORDER BY a.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/assets/:id - Obter um ativo específico (com JOIN de categoria)
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const assetResult = await db.query(`
      SELECT a.*, c.name as category_name, c.prefix as category_prefix, c.sequence_name
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

// POST /api/assets - Adicionar um novo ativo (com geração de ID baseada em categoria)
router.post("/", async (req, res, next) => {
  const { nome, descricao, numero_serie, modelo, localizacao, status, data_aquisicao, info_garantia, utilizador, category_id } = req.body;

  if (!nome || !modelo || !localizacao || !status || !data_aquisicao || !category_id) {
    return res.status(400).json({ message: "Nome, Modelo, Localização, Status, Data de Aquisição e Categoria são obrigatórios." });
  }

  try {
    // 1. Obter o prefixo e o nome da sequência da categoria selecionada
    const categoryResult = await db.query("SELECT prefix, sequence_name FROM categories WHERE id = $1", [category_id]);
    if (categoryResult.rows.length === 0) {
      return res.status(400).json({ message: "Categoria selecionada inválida." });
    }
    // Desestruturar para obter 'prefix' e 'sequence_name'
    const { prefix: categoryPrefix, sequence_name: categorySequenceName } = categoryResult.rows[0];

    // 2. Gerar o próximo ID sequencial usando a sequência ESPECÍFICA DA CATEGORIA
    // A função nextval() aceita o nome da sequência como string
    const seqResult = await db.query(`SELECT nextval('${categorySequenceName}') as next_num`);
    const nextNum = seqResult.rows[0].next_num;

    // 3. Formatar o ID com base no prefixo da categoria e 5 dígitos
    const newId = `MAKEDIST-${categoryPrefix}-${String(nextNum).padStart(5, '0')}`;

    const result = await db.query(
      `INSERT INTO assets (id, nome, descricao, numero_serie, modelo, localizacao, status, data_aquisicao, info_garantia, ultima_atualizacao, utilizador, category_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, $10, $11) RETURNING *`,
      [newId, nome, descricao, numero_serie, modelo, localizacao, status, data_aquisicao, info_garantia, utilizador, category_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao adicionar ativo:", err.stack); // Log detalhado para debug
    if (err.code === '23505') { // Código de erro para violação de unicidade (duplicate key)
        return res.status(409).json({ message: "Erro: O ID gerado para este tipo de ativo já existe. Por favor, tente novamente. Se o problema persistir, pode ser necessário sincronizar a sequência de IDs para esta categoria." });
    }
    next(err); // Passa outros erros para o middleware de tratamento de erros
  }
});

// PUT /api/assets/:id - Atualizar um ativo (inclui category_id)
router.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { nome, descricao, localizacao, status, utilizador, category_id } = req.body;

  if (!nome || !status || !category_id) {
    return res.status(400).json({ message: "Nome, Status e Categoria são obrigatórios." });
  }

  try {
    const result = await db.query(
      "UPDATE assets SET nome = $1, descricao = $2, localizacao = $3, status = $4, utilizador = $5, category_id = $6, ultima_atualizacao = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *",
      [nome, descricao, localizacao, status, utilizador, category_id, id]
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