-- ========= CRIAÇÃO DOS TIPOS (ENUMS) =========

CREATE TYPE asset_status_enum AS ENUM (
    'Em Operação',
    'Em Manutenção',
    'Fora de Uso',
    'Aguardando Peças'
);

CREATE TYPE history_event_type_enum AS ENUM (
    'Manutenção Corretiva',
    'Manutenção Preventiva',
    'Mudança Status',
    'Mudança Localização',
    'Observação'
);

-- ========= CRIAÇÃO DAS TABELAS =========

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    prefix VARCHAR(10) UNIQUE NOT NULL,
    sequence_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE assets (
    id VARCHAR(255) PRIMARY KEY, 
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    numero_serie VARCHAR(255),
    modelo VARCHAR(255) NOT NULL,
    localizacao VARCHAR(255) NOT NULL,
    status asset_status_enum NOT NULL,
    data_aquisicao DATE NOT NULL,
    info_garantia TEXT,
    ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_por VARCHAR(255),
    utilizador VARCHAR(255),
    category_id INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE TABLE history_entries (
    id SERIAL PRIMARY KEY,
    asset_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tipo_evento history_event_type_enum NOT NULL,
    descricao TEXT NOT NULL,
    responsavel VARCHAR(255),
    user_id INTEGER,
    FOREIGN KEY (asset_id) REFERENCES assets (id) ON DELETE CASCADE, 
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL 
);


-- ========= CRIAÇÃO DAS SEQUÊNCIAS PARA IDs DE ATIVOS =========

CREATE SEQUENCE makedist_maq_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE makedist_note_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE makedist_pc_seq START WITH 1 INCREMENT BY 1;


-- ========= INSERÇÃO DE DADOS INICIAIS =========

-- Inserir um usuário administrador
-- A senha é 'admin', e o hash foi gerado com bcrypt (Arquivo do projeto: generate_hash.js)
INSERT INTO users (username, password_hash, role) VALUES
('useradmin', '$2b$10$1ITeYcmYwO4X.6EIZwyr5.mU2PPiF2dsVymhkd6Iyri2Q19Z3m.8.', 'admin');

INSERT INTO categories (id, name, prefix, sequence_name) VALUES
(1, 'Máquina', 'MAQ', 'makedist_maq_seq'),
(2, 'Notebook', 'NOTE', 'makedist_note_seq'),
(3, 'Computador', 'PC', 'makedist_pc_seq')
ON CONFLICT (id) DO NOTHING; -- Evita erro se os IDs já existirem

INSERT INTO assets (id, nome, numero_serie, modelo, localizacao, status, data_aquisicao, info_garantia, ultima_atualizacao, category_id) VALUES
('MAKEDIST-MAQ-00123', 'Empacotadora Automática XPTO', 'SN-XPTO-12345', 'XPTO-2023', 'Setor A, Linha 1', 'Em Operação', '2023-01-15', 'Expira em 2025-01-15', '2024-05-01 00:00:00', 1),
('MAKEDIST-MAQ-00456', 'Prensa Hidráulica YZ', 'SN-YZ-67890', 'YZ-HEAVY-2022', 'Setor B, Oficina', 'Em Manutenção', '2022-07-01', 'Expirada', '2024-04-20 00:00:00', 1),
('MAKEDIST-MAQ-00789', 'Esteira Transportadora ZW', 'SN-ZW-11223', 'ZW-FAST-2024', 'Setor C, Expedição', 'Fora de Uso', '2024-03-10', 'Expira em 2026-03-10', '2024-05-10 00:00:00', 1);

SELECT setval('makedist_maq_seq', 789, true);

INSERT INTO history_entries (asset_id, timestamp, tipo_evento, descricao) VALUES
('MAKEDIST-MAQ-00123', '2023-02-20 10:00:00', 'Manutenção Preventiva', 'Lubrificação geral e verificação de sensores.'),
('MAKEDIST-MAQ-00123', '2023-06-10 14:30:00', 'Mudança Localização', 'Movida para Setor A, Linha 1.'),
('MAKEDIST-MAQ-00123', '2024-01-05 09:00:00', 'Observação', 'Operando normalmente. Nível de ruído ligeiramente elevado.'),

('MAKEDIST-MAQ-00456', '2023-09-05 09:00:00', 'Manutenção Corretiva', 'Falha no cilindro principal. Iniciada desmontagem.'),
('MAKEDIST-MAQ-00456', '2023-09-15 16:00:00', 'Mudança Status', 'Status alterado para Em Manutenção. Peça solicitada.'),
('MAKEDIST-MAQ-00456', '2024-04-20 11:00:00', 'Observação', 'Peça recebida. Agendada instalação para próxima semana.'),

('MAKEDIST-MAQ-00789', '2024-04-01 11:00:00', 'Observação', 'Detectado ruído estranho no motor. Necessita avaliação.'),
('MAKEDIST-MAQ-00789', '2024-04-02 11:00:00', 'Mudança Status', 'Status alterado para Fora de Uso para inspeção detalhada.'),
('MAKEDIST-MAQ-00789', '2024-05-10 15:00:00', 'Manutenção Corretiva', 'Inspeção revelou desalinhamento do eixo. Peças de reposição encomendadas.');

SELECT 'Banco de dados criado e populado com sucesso!' as status;