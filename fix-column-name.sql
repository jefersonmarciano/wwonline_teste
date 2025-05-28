-- Script para corrigir o problema de current_pick vs currentPick

-- Verificar se a coluna atual é camelCase ou snake_case
DO $$ 
BEGIN
  -- Se a coluna current_pick não existir
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'drafts' 
    AND column_name = 'current_pick'
  ) THEN
    -- Verificar se existe como camelCase (currentpick)
    IF EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'drafts' 
      AND column_name = 'currentpick'
    ) THEN
      -- Renomear de camelCase para snake_case
      ALTER TABLE drafts RENAME COLUMN currentpick TO current_pick;
      RAISE NOTICE 'Coluna renomeada de currentpick para current_pick';
    ELSE
      -- Adicionar a coluna em snake_case se não existir
      ALTER TABLE drafts ADD COLUMN current_pick INTEGER DEFAULT 0 NOT NULL;
      RAISE NOTICE 'Coluna current_pick adicionada';
    END IF;
  ELSE
    RAISE NOTICE 'Coluna current_pick já existe corretamente';
  END IF;
END $$;

-- Atualizando os tipos das colunas para garantir consistência
DO $$
BEGIN
  ALTER TABLE drafts ALTER COLUMN current_pick SET DATA TYPE INTEGER;
  RAISE NOTICE 'Tipo da coluna current_pick definido como INTEGER';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao alterar tipo da coluna: %', SQLERRM;
END $$;

-- Atualizando valores padrão e constraint not null
DO $$
BEGIN
  ALTER TABLE drafts ALTER COLUMN current_pick SET DEFAULT 0;
  ALTER TABLE drafts ALTER COLUMN current_pick SET NOT NULL;
  RAISE NOTICE 'Propriedades da coluna current_pick atualizadas';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao alterar propriedades da coluna: %', SQLERRM;
END $$;

-- Adicionando um comentário para ajudar com o cache do Supabase
COMMENT ON COLUMN drafts.current_pick IS 'Índice atual do pick no draft (snake_case)';

-- Atualizando valores existentes se necessário
UPDATE drafts SET current_pick = 0 WHERE current_pick IS NULL;

-- Força atualização de metadados - isso pode ajudar com o cache de esquema
SELECT pg_notify('supabase_realtime', 'reload_schema');

-- Notificar conclusão
DO $$ 
BEGIN 
  RAISE NOTICE 'Correção da coluna concluída. Reinicie sua aplicação para atualizar o cache.';
END $$; 