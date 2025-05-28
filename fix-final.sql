-- Script final para corrigir o problema current_pick vs currentPick definitivamente

-- Parte 1: Garantir que current_pick existe e está com o tipo correto
DO $$ 
BEGIN
  -- Se a coluna não existir, crie-a
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'drafts' 
    AND column_name = 'current_pick'
  ) THEN
    -- Adicionar a coluna em snake_case
    ALTER TABLE drafts ADD COLUMN current_pick INTEGER DEFAULT 0 NOT NULL;
    RAISE NOTICE 'Coluna current_pick adicionada';
  END IF;

  -- Garanta que o tipo está correto
  ALTER TABLE drafts ALTER COLUMN current_pick SET DATA TYPE INTEGER;
  
  -- Adicione restrições para não nulo e valor padrão
  ALTER TABLE drafts ALTER COLUMN current_pick SET NOT NULL;
  ALTER TABLE drafts ALTER COLUMN current_pick SET DEFAULT 0;
  
  RAISE NOTICE 'Coluna current_pick configurada corretamente';
END $$;

-- Parte 2: Migrar dados de currentPick (legado) para current_pick (novo)
DO $$ 
BEGIN
  -- Verificar se existe uma coluna currentPick legada
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'drafts' 
    AND column_name = 'currentpick'
  ) THEN
    -- Copiar dados da coluna camelCase para snake_case
    UPDATE drafts 
    SET current_pick = currentpick::integer 
    WHERE currentpick IS NOT NULL;
    
    -- Remover a coluna camelCase antiga
    ALTER TABLE drafts DROP COLUMN currentpick;
    
    RAISE NOTICE 'Dados migrados de currentpick para current_pick e coluna legada removida';
  ELSE
    RAISE NOTICE 'Coluna legada currentpick não encontrada, nada a migrar';
  END IF;
END $$;

-- Parte 3: Adicionar comentário para auxiliar o Supabase a reconhecer a coluna
COMMENT ON COLUMN drafts.current_pick IS 'Número atual do pick no processo de draft (formato snake_case)';

-- Atualizar todos os registros onde current_pick é NULL para ter valor padrão
UPDATE drafts SET current_pick = 0 WHERE current_pick IS NULL;

-- Notificar para atualização de metadados
SELECT pg_notify('supabase_realtime', 'reload_schema');

RAISE NOTICE 'Correção concluída com sucesso. Reinicie sua aplicação para atualizar o cache.'; 