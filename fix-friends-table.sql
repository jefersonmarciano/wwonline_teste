-- Script simplificado para corrigir tabela de amigos

-- Remover constraints antigas se existirem (pode estar causando erros)
DO $$
BEGIN
  -- Remover foreign keys
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'friends_friend_id_fkey'
    AND table_name = 'friends'
  ) THEN
    ALTER TABLE friends DROP CONSTRAINT friends_friend_id_fkey;
  END IF;
  
  -- Tentar identificar e remover outras restrições que podem estar causando problemas
  -- Geralmente, o PostgreSQL nomeia as FKs automaticamente com padrão table_column_fkey
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name LIKE 'friends_%_fkey'
    AND table_name = 'friends'
  ) THEN
    EXECUTE 'ALTER TABLE friends DROP CONSTRAINT ' || 
    (SELECT constraint_name FROM information_schema.table_constraints 
     WHERE constraint_name LIKE 'friends_%_fkey' 
     AND table_name = 'friends' 
     LIMIT 1);
  END IF;
END $$;

-- Recriar a tabela friends com estrutura correta
CREATE TABLE IF NOT EXISTS friends_new (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT user_not_friend_self CHECK (user_id <> friend_id),
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

-- Adicionar FKs depois da criação da tabela, para poder ajustar configurações
DO $$
BEGIN
  -- Adicionar foreign key para user_id se tabela existe
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'friends_new'
  ) THEN
    ALTER TABLE friends_new 
    ADD CONSTRAINT friends_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    
    ALTER TABLE friends_new 
    ADD CONSTRAINT friends_friend_id_fkey 
    FOREIGN KEY (friend_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Migrar dados da tabela antiga para a nova, se ambas existem
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'friends'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'friends_new'
  ) THEN
    INSERT INTO friends_new (id, user_id, friend_id, created_at, updated_at)
    SELECT id, user_id, friend_id, created_at, updated_at
    FROM friends
    ON CONFLICT (user_id, friend_id) DO NOTHING;
  END IF;
END $$;

-- Substituir tabela antiga pela nova
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'friends'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'friends_new' 
  ) THEN
    -- Renomear tabela antiga para backup
    ALTER TABLE friends RENAME TO friends_old;
    -- Renomear tabela nova para o nome correto
    ALTER TABLE friends_new RENAME TO friends;
    
    -- Não excluir tabela antiga por segurança, apenas comentar
    -- DROP TABLE friends_old;
  END IF;
END $$;

-- Criar política RLS para a nova tabela
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS friends_select_policy ON friends;
CREATE POLICY friends_select_policy ON friends
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

DROP POLICY IF EXISTS friends_insert_policy ON friends;
CREATE POLICY friends_insert_policy ON friends
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS friends_delete_policy ON friends;
CREATE POLICY friends_delete_policy ON friends
  FOR DELETE
  USING (auth.uid() = user_id); 