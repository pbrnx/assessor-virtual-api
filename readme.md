# Assessor de Investimentos Virtual
<img width="1887" height="943" alt="image" src="https://github.com/user-attachments/assets/958f11fe-bf72-42ef-b471-0525b9e5cdc2" />


## Integrantes
- Nome: Pedro Augusto Carneiro Barone Bomfim - RM: 99781
- Nome: João Pedro de Albuquerque Oliveira - RM: 551579
- Nome: Matheus Augusto Santos Rego - RM:551466
- Nome: Ian Cancian Nachtergaele - RM: 98387

## Como usar?
A aplicação tem um deploy no render, para uso sem necessidade de configuração local: https://assessor-virtual-api.onrender.com. 

Mas, mais abaixo, há também uma explicação de como configurar o ambiente para execução em servidor de desenvolvimento.

A documentação dos endpoints pode ser encontrada aqui: https://assessor-virtual-api.onrender.com/api-docs

P.S. Para menor latência, use o deploy do Google Cloud: https://assessor-virtual-api-684499909473.southamerica-east1.run.app. 

Se preferir usar docker para rodar localmente, a imagem do container é essa 
```bash
docker pull docker.io/pbrnx/assessor-virtual-api:latest
```
## ❯ Descrição

O **Assessor de Investimentos Virtual** é uma aplicação Full Stack que simula uma plataforma de investimentos completa. O projeto consiste em uma API RESTful construída com Node.js e Express, conectada a um banco de dados Oracle, e um frontend dinâmico (SPA - Single Page Application) desenvolvido com Vanilla JavaScript, HTML e CSS.

### Arquitetura e Padrões de Projeto

O projeto segue uma arquitetura em camadas, implementando os princípios SOLID:

-   **Single Responsibility**: Cada classe tem uma única responsabilidade (ex: `AuthService`, `CarteiraService`).
-   **Open/Closed**: Uso de estratégias para diferentes perfis de investidor.
-   **Liskov Substitution**: (Verificável pela conformidade das Strategies, embora não formalmente via interfaces JS).
-   **Interface Segregation**: (Aplicável conceitualmente na definição das responsabilidades dos serviços).
-   **Dependency Inversion**: Injeção de dependências nos serviços (ex: Repositório injetado no Serviço).

### Design Patterns e Arquitetura

1.  **Repository Pattern**: Abstração do acesso aos dados através dos repositories.
    * Exemplo: `cliente.repository.js`, `carteira.repository.js`.
2.  **DTO Pattern**: Transferência e validação de dados entre camadas.
    * Exemplo: `auth.dto.js`, `carteira.dto.js`.
3.  **Middleware Pattern**: Interceptação e processamento de requisições.
    * Rate limiting em rotas de autenticação.
    * Validação de JWT e roles.
4.  **Pool de Conexões (Implícito no `database.js`)**: Gerenciamento eficiente de conexões com o banco. (Nota: Singleton não é exatamente o termo, mas Pool Pattern sim).
5.  **Service Layer**: Encapsulamento da lógica de negócios.
    * Serviços especializados para cada domínio.
    * Separação clara de responsabilidades.

A plataforma permite que usuários se cadastrem, verifiquem suas contas por e-mail, redefinam senhas, definam seu perfil de investidor através de um questionário (suitability), gerenciem um saldo em conta, explorem um marketplace de ativos e montem sua própria carteira de investimentos com funcionalidades de compra e venda.

---

## ✨ Funcionalidades

-   **👤 Gestão de Clientes e Segurança**:
    -   Cadastro e login de usuários com senhas criptografadas.
    -   **Verificação de E-mail**: Processo de ativação de conta via token enviado por e-mail para garantir a autenticidade do usuário.
    -   **Recuperação de Senha**: Funcionalidade de "Esqueci minha senha" que envia um link de redefinição por e-mail.
    -   **Autenticação JWT**: Uso de JSON Web Tokens (Access e Refresh Tokens) para proteger as rotas da API.
    -   **Controle de Acesso por Papel (Role-Based)**: Distinção entre usuários "cliente" e "admin", com rotas específicas protegidas para administradores (como a gestão de produtos de investimento).

-   **❓ Perfil de Investidor (Suitability)**: Questionário para determinar o perfil do investidor (Conservador, Moderado, Arrojado).

-   **🤖 Carteira Recomendada**: Geração de uma carteira de investimentos sugerida com base no perfil do usuário, utilizando o padrão de projeto **Strategy** para cada tipo de perfil.

-   **💹 Marketplace de Ativos**: Catálogo de produtos de investimento com preços, tipos e níveis de risco variados.

-   **💰 Gestão de Saldo**: Funcionalidade para **Depositar** valores na conta.

-   **🛒 Ciclo de Investimento**:
    -   Função de **Comprar** ativos com base no **valor monetário** desejado, com o sistema calculando a quantidade de cotas.
    -   Função de **Vender** uma quantidade específica de cotas de um ativo.

-   **📊 Dashboard do Investidor**:
    -   Visualização da carteira de ativos do usuário ("Minha Carteira").
    -   Gráfico de pizza com a distribuição percentual dos investimentos.
    -   Saldo atualizado em tempo real.

-   **🚀 Investimento Automático**: Botão "Investir com 1 Clique" que aloca todo o saldo do usuário na carteira recomendada.

-   **📚 Documentação Interativa**: API documentada com Swagger (OpenAPI) para fácil visualização e teste dos endpoints.

---

## 🛠️ Tecnologias Utilizadas

### Backend
-   **Node.js**: Runtime JavaScript (v18+)
-   **Express.js**: Framework para construção da API REST
    -   Middleware para tratamento de requisições
    -   Roteamento
    -   Tratamento de erros
-   **OracleDB (`oracledb`)**: Driver para conexão com Oracle Database
    -   Pool de conexões
    -   (Transações não explicitamente mostradas, mas possíveis com o driver)
-   **Autenticação e Segurança**:
    -   **JSON Web Token (`jsonwebtoken`)**: Autenticação stateless (Access/Refresh Tokens).
    -   **bcryptjs**: Criptografia de senhas.
    -   **express-rate-limit**: Limitação de requisições.
    -   **helmet**: Headers de segurança.
-   **E-mail e Comunicação**:
    -   **Nodemailer**: Usado indiretamente via `googleapis` e `MailComposer` para envio de e-mails.
    -   **Google APIs (`googleapis`)**: Autenticação OAuth2 para envio de e-mails via Gmail API.
-   **Documentação e Desenvolvimento**:
    -   **Swagger UI Express**: Documentação interativa da API.
    -   **OpenAPI 3.0 (`yamljs`)**: Especificação da API em YAML.
    -   **DotEnv**: Gerenciamento de variáveis de ambiente.
-   **Testes**:
    -   **Jest**: Framework de testes.
    -   **Supertest**: Testes de integração HTTP.
    -   Testes de integração para rotas de autenticação.
    -   Testes unitários para serviços.

### Frontend
-   **HTML5 / CSS3**
    -   Layout responsivo.
    -   Flexbox e Grid.
    -   Tema claro/escuro.
-   **JavaScript**:
    -   **Vanilla JS (ES6+)**.
    -   **Módulos ES6**.
    -   **Async/Await**.
    -   **LocalStorage / SessionStorage** para persistência.
    -   **Fetch API** (em vez de Axios) para requisições HTTP.
-   **Bibliotecas**:
    -   **Chart.js**: Visualização de dados.

### Banco de Dados
-   **Oracle Database**
    -   Constraints e Relacionamentos (visível no script SQL).
    -   (Procedures, Triggers, Índices otimizados - não verificáveis diretamente nos arquivos fornecidos, mas práticas comuns).

---

## ⚙️ Instalação e Configuração

Siga os passos abaixo para rodar o projeto localmente.

### Pré-requisitos
-   **Node.js** (versão 18 ou superior)
-   Acesso a um **Banco de Dados Oracle**.

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/assessor-virtual-api.git](https://github.com/seu-usuario/assessor-virtual-api.git)
    cd assessor-virtual-api
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```
   

3.  **Configure as variáveis de ambiente:**
    -   Crie um arquivo chamado `.env` na raiz do projeto.
    -   Copie o conteúdo do exemplo abaixo e preencha com suas credenciais do Oracle e outras configurações. (Nota: O arquivo `.env.example` não está no repositório, use este bloco como guia).

    **.env (Exemplo)**
    ```env
    # Configurações do Servidor
    PORT=3000
    ENVIRONMENT=http://localhost:3000 # ou [https://assessor-virtual-api.onrender.com](https://assessor-virtual-api.onrender.com)

    # Credenciais do Banco de Dados Oracle
    DB_USER=SEU_USUARIO_ORACLE
    DB_PASSWORD=SUA_SENHA_ORACLE
    DB_URL=oracle.fiap.com.br:1521/ORCL

    # Chaves secretas para JWT (DEVEM SER DIFERENTES E SEGURAS)
    SECRET=SUA_CHAVE_SECRETA_PRINCIPAL_SUPER_SEGURA
    REFRESH_SECRET=SUA_CHAVE_SECRETA_REFRESH_SUPER_SEGURA

    # Configuração de Expiração JWT (em segundos)
    JWT_EXPIRATION=1800 # 30 minutos
    JWT_REFRESH_EXPIRATION=604800 # 7 dias

    # E-mail do projeto (usado para autenticação de envio de e-mails via Gmail API)
    EMAIL_USER=SEU_EMAIL_GOOGLE

    # Credenciais do Google Cloud OAuth2 (para envio de e-mails via Gmail API)
    G_CLIENT_ID=SEU_CLIENT_ID_GOOGLE
    G_CLIENT_SECRET=SEU_CLIENT_SECRET_GOOGLE
    G_REDIRECT_URI=[https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)
    G_REFRESH_TOKEN=SEU_REFRESH_TOKEN_GOOGLE_OBTIDO_NO_PLAYGROUND

    # Credenciais do Administrador (para login direto via API)
    ADMIN_EMAIL=admin@admin.com
    ADMIN_PASSWORD=admin
    ```
   

4.  **Configure o Banco de Dados:**
    -   Execute o script SQL abaixo no seu banco de dados Oracle para criar todas as tabelas, relacionamentos e inserir os dados iniciais.
    -   *(O script já inclui a lógica para apagar as tabelas antigas, se existirem)*.
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

    -- Tabela de clientes com campos de segurança de tokens
    CREATE TABLE investimento_cliente (
        id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        nome VARCHAR2(255) NOT NULL,
        email VARCHAR2(255) NOT NULL,
        senha VARCHAR2(255) NOT NULL,
        email_verificado NUMBER(1) DEFAULT 0 NOT NULL,
        saldo NUMBER(19, 2) DEFAULT 0.00 NOT NULL,
        perfil_id NUMBER(19),
        email_verification_token VARCHAR2(255),         -- Hash SHA-256 do token de verificação de email
        email_verification_token_expires DATE,          -- Expiração do token de verificação (24h)
        reset_password_token VARCHAR2(255),             -- Hash SHA-256 do token de redefinição de senha
        reset_password_token_expires DATE,              -- Expiração do token de redefinição (1h)
        refresh_token VARCHAR2(255),                    -- Hash SHA-256 do refresh token JWT
        refresh_token_expires DATE,                     -- Expiração do refresh token (7 dias)
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
        quantidade NUMBER(19, 8) NOT NULL, -- Precisão para cotas fracionadas
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
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('Tesouro IPCA+', 'Renda Fixa', 'Baixo', 105.00);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('CDB Bradesco', 'Renda Fixa', 'Baixo', 100.00);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('Fundo Imobiliário KNRI11', 'FII', 'Médio', 150.20);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('Fundo de Ações Energia', 'Ações', 'Alto', 78.50);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('Ações da Vale', 'Ações', 'Alto', 65.40);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('CDB Santander', 'Renda Fixa', 'Baixo', 100.00);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('CDB Itaú', 'Renda Fixa', 'Baixo', 100.00);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('Fundo Imobiliário HGBS11', 'FII', 'Médio', 130.80);
    INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ('Fundo de Ações Financeiro', 'Ações', 'Alto', 92.30);

    COMMIT;
    ```

5.  **Execute a migration de segurança (IMPORTANTE):**
    
    Se você já tinha o banco criado anteriormente, execute esta migration adicional para os novos campos de segurança:
    
    ```sql
    -- Migration 002: Adicionar campos de expiração de tokens
    -- Necessário apenas se você já tinha o banco criado sem estes campos
    
    ALTER TABLE investimento_cliente 
    ADD email_verification_token_expires DATE;
    
    ALTER TABLE investimento_cliente 
    ADD refresh_token_expires DATE;
    
    COMMIT;
    ```

6.  **Instale as dependências:**
    ```bash
    npm install
    ```

7.  **Inicie o servidor:**
    ```bash
    node app.js
    ```
   

---

## 🚀 Uso

### Endpoints Disponíveis

#### Autenticação (Rate Limited)
- `POST /api/auth/register` - Registro de novo usuário (10 req/15min)
- `POST /api/auth/login` - Login de usuário (10 req/15min)
- `POST /api/auth/verify-email` - Verifica e-mail do usuário
- `POST /api/auth/forgot-password` - Solicita redefinição de senha (10 req/15min)
- `POST /api/auth/reset-password` - Redefine a senha (10 req/15min)
- `POST /api/auth/refresh-token` - Renova o token JWT (20 req/15min)

#### Clientes (Requer Autenticação)
- `GET /api/clientes` - Lista todos os clientes (Apenas Admin)
- `GET /api/clientes/{id}` - Busca cliente por ID (Dono ou Admin)
- `PUT /api/clientes/{id}` - Atualiza dados do cliente (Dono ou Admin)
- `DELETE /api/clientes/{id}` - Remove cliente (Dono ou Admin)
- `POST /api/clientes/{id}/perfil` - Define perfil do investidor (Dono ou Admin)
- `POST /api/clientes/{id}/depositar` - Deposita valor na conta (Dono ou Admin)

#### Carteira (Requer Autenticação)
- `GET /api/clientes/{id}/carteira` - Lista ativos da carteira (Dono ou Admin)
- `POST /api/clientes/{id}/carteira/comprar` - Compra ativo por valor (Dono ou Admin)
- `POST /api/clientes/{id}/carteira/vender` - Vende ativo por quantidade (Dono ou Admin)

#### Recomendações (Requer Autenticação)
- `GET /api/clientes/{id}/recomendacoes` - Obtém recomendações (Dono ou Admin)
- `POST /api/clientes/{id}/recomendacoes/investir` - Investe conforme recomendação (Dono ou Admin)

#### Produtos de Investimento
- `GET /api/investimentos` - Lista todos os produtos (Público)
- `GET /api/investimentos/{id}` - Busca produto por ID (Público)
- `POST /api/investimentos` - Cria novo produto (Apenas Admin)
- `PUT /api/investimentos/{id}` - Atualiza produto (Apenas Admin)
- `DELETE /api/investimentos/{id}` - Remove produto (Apenas Admin)

### Acessando a Aplicação

-   **Frontend**: `http://localhost:3000` (ou o valor de `ENVIRONMENT`)
    > Interface web completa da plataforma

-   **Swagger UI**: `http://localhost:3000/api-docs` (ou `ENVIRONMENT`/api-docs)
    > Documentação interativa da API

### Exemplos de Uso

1.  **Registro de Usuário**
    ```bash
    curl -X POST http://localhost:3000/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{
        "nome": "João Silva",
        "email": "joao@email.com",
        "senha": "SenhaValida123@"
      }'
    ```

2.  **Login**
    ```bash
    curl -X POST http://localhost:3000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "joao@email.com",
        "senha": "SenhaValida123@"
      }'
    ```

3.  **Compra de Ativo por Valor** (Ajustado para enviar 'valor')
    ```bash
    # Primeiro, obtenha o ${TOKEN} do login
    curl -X POST http://localhost:3000/api/clientes/{id_do_cliente}/carteira/comprar \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{
        "produtoId": 1,
        "valor": 500.00
      }'
    ```
    *(Nota: Embora o exemplo use `valor`, a API atualmente espera `quantidade` no corpo. O backend faz a conversão internamente.)*


---

## 📂 Estrutura do Projeto

A estrutura do projeto segue os princípios de Clean Architecture e SOLID:

```
.
├── src/
│   ├── api/                    # Rotas e configuração de endpoints
│   │   ├── auth.routes.js      # Rotas de autenticação
│   │   ├── carteira.routes.js  # Rotas de carteira
│   │   ├── clientes.routes.js  # Rotas de clientes
│   │   ├── investimentos.routes.js # Rotas de produtos de investimento
│   │   └── __tests__/         # Testes de integração das rotas
│   │
│   ├── config/                # Configurações do projeto
│   │   ├── auth.config.js     # Configurações de autenticação
│   │   └── database.js        # Configuração do banco de dados
│   │
│   ├── controllers/          # Controladores da aplicação
│   │   ├── auth.controller.js
│   │   ├── carteira.controller.js
│   │   ├── cliente.controller.js
│   │   ├── perfil.controller.js
│   │   ├── produtoInvestimento.controller.js
│   │   └── recomendacao.controller.js
│   │
│   ├── dtos/                # Data Transfer Objects
│   │   ├── auth.dto.js
│   │   ├── carteira.dto.js
│   │   ├── cliente.dto.js
│   │   ├── perfil.dto.js
│   │   ├── produtoInvestimento.dto.js
│   │   └── recomendacao.dto.js
│   │
│   ├── middlewares/         # Middlewares da aplicação
│   │   ├── authJwt.js      # Middleware de autenticação JWT
│   │   └── errorHandler.js  # Tratamento global de erros
│   │
│   ├── models/             # Modelos de domínio
│   │   ├── carteira.model.js
│   │   ├── cliente.model.js
│   │   ├── perfilInvestidor.model.js
│   │   └── produtoInvestimento.model.js
│   │
│   ├── repositories/       # Camada de acesso a dados
│   │   ├── carteira.repository.js
│   │   ├── cliente.repository.js
│   │   └── produtoInvestimento.repository.js
│   │
│   └── services/          # Lógica de negócio
│       ├── auth.service.js
│       ├── carteira.service.js
│       ├── cliente.service.js
│       ├── email.service.js
│       ├── perfil.service.js
│       ├── produtoInvestimento.service.js
│       ├── recomendacao.service.js
│       └── __tests__/    # Testes unitários
│
├── static/              # Frontend da aplicação
│   ├── services/        # Serviços do frontend
│   │   ├── api.js      # Cliente HTTP
│   │   ├── state.js    # Gerenciamento de estado
│   │   └── ui.js       # Interação com a interface
│   │
│   ├── app.js         # Lógica principal do frontend
│   ├── index.html     # Página principal
│   └── style.css      # Estilos CSS
│
├── .env              # Variáveis de ambiente
├── .env.example      # Exemplo de variáveis de ambiente
├── package.json      # Dependências e scripts
└── README.md         # Documentação principal
```

Cada diretório tem uma responsabilidade específica, seguindo o princípio da Separação de Responsabilidades:
    ├── .gitignore              # Arquivos e pastas a serem ignorados pelo Git
    ├── app.js                  # Ponto de entrada da aplicação (servidor)
    ├── package.json            # Dependências e metadados do projeto
    └── swagger.yaml            # Definição da API no padrão OpenAPI 3.0

---

## 🧪 Testes

Os testes estão organizados em dois níveis:

### Testes de Integração
Localizados em `src/api/__tests__/`:
- `auth.routes.test.js` - Testa fluxos de autenticação
- `clientes.routes.test.js` - Testa operações com clientes

### Testes de Serviço
Localizados em `src/services/__tests__/`:
- `auth.service.test.js` - Testa lógica de autenticação
- `carteira.service.test.js` - Testa operações de carteira

---

## ℹ️ Observações

- Certifique-se de preencher corretamente todas as variáveis do `.env` conforme o exemplo acima.
- O serviço de e-mail utiliza autenticação OAuth2 do Google Cloud (preencha as credenciais do Google).
- O link do repositório deve ser entregue garantindo acesso ao professor.
- Métodos e classes seguem boas práticas de organização e legibilidade.
