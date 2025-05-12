-- Verificar e corrigir a tabela de drafts
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'drafts') THEN
    -- Tabela existe, verificar se tem problemas
    BEGIN
      -- Verificar se a coluna currentPick existe
      IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'drafts' 
          AND column_name = 'current_pick'
      ) THEN
        -- Se não existir, verifica se tem currentPick (camelCase)
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'drafts' 
            AND column_name = 'currentpick'
        ) THEN
          -- Renomear a coluna de camelCase para snake_case
          ALTER TABLE drafts RENAME COLUMN currentpick TO current_pick;
        ELSE
          -- Adicionar a coluna se não existir
          ALTER TABLE drafts ADD COLUMN current_pick INTEGER DEFAULT 0 NOT NULL;
        END IF;
      END IF;
      
      -- Corrigir outros problemas potenciais
      -- Garantir que todas as colunas tenham o formato correto
      ALTER TABLE drafts 
        ALTER COLUMN phase SET NOT NULL, 
        ALTER COLUMN turn SET NOT NULL,
        ALTER COLUMN completed SET DEFAULT FALSE,
        ALTER COLUMN current_pick SET DEFAULT 0;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao tentar corrigir a tabela drafts: %', SQLERRM;
    END;
  ELSE
    -- Tabela não existe, criar
    CREATE TABLE drafts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      phase TEXT NOT NULL,
      turn TEXT NOT NULL,
      player1 JSONB NOT NULL,
      player2 JSONB NOT NULL,
      prebans JSONB DEFAULT '[]'::jsonb NOT NULL,
      picks JSONB DEFAULT '{"player1":[],"player2":[]}'::jsonb NOT NULL,
      current_pick INTEGER DEFAULT 0 NOT NULL,
      max_picks INTEGER DEFAULT 6 NOT NULL,
      max_bans INTEGER DEFAULT 3 NOT NULL,
      completed BOOLEAN DEFAULT FALSE NOT NULL,
      winner TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );
  END IF;
END $$;

-- Verificar e corrigir tabela draft_details
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'draft_details') THEN
    -- Tabela existe, verificar coluna invite_code
    BEGIN
      -- Verificar se a coluna invite_code existe
      IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'draft_details' 
          AND column_name = 'invite_code'
      ) THEN
        -- Adicionar a coluna se não existir
        ALTER TABLE draft_details ADD COLUMN invite_code TEXT UNIQUE;
        
        -- Atualizar códigos existentes
        UPDATE draft_details 
        SET invite_code = UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))
        WHERE invite_code IS NULL;
        
        -- Criar índice para busca por código
        CREATE INDEX IF NOT EXISTS idx_draft_details_invite_code ON draft_details(invite_code);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao tentar corrigir a tabela draft_details: %', SQLERRM;
    END;
  ELSE
    -- Tabela não existe, criar
    CREATE TABLE draft_details (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      draft_id UUID REFERENCES drafts(id) ON DELETE CASCADE,
      player1_deck_id TEXT,
      player2_deck_id TEXT,
      status TEXT DEFAULT 'waiting',
      invite_code TEXT UNIQUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );
    
    -- Criar índice para busca por código
    CREATE INDEX IF NOT EXISTS idx_draft_details_invite_code ON draft_details(invite_code);
  END IF;
END $$;

-- Função para gerar código de convite aleatório
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

-- Configurar políticas RLS para drafts e draft_details
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_details ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Players can read their drafts" ON drafts;
DROP POLICY IF EXISTS "Players can update their drafts" ON drafts;
DROP POLICY IF EXISTS "Authenticated users can create drafts" ON drafts;
DROP POLICY IF EXISTS "Users can read draft details" ON draft_details;
DROP POLICY IF EXISTS "Users can update their draft details" ON draft_details;
DROP POLICY IF EXISTS "Authenticated users can create draft details" ON draft_details;

-- Criar novas políticas para drafts
CREATE POLICY "Players can read their drafts" ON drafts 
  FOR SELECT USING (
    (player1->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%' OR 
    (player2->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%'
  );
CREATE POLICY "Players can update their drafts" ON drafts 
  FOR UPDATE USING (
    (player1->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%' OR 
    (player2->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%'
  );
CREATE POLICY "Authenticated users can create drafts" ON drafts 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Criar novas políticas para draft_details
CREATE POLICY "Users can read draft details" ON draft_details 
  FOR SELECT USING (true);
CREATE POLICY "Users can update their draft details" ON draft_details 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM drafts 
      WHERE drafts.id = draft_details.draft_id AND 
      ((player1->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%' OR 
       (player2->'id')::TEXT LIKE '%' || auth.uid()::TEXT || '%')
    )
  );
CREATE POLICY "Authenticated users can create draft details" ON draft_details 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated'); 