-- Script otimizado para recriar tabelas de amigos do zero
-- Execute este script no SQL Editor do Supabase após excluir as tabelas antigas

-- Criar tabela de amigos
CREATE TABLE public.friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Não permitir que um usuário seja amigo dele mesmo
  CONSTRAINT user_not_friend_self CHECK (user_id <> friend_id),
  -- Garantir que não exista duplicidade na relação de amizade
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

-- Criar tabela de solicitações de amizade
CREATE TABLE public.friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Não permitir que um usuário envie solicitação para ele mesmo
  CONSTRAINT sender_not_receiver CHECK (sender_id <> receiver_id),
  -- Garantir que não existam solicitações duplicadas
  CONSTRAINT unique_request UNIQUE (sender_id, receiver_id)
);

-- Adicionar comentários para melhorar a documentação
COMMENT ON TABLE public.friends IS 'Armazena relacionamentos de amizade entre usuários';
COMMENT ON COLUMN public.friends.user_id IS 'ID do usuário';
COMMENT ON COLUMN public.friends.friend_id IS 'ID do amigo do usuário';

COMMENT ON TABLE public.friend_requests IS 'Armazena solicitações de amizade entre usuários';
COMMENT ON COLUMN public.friend_requests.sender_id IS 'ID do usuário que enviou a solicitação';
COMMENT ON COLUMN public.friend_requests.receiver_id IS 'ID do usuário que recebeu a solicitação';
COMMENT ON COLUMN public.friend_requests.status IS 'Status da solicitação: pending, accepted ou rejected';

-- Criar trigger para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger às tabelas
CREATE TRIGGER update_friends_updated_at
BEFORE UPDATE ON public.friends
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friend_requests_updated_at
BEFORE UPDATE ON public.friend_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Configurar políticas de segurança (Row Level Security)
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela friends
CREATE POLICY friends_select_policy ON public.friends
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY friends_insert_policy ON public.friends
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY friends_delete_policy ON public.friends
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para tabela friend_requests
CREATE POLICY friend_requests_select_policy ON public.friend_requests
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY friend_requests_insert_policy ON public.friend_requests
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY friend_requests_update_policy ON public.friend_requests
  FOR UPDATE
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id)
  WITH CHECK (
    -- Somente o destinatário pode aceitar/rejeitar, e apenas o
    -- remetente pode cancelar uma solicitação pendente
    (auth.uid() = receiver_id AND OLD.status = 'pending') OR
    (auth.uid() = sender_id AND OLD.status = 'pending' AND NEW.status = 'pending')
  );

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS friends_user_id_idx ON public.friends (user_id);
CREATE INDEX IF NOT EXISTS friends_friend_id_idx ON public.friends (friend_id);
CREATE INDEX IF NOT EXISTS friend_requests_sender_id_idx ON public.friend_requests (sender_id);
CREATE INDEX IF NOT EXISTS friend_requests_receiver_id_idx ON public.friend_requests (receiver_id);
CREATE INDEX IF NOT EXISTS friend_requests_status_idx ON public.friend_requests (status);

-- Verificar que as tabelas foram criadas corretamente
DO $$
BEGIN
  RAISE NOTICE 'Verificando tabelas criadas:';
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'friends') THEN
    RAISE NOTICE 'Tabela friends criada com sucesso.';
  ELSE
    RAISE NOTICE 'ERRO: Tabela friends não foi criada!';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'friend_requests') THEN
    RAISE NOTICE 'Tabela friend_requests criada com sucesso.';
  ELSE
    RAISE NOTICE 'ERRO: Tabela friend_requests não foi criada!';
  END IF;
  
  -- Verificar se a tabela profile existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE NOTICE 'ATENÇÃO: A tabela de profiles não existe. Ela é necessária para o funcionamento completo do sistema de amigos.';
  END IF;
END $$; 