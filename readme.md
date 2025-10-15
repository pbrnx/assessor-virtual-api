# Assessor de Investimentos Virtual
<img width="1902" height="952" alt="image" src="https://github.com/user-attachments/assets/9cc01489-d989-4878-9a85-f66c53c2e802" />

## Integrantes 
- Nome: Pedro Augusto Carneiro Barone Bomfim - RM: 99781
- Nome: João Pedro de Albuquerque Oliveira - RM: 551579
- Nome: Matheus Augusto Santos Rego - RM:551466
- Nome: Ian Cancian Nachtergaele - RM: 98387


## Como usar?
A aplicação tem um deploy no render, para uso sem necessidade de configuração local: https://assessor-virtual-api.onrender.com

Mas, mais abaixo, há também uma explicação de como configurar o ambiente para execução em servidor de desenvolvimento.

A documentação dos endpoints pode ser encontrada aqui: https://assessor-virtual-api.onrender.com/api-docs

## ❯ Descrição

O **Assessor de Investimentos Virtual** é uma aplicação Full Stack que simula uma plataforma de investimentos completa. O projeto consiste em uma API RESTful construída com Node.js e Express, conectada a um banco de dados Oracle, e um frontend dinâmico (SPA - Single Page Application) desenvolvido com Vanilla JavaScript, HTML e CSS.

A plataforma permite que usuários se cadastrem, definam seu perfil de investidor através de um questionário (suitability), gerenciem um saldo em conta, explorem um marketplace de ativos e montem sua própria carteira de investimentos com funcionalidades de compra e venda.

---

## ✨ Funcionalidades

-   **👤 Gestão de Clientes**: Cadastro e login simplificado de usuários.
-   **❓ Perfil de Investidor (Suitability)**: Questionário para determinar o perfil do investidor (Conservador, Moderado, Arrojado).
-   **🤖 Carteira Recomendada**: Geração de uma carteira de investimentos sugerida com base no perfil do usuário.
-   **💹 Marketplace de Ativos**: Catálogo de produtos de investimento com preços, tipos e níveis de risco variados.
-   **💰 Gestão de Saldo**: Funcionalidade para **Depositar** valores na conta.
-   **🛒 Ciclo de Investimento**: Funções completas para **Comprar** e **Vender** ativos do marketplace.
-   **📊 Dashboard do Investidor**:
    -   Visualização da carteira de ativos do usuário ("Minha Carteira").
    -   Gráfico de pizza com a distribuição percentual dos investimentos.
    -   Saldo atualizado em tempo real.
-   **🚀 Investimento Automático**: Botão "Investir com 1 Clique" que aloca o saldo do usuário na carteira recomendada.
-   **📚 Documentação Interativa**: API documentada com Swagger (OpenAPI) para fácil visualização e teste dos endpoints.

---

## 🛠️ Tecnologias Utilizadas

### Backend
-   **Node.js**
-   **Express.js**: Framework para a construção da API REST.
-   **OracleDB (`oracledb`)**: Driver para conexão com o banco de dados Oracle.
-   **Swagger UI Express**: Para servir a documentação da API.
-   **DotEnv**: Para gerenciamento de variáveis de ambiente.

### Frontend
-   **HTML5 / CSS3**
-   **Vanilla JavaScript (ES6+)**: Para criar a experiência de Single Page Application (SPA).
-   **Chart.js**: Biblioteca para a renderização do gráfico de pizza da carteira.

### Banco de Dados
-   **Oracle Database**

---

## ⚙️ Instalação e Configuração

Siga os passos abaixo para rodar o projeto localmente.

### Pré-requisitos
-   **Node.js** (versão 18 ou superior)
-   **Oracle Instant Client**: É necessário para que o driver `oracledb` funcione. Certifique-se de que ele esteja instalado e configurado no `PATH` do seu sistema.
-   Acesso a um **Banco de Dados Oracle**.

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/assessor-virtual-api.git](https://github.com/seu-usuario/assessor-virtual-api.git)
    cd assessor-virtual-api
    ```

2.  **Instale as dependências:**
    *(O projeto usa `pnpm`, mas `npm` também funciona)*
    ```bash
    npm install
    # ou
    pnpm install
    ```

3.  **Configure as variáveis de ambiente:**
    -   Crie um arquivo chamado `.env` na raiz do projeto.
    -   Copie o conteúdo do exemplo abaixo e preencha com suas credenciais do Oracle.

    **.env.example**
    ```env
    # Configurações do Servidor
    PORT=3000

    # Credenciais do Banco de Dados Oracle
    DB_USER=SEU_USUARIO_ORACLE
    DB_PASSWORD=SUA_SENHA_ORACLE
    DB_URL=oracle.fiap.com.br:1521/ORCL
    ```

4.  **Configure o Banco de Dados:**
    -   Execute o script SQL abaixo no seu banco de dados Oracle para criar todas as tabelas, relacionamentos e inserir os dados iniciais.
    -   *(O script já inclui a lógica para apagar as tabelas antigas, se existirem)*.

    <details>
    <summary>Clique para ver o Script SQL Completo</summary>

    ```sql
    -- Bloco para limpar as tabelas do projeto de investimento antes de criá-las.
    BEGIN
        EXECUTE IMMEDIATE 'DROP TABLE investimento_carteira CASCADE CONSTRAINTS';
        EXECUTE IMMEDIATE 'DROP TABLE investimento_cliente CASCADE CONSTRAINTS';
        EXECUTE IMMEDIATE 'DROP TABLE investimento_perfil CASCADE CONSTRAINTS';
        EXECUTE IMMEDIATE 'DROP TABLE investimento_produto CASCADE CONSTRAINTS';
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE != -942 THEN
                RAISE;
            END IF;
    END;
    /
        
    -- Tabela para armazenar os tipos de perfil de investidor
    CREATE TABLE investimento_perfil (
        id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nome VARCHAR2(100) NOT NULL,
        descricao VARCHAR2(500) NOT NULL,
        CONSTRAINT uq_investimento_perfil_nome UNIQUE (nome)
    );

    -- Tabela de clientes com o novo campo EMAIL_VERIFICADO
    CREATE TABLE investimento_cliente (
        id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nome VARCHAR2(255) NOT NULL,
        email VARCHAR2(255) NOT NULL,
        senha VARCHAR2(255) NOT NULL,
        email_verificado NUMBER(1) DEFAULT 0 NOT NULL,
        saldo NUMBER(19, 2) DEFAULT 0.00 NOT NULL,
        perfil_id NUMBER(19),
        CONSTRAINT uq_investimento_cliente_email UNIQUE (email),
        CONSTRAINT fk_invest_cliente_perfil FOREIGN KEY (perfil_id)
            REFERENCES investimento_perfil(id)
            ON DELETE SET NULL
    );

    -- Tabela para o catálogo de produtos de investimento
    CREATE TABLE investimento_produto (
        id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nome VARCHAR2(255) NOT NULL,
        tipo VARCHAR2(100) NOT NULL,
        risco VARCHAR2(50) NOT NULL,
        preco NUMBER(19, 2) NOT NULL,
        CONSTRAINT chk_investimento_produto_risco CHECK (risco IN ('Baixo', 'Médio', 'Alto'))
    );

    -- Tabela para registrar os ativos comprados por cada cliente
    CREATE TABLE investimento_carteira (
        id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        cliente_id NUMBER(19) NOT NULL,
        produto_id NUMBER(19) NOT NULL,
        quantidade NUMBER(19, 8) NOT NULL, -- <<<<<<< CORREÇÃO APLICADA AQUI
        CONSTRAINT fk_carteira_cliente FOREIGN KEY (cliente_id) REFERENCES investimento_cliente(id) ON DELETE CASCADE,
        CONSTRAINT fk_carteira_produto FOREIGN KEY (produto_id) REFERENCES investimento_produto(id) ON DELETE CASCADE,
        CONSTRAINT uq_carteira_cliente_produto UNIQUE (cliente_id, produto_id)
    );

    -- Inserir Perfis
    INSERT INTO investimento_perfil (nome, descricao) VALUES ('Conservador', 'Prefere segurança e baixa volatilidade.');
    INSERT INTO investimento_perfil (nome, descricao) VALUES ('Moderado', 'Busca um equilíbrio entre segurança e rentabilidade.');
    INSERT INTO investimento_perfil (nome, descricao) VALUES ('Arrojado', 'Tolera altos riscos em busca de maior rentabilidade.');

    -- Inserir Produtos de Investimento
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('Tesouro Selic', 'Renda Fixa', 'Baixo', 108.50);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('CDB PagSeguro', 'Renda Fixa', 'Baixo', 100.00);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('Fundo Imobiliário HGLG11', 'FII', 'Médio', 162.30);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('Fundo de Ações Tech', 'Ações', 'Alto', 85.20);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('Ações da Petrobras', 'Ações', 'Alto', 34.75);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('CDB Banco Inter', 'Renda Fixa', 'Baixo', 100.00);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('CDB Nubank', 'Renda Fixa', 'Baixo', 1.00);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('Fundo Imobiliário MXRF11', 'FII', 'Médio', 10.55);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('Fundo Imobiliário XPML11', 'FII', 'Médio', 115.70);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('ETF BOVA11 (Ibovespa)', 'Ações', 'Alto', 112.30);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('ETF IVVB11 (S&P 500)', 'Ações', 'Alto', 255.80);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('BDR Google (GOGL34)', 'BDR', 'Alto', 58.90);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('BDR Apple (AAPL34)', 'BDR', 'Alto', 85.40);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('Cripto Bitcoin (BTC)', 'Cripto', 'Alto', 150000.00);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('Cripto Ethereum (ETH)', 'Cripto', 'Alto', 9500.00);

    COMMIT;
    ```
    </details>

5.  **Inicie o servidor:**
    ```bash
    node app.js
    ```

---

## 🚀 Uso

Após iniciar o servidor, a aplicação estará disponível nos seguintes endereços:

-   **Aplicação Frontend**: [http://localhost:3000](http://localhost:3000)
    > Acesse este link no seu navegador para interagir com a plataforma.

-   **Documentação da API (Swagger)**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
    > Acesse este link para ver todos os endpoints da API, seus parâmetros, e para testá-los diretamente pelo navegador.
    <img width="1902" height="950" alt="image" src="https://github.com/user-attachments/assets/9d2e8bb8-2503-47bb-839b-62bfef487032" />


---

## 📂 Estrutura do Projeto

    .
    ├── src
    │   ├── api                 # Arquivos de rotas (endpoints)
    │   ├── config              # Configuração do banco de dados
    │   ├── controllers         # Camada que lida com requisições e respostas
    │   ├── dtos                # Data Transfer Objects (contratos de dados)
    │   ├── middlewares         # Middlewares (ex: errorHandler)
    │   ├── models              # Modelos de domínio da aplicação
    │   ├── repositories        # Camada de acesso ao banco de dados
    │   └── services            # Camada de regras de negócio
    ├── static                  # Arquivos do frontend
    │   ├── app.js              # Lógica do frontend (SPA)
    │   ├── index.html          # Estrutura da página
    │   └── style.css           # Estilização
    ├── .env                    # Arquivo de variáveis de ambiente (local)
    ├── .gitignore              # Arquivos e pastas a serem ignorados pelo Git
    ├── app.js                  # Ponto de entrada da aplicação (servidor)
    ├── package.json            # Dependências e metadados do projeto
    └── swagger.yaml            # Definição da API no padrão OpenAPI 3.0
