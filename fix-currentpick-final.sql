-- Script final otimizado para corrigir o problema current_pick vs currentPick

-- Parte 1: Verificar e adicionar coluna current_pick se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'drafts' 
    AND column_name = 'current_pick'
  ) THEN
    ALTER TABLE drafts ADD COLUMN current_pick INTEGER DEFAULT 0 NOT NULL;
    RAISE NOTICE 'Coluna current_pick adicionada';
  END IF;
END $$;

-- Parte 2: Se existir currentpick (camelCase), migrar dados e remover
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'drafts' 
    AND column_name = 'currentpick'
  ) THEN
    -- Copiar dados para current_pick
    UPDATE drafts 
    SET current_pick = currentpick::integer 
    WHERE currentpick IS NOT NULL;
    
    -- Remover coluna antiga
    ALTER TABLE drafts DROP COLUMN currentpick;
    
    RAISE NOTICE 'Dados migrados de currentpick para current_pick e coluna antiga removida';
  END IF;
END $$;

-- Garantir que current_pick tem as propriedades corretas
ALTER TABLE drafts ALTER COLUMN current_pick SET DATA TYPE INTEGER;
ALTER TABLE drafts ALTER COLUMN current_pick SET DEFAULT 0;
ALTER TABLE drafts ALTER COLUMN current_pick SET NOT NULL;

-- Adicionar comentário para informações de metadados
COMMENT ON COLUMN drafts.current_pick IS 'Número atual do pick no draft (formato snake_case)';

-- Atualizar registros NULL
UPDATE drafts SET current_pick = 0 WHERE current_pick IS NULL; 