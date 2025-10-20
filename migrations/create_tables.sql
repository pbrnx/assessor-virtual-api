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
INSERT INTO investimento_produto (nome, tipo, risco, preco) VALUES ("ETF IVVB11 (SeP 500)", 'Ações', 'Alto', 255.80);
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