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

### Arquitetura e Padrões de Projeto

O projeto segue uma arquitetura em camadas, implementando os princípios SOLID:

- **Single Responsibility**: Cada classe tem uma única responsabilidade
- **Open/Closed**: Uso de estratégias para diferentes perfis de investidor
- **Liskov Substitution**: Implementações seguem contratos de interfaces
- **Interface Segregation**: Interfaces específicas para cada tipo de serviço
- **Dependency Inversion**: Injeção de dependências nos serviços

### Design Patterns Utilizados

1. **Strategy Pattern**: Implementado nas estratégias de recomendação de investimentos
2. **Repository Pattern**: Abstração do acesso aos dados
3. **Factory Pattern**: Criação de instâncias de serviços
4. **Singleton**: Conexão com banco de dados
5. **Middleware Pattern**: Interceptação e processamento de requisições

A plataforma permite que usuários se cadastrem, verifiquem suas contas por e-mail, redefinam senhas, definam seu perfil de investidor através de um questionário (suitability), gerenciem um saldo em conta, explorem um marketplace de ativos e montem sua própria carteira de investimentos com funcionalidades de compra e venda.

---

## ✨ Funcionalidades

-   **👤 Gestão de Clientes e Segurança**:
    -   Cadastro e login de usuários com senhas criptografadas.
    -   **Verificação de E-mail**: Processo de ativação de conta via token enviado por e-mail para garantir a autenticidade do usuário.
    -   **Recuperação de Senha**: Funcionalidade de "Esqueci minha senha" que envia um link de redefinição por e-mail.
    -   **Autenticação JWT**: Uso de JSON Web Tokens para proteger as rotas da API, garantindo que apenas usuários autenticados acessem seus dados.
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
    - Middleware para tratamento de requisições
    - Roteamento
    - Tratamento de erros
-   **OracleDB (`oracledb`)**: Driver para conexão com Oracle Database
    - Pool de conexões
    - Transações
-   **Autenticação e Segurança**:
    - **JSON Web Token (`jsonwebtoken`)**: Autenticação stateless
    - **bcryptjs**: Criptografia de senhas
    - **express-rate-limit**: Limitação de requisições
    - **helmet**: Headers de segurança
    - **cors**: Configuração de CORS
-   **E-mail e Comunicação**:
    - **Nodemailer**: Envio de e-mails
    - **Google OAuth2**: Autenticação para envio de e-mails
-   **Documentação e Desenvolvimento**:
    - **Swagger UI Express**: Documentação interativa da API
    - **OpenAPI 3.0**: Especificação da API
    - **DotEnv**: Gerenciamento de variáveis de ambiente
-   **Testes**:
    - **Jest**: Framework de testes
    - **Supertest**: Testes de integração
    - **faker-js**: Geração de dados para testes

### Frontend
-   **HTML5 / CSS3**
    - Layout responsivo
    - Flexbox e Grid
    - CSS Modules
-   **JavaScript**:
    - **Vanilla JS (ES6+)**
    - **Módulos ES6**
    - **Async/Await**
    - **LocalStorage** para persistência
-   **Bibliotecas**:
    - **Chart.js**: Visualização de dados
    - **Axios**: Requisições HTTP
    - **Day.js**: Manipulação de datas

### Banco de Dados
-   **Oracle Database**
    - Procedures e Triggers
    - Constraints e Relacionamentos
    - Índices otimizados

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
    -   Copie o conteúdo do exemplo abaixo e preencha com suas credenciais do Oracle e outras configurações.


    **.env.example**
    ```env
    # Configurações do Servidor
    PORT=3000
    ENVIRONMENT=http://localhost:3000 # ou https://assessor-virtual-api.onrender.com

    # Credenciais do Banco de Dados Oracle
    DB_USER=SEU_USUARIO_ORACLE
    DB_PASSWORD=SUA_SENHA_ORACLE
    DB_URL=oracle.fiap.com.br:1521/ORCL

    # Chave secreta para JWT
    SECRET=SUA_CHAVE_SECRETA_SUPER_SEGURA

    # E-mail do projeto (usado para autenticação de envio de e-mails)
    EMAIL_USER=SEU_EMAIL_GOOGLE

    # Credenciais do Google Cloud (para envio de e-mails)
    G_CLIENT_ID=SEU_CLIENT_ID_GOOGLE
    G_CLIENT_SECRET=SEU_CLIENT_SECRET_GOOGLE
    G_REDIRECT_URI=https://developers.google.com/oauthplayground
    G_REFRESH_TOKEN=SEU_REFRESH_TOKEN_GOOGLE

    # Credenciais do Administrador
    ADMIN_EMAIL=admin@admin.com
    ADMIN_PASSWORD=admin
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

### Endpoints Disponíveis

#### Autenticação
- `POST /api/auth/register` - Registro de novo usuário
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/forgot-password` - Solicita redefinição de senha
- `POST /api/auth/reset-password` - Redefine a senha

#### Clientes
- `GET /api/clientes/me` - Perfil do usuário autenticado
- `GET /api/clientes/{id}` - Busca cliente por ID
- `PUT /api/clientes/{id}` - Atualiza dados do cliente
- `POST /api/clientes/{id}/perfil` - Define perfil do investidor

#### Carteira
- `GET /api/clientes/{id}/carteira` - Lista ativos da carteira
- `POST /api/clientes/{id}/carteira/comprar` - Compra ativo
- `POST /api/clientes/{id}/carteira/vender` - Vende ativo

#### Recomendações
- `GET /api/clientes/{id}/recomendacoes` - Obtém recomendações
- `POST /api/clientes/{id}/recomendacoes/investir` - Investe conforme recomendação

### Acessando a Aplicação

-   **Frontend**: [http://localhost:3000](http://localhost:3000)
    > Interface web completa da plataforma

-   **Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
    > Documentação interativa da API

### Exemplos de Uso

1. **Registro de Usuário**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@email.com",
    "senha": "senha123"
  }'
```

2. **Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "senha123"
  }'
```

3. **Compra de Ativo**
```bash
curl -X POST http://localhost:3000/api/clientes/1/carteira/comprar \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "produtoId": 1,
    "quantidade": 10
  }'
```

---

## 📂 Estrutura do Projeto

A estrutura do projeto segue os princípios de Clean Architecture e SOLID:

```
.
├── src/
│   ├── api/                    # Rotas e configuração de endpoints
│   │   ├── auth.routes.js      # Rotas de autenticação
│   │   ├── carteira.routes.js  # Rotas de carteira
│   │   └── __tests__/         # Testes de integração das rotas
│   │
│   ├── config/                # Configurações do projeto
│   │   ├── auth.config.js     # Configurações de autenticação
│   │   └── database.js        # Configuração do banco de dados
│   │
│   ├── controllers/          # Controladores da aplicação
│   │   ├── auth.controller.js
│   │   ├── carteira.controller.js
│   │   └── cliente.controller.js
│   │
│   ├── dtos/                # Data Transfer Objects
│   │   ├── auth.dto.js      # DTOs de autenticação
│   │   ├── carteira.dto.js  # DTOs de carteira
│   │   └── cliente.dto.js   # DTOs de cliente
│   │
│   ├── middlewares/         # Middlewares da aplicação
│   │   ├── authJwt.js       # Middleware de autenticação JWT
│   │   └── errorHandler.js  # Tratamento global de erros
│   │
│   ├── models/             # Modelos de domínio
│   │   ├── carteira.model.js
│   │   ├── cliente.model.js
│   │   └── produto.model.js
│   │
│   ├── repositories/       # Camada de acesso a dados
│   │   ├── carteira.repository.js
│   │   └── cliente.repository.js
│   │
│   ├── services/          # Lógica de negócio
│   │   ├── auth.service.js
│   │   ├── carteira.service.js
│   │   ├── email.service.js
│   │   └── __tests__/    # Testes unitários dos serviços
│   │
│   └── utils/            # Utilitários e helpers
│       ├── validators.js
│       └── helpers.js
│
├── static/              # Frontend da aplicação
│   ├── services/        # Serviços do frontend
│   │   ├── api.js      # Cliente HTTP
│   │   ├── auth.js     # Gerenciamento de autenticação
│   │   └── state.js    # Gerenciamento de estado
│   │
│   ├── styles/         # Estilos CSS
│   │   ├── main.css
│   │   └── components/
│   │
│   ├── app.js         # Entrada da aplicação
│   └── index.html     # Página principal
│
├── tests/             # Testes automatizados
│   ├── integration/   # Testes de integração
│   └── unit/         # Testes unitários
│
├── docs/             # Documentação adicional
│   └── postman/      # Coleção do Postman
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

Para rodar os testes automatizados (unitários e de integração):

```bash
npm test
```

Os testes estão localizados em `src/services/__tests__` e `src/api/__tests__`.

---

## ℹ️ Observações

- Certifique-se de preencher corretamente todas as variáveis do `.env` conforme o exemplo acima.
- O serviço de e-mail utiliza autenticação OAuth2 do Google Cloud (preencha as credenciais do Google).
- O link do repositório deve ser entregue garantindo acesso ao professor.
- Métodos e classes seguem boas práticas de organização e legibilidade.