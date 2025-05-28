-- Script para configurar corretamente as tabelas de amigos
-- Execute este script no SQL Editor do Supabase

-- Tabela de amigos: relacionamento entre usuários
CREATE TABLE IF NOT EXISTS friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  -- Não permitir que um usuário seja amigo dele mesmo
  CONSTRAINT user_not_friend_self CHECK (user_id <> friend_id),
  -- Garantir que não exista duplicidade na relação de amizade
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

-- Adicionar comentários para melhorar a documentação
COMMENT ON TABLE friends IS 'Armazena relacionamentos de amizade entre usuários';
COMMENT ON COLUMN friends.user_id IS 'ID do usuário';
COMMENT ON COLUMN friends.friend_id IS 'ID do amigo do usuário';

-- Tabela de solicitações de amizade
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  -- Não permitir que um usuário envie solicitação para ele mesmo
  CONSTRAINT sender_not_receiver CHECK (sender_id <> receiver_id),
  -- Garantir que não existam solicitações duplicadas
  CONSTRAINT unique_request UNIQUE (sender_id, receiver_id)
);

-- Adicionar comentários para melhorar a documentação
COMMENT ON TABLE friend_requests IS 'Armazena solicitações de amizade entre usuários';
COMMENT ON COLUMN friend_requests.sender_id IS 'ID do usuário que enviou a solicitação';
COMMENT ON COLUMN friend_requests.receiver_id IS 'ID do usuário que recebeu a solicitação';
COMMENT ON COLUMN friend_requests.status IS 'Status da solicitação: pending, accepted ou rejected';

-- Trigger para atualizar o timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger às tabelas
DROP TRIGGER IF EXISTS update_friends_updated_at ON friends;
CREATE TRIGGER update_friends_updated_at
BEFORE UPDATE ON friends
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_friend_requests_updated_at ON friend_requests;
CREATE TRIGGER update_friend_requests_updated_at
BEFORE UPDATE ON friend_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Criar RLS (Row Level Security) para proteger os dados
-- Política para friends
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

-- Política para friend_requests
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS friend_requests_select_policy ON friend_requests;
CREATE POLICY friend_requests_select_policy ON friend_requests
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS friend_requests_insert_policy ON friend_requests;
CREATE POLICY friend_requests_insert_policy ON friend_requests
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS friend_requests_update_policy ON friend_requests;
CREATE POLICY friend_requests_update_policy ON friend_requests
  FOR UPDATE
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id)
  WITH CHECK (
    -- Somente o destinatário pode aceitar/rejeitar, e apenas o
    -- remetente pode cancelar uma solicitação pendente
    (auth.uid() = receiver_id AND OLD.status = 'pending') OR
    (auth.uid() = sender_id AND OLD.status = 'pending' AND NEW.status = 'pending')
  );

-- Criação de índices para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS friends_user_id_idx ON friends (user_id);
CREATE INDEX IF NOT EXISTS friends_friend_id_idx ON friends (friend_id);
CREATE INDEX IF NOT EXISTS friend_requests_sender_id_idx ON friend_requests (sender_id);
CREATE INDEX IF NOT EXISTS friend_requests_receiver_id_idx ON friend_requests (receiver_id);
CREATE INDEX IF NOT EXISTS friend_requests_status_idx ON friend_requests (status); 