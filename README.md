# Documentação do Projeto: Make Gestão de Patrimônio

## 1. Visão Geral

O "Make Gestão de Patrimônio" é uma aplicação web Full-Stack, desenvolvida como um Progressive Web App (PWA), para gerir os ativos (máquinas e equipamentos). A plataforma permite o cadastro, a atualização e o rastreamento de ativos através de uma interface moderna, com leitura de QR Code e um painel administrativo para gestão de utilizadores e categorias.

---

## 2. Tecnologias Utilizadas

A aplicação é dividida em duas partes principais: Frontend e Backend.

**Frontend:**
- **Framework:** React 19 com TypeScript
- **Build Tool:** Vite
- **Roteamento:** React Router DOM v7
- **Estilização:** Tailwind CSS
- **Leitura de QR Code:** `@yudiel/react-qr-scanner`
- **Geração de QR Code:** `qrcode.react`

**Backend:**
- **Ambiente:** Node.js
- **Framework:** Express.js v5
- **Autenticação:** JSON Web Tokens (JWT) com `jsonwebtoken` e `bcrypt` para hashing de senhas.
- **Comunicação:** API RESTful

**Banco de Dados:**
- **SGBD:** PostgreSQL
- **Driver Node.js:** `pg`

---

## 3. Configuração e Execução do Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Um servidor PostgreSQL a correr

### 3.1. Configuração do Backend

1.  **Navegue até à pasta do backend:**
    ```bash
    cd backend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    - Crie um ficheiro `.env` na pasta `backend`.
    - Adicione as credenciais do seu banco de dados PostgreSQL, seguindo o exemplo abaixo:
      ```env
      # Credenciais do Banco de Dados
      DB_USER=postgres
      DB_HOST=localhost
      DB_DATABASE=asset_management
      DB_PASSWORD=sua_senha_aqui
      DB_PORT=5432

      # Chave secreta para JWT
      JWT_SECRET=uma_chave_secreta_forte_e_longa
      ```

4.  **Inicie o servidor backend:**
    ```bash
    node server.js
    ```
    O servidor estará a correr em `http://localhost:3001`.

### 3.2. Configuração do Frontend

1.  **Navegue até à pasta raiz do projeto.**

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    - Crie um ficheiro `.env` na raiz do projeto.
    - Adicione a URL da sua API backend:
      ```env
      VITE_API_URL=http://localhost:3001
      ```

4.  **Inicie o servidor de desenvolvimento do frontend:**
    ```bash
    npm run dev
    ```
    A aplicação estará acessível em `http://localhost:5173` (ou outra porta indicada pelo Vite).

---

## 4. Estrutura do Banco de Dados

O banco de dados `asset_management` é composto por quatro tabelas principais:

-   **`users`**: Armazena os dados de login dos utilizadores (`id`, `username`, `password_hash`, `role`).
-   **`categories`**: Define as categorias dos ativos (`id`, `name`, `prefix`, `sequence_name`). O `prefix` e `sequence_name` são usados para gerar IDs únicos para os ativos.
-   **`assets`**: Contém todas as informações sobre os ativos (máquinas), como `id`, `nome`, `localizacao`, `status`, `category_id`, etc.
-   **`history_entries`**: Regista todas as alterações e manutenções de um ativo, ligada à tabela `assets` pelo `asset_id`.

---

## 5. Estrutura do Projeto (Frontend)

O código-fonte do frontend está organizado da seguinte forma:

-   **`components/`**: Contém todos os componentes React.
    -   **`features/`**: Componentes complexos que representam uma funcionalidade específica (ex: `UserManagement.tsx`, `AssetForm.tsx`).
    -   **`screens/`**: Componentes que representam uma página inteira da aplicação (ex: `HomeScreen.tsx`, `AdminScreen.tsx`).
    -   **`ui/`**: Componentes de UI genéricos e reutilizáveis (ex: `Button.tsx`, `Card.tsx`, `Modal.tsx`).
-   **`App.tsx`**: Componente principal que gere o estado global, as rotas e a lógica de autenticação.
-   **`types.ts`**: Ficheiro central com todas as definições de tipos e interfaces TypeScript do projeto.
-   **`constants.ts` / `constants.tsx`**: Ficheiros para armazenar constantes, como nomes, cores e componentes de ícones SVG.

---

## 6. Painel de Administrador

Utilizadores com o papel (`role`) de `admin` têm acesso a um painel de controlo em `/admin`.

**Funcionalidades Atuais:**
-   **Gestão de Utilizadores:** Criar, editar e excluir contas de utilizadores.
-   **Gestão de Categorias:** Criar, editar e excluir categorias de ativos.

**Credenciais de Admin Padrão:**
-   **Utilizador:** `admin`
-   **Senha:** `admin` (conforme o script SQL fornecido)

