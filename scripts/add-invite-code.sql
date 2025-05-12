-- Adicionar coluna de código de convite na tabela draft_details
ALTER TABLE draft_details ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Atualizar os drafts existentes com códigos aleatórios
UPDATE draft_details 
SET invite_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))
WHERE invite_code IS NULL;

-- Criar um index para busca rápida por código
CREATE INDEX IF NOT EXISTS idx_draft_details_invite_code ON draft_details(invite_code);

-- Função para gerar código aleatório
CREATE OR REPLACE FUNCTION generate_invite_code() 
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Gerar um código de 6 caracteres em maiúsculas
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- Verificar se o código já existe
    SELECT EXISTS(SELECT 1 FROM draft_details WHERE invite_code = code) INTO exists;
    
    -- Se não existir, retornar o código
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar código automaticamente para novos drafts
CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar o trigger na tabela
DROP TRIGGER IF EXISTS set_invite_code_trigger ON draft_details;
CREATE TRIGGER set_invite_code_trigger
BEFORE INSERT ON draft_details
FOR EACH ROW
EXECUTE FUNCTION set_invite_code(); 