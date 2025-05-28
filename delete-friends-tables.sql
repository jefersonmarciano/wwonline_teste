-- Script para deletar tabelas de amigos e solicitudes de forma limpa
-- Execute este script no SQL Editor do Supabase

-- Desabilitar RLS temporariamente para permitir operações de administrador
ALTER TABLE IF EXISTS friends DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS friend_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS friends_old DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cors_settings DISABLE ROW LEVEL SECURITY;

-- Remover políticas de segurança existentes para evitar erros de exclusão
DO $$
DECLARE
    policy_name text;
BEGIN
    -- Remover políticas da tabela friends
    FOR policy_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'friends'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON friends', policy_name);
    END LOOP;
    
    -- Remover políticas da tabela friend_requests
    FOR policy_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'friend_requests'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON friend_requests', policy_name);
    END LOOP;
END $$;

-- Remover restrições de chave estrangeira para permitir exclusão limpa
DO $$
BEGIN
    -- Remover FKs da tabela friends
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'friends_user_id_fkey'
        AND table_name = 'friends'
    ) THEN
        ALTER TABLE friends DROP CONSTRAINT friends_user_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'friends_friend_id_fkey'
        AND table_name = 'friends'
    ) THEN
        ALTER TABLE friends DROP CONSTRAINT friends_friend_id_fkey;
    END IF;
    
    -- Remover FKs da tabela friend_requests
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'friend_requests_sender_id_fkey'
        AND table_name = 'friend_requests'
    ) THEN
        ALTER TABLE friend_requests DROP CONSTRAINT friend_requests_sender_id_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'friend_requests_receiver_id_fkey'
        AND table_name = 'friend_requests'
    ) THEN
        ALTER TABLE friend_requests DROP CONSTRAINT friend_requests_receiver_id_fkey;
    END IF;
END $$;

-- Excluir as tabelas
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS friends_old CASCADE;
DROP TABLE IF EXISTS friend_requests CASCADE;
DROP TABLE IF EXISTS cors_settings CASCADE;

-- Confirmar que as tabelas foram removidas
DO $$
BEGIN
    RAISE NOTICE 'Verificando se as tabelas foram removidas:';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'friends') THEN
        RAISE NOTICE 'Tabela friends ainda existe.';
    ELSE
        RAISE NOTICE 'Tabela friends removida com sucesso.';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'friends_old') THEN
        RAISE NOTICE 'Tabela friends_old ainda existe.';
    ELSE 
        RAISE NOTICE 'Tabela friends_old removida com sucesso.';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'friend_requests') THEN
        RAISE NOTICE 'Tabela friend_requests ainda existe.';
    ELSE
        RAISE NOTICE 'Tabela friend_requests removida com sucesso.';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cors_settings') THEN
        RAISE NOTICE 'Tabela cors_settings ainda existe.';
    ELSE
        RAISE NOTICE 'Tabela cors_settings removida com sucesso.';
    END IF;
END $$; 