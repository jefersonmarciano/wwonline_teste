-- Verificar se a coluna current_pick existe e adicioná-la se não existir
DO $$ 
BEGIN
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
END $$;

-- Garantir que todas as colunas tenham o formato correto
ALTER TABLE drafts 
  ALTER COLUMN phase SET NOT NULL, 
  ALTER COLUMN turn SET NOT NULL,
  ALTER COLUMN completed SET DEFAULT FALSE,
  ALTER COLUMN current_pick SET DEFAULT 0;

-- Atualização adicional para resolver problemas de cache do Supabase
COMMENT ON COLUMN drafts.current_pick IS 'Número do pick atual no draft'; 