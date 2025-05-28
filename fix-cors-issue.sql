-- Verificar e adicionar localhost às origens permitidas

-- Esta função vai tentar resolver problemas de CORS adicionando localhost
-- às origens permitidas nas configurações do Supabase

-- Adicionar ou atualizar configuração de CORS
DO $$
DECLARE
  local_domain TEXT := 'http://localhost:3000';
  local_domain_alt TEXT := 'http://localhost';
  origins TEXT[];
  project_ref TEXT;
BEGIN
  -- Obter o project ref do Supabase (necessário para algumas operações)
  SELECT current_setting('request.jwt.claim.sub') INTO project_ref;
  
  -- Para debug
  RAISE NOTICE 'Configurando origens CORS para permitir: %', local_domain;
  
  -- No ambiente de produção do Supabase, a lista de origens CORS é gerenciada
  -- através da interface do projeto, mas podemos configurar alguns parâmetros aqui
  
  -- Como alternativa, podemos criar uma configuração local
  CREATE TABLE IF NOT EXISTS public.cors_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origins TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
  );
  
  -- Verificar se existe uma configuração e adicionar localhost se não estiver lá
  IF EXISTS (SELECT 1 FROM public.cors_settings LIMIT 1) THEN
    SELECT cors_settings.origins INTO origins FROM public.cors_settings LIMIT 1;
    
    -- Verificar se localhost já está nas origens
    IF NOT local_domain = ANY(origins) THEN
      -- Adicionar localhost às origens
      UPDATE public.cors_settings
      SET origins = array_append(origins, local_domain),
          updated_at = NOW();
      
      RAISE NOTICE 'Adicionado % às origens permitidas', local_domain;
    ELSE
      RAISE NOTICE '% já está nas origens permitidas', local_domain;
    END IF;
  ELSE
    -- Criar configuração inicial
    INSERT INTO public.cors_settings (origins)
    VALUES (ARRAY[local_domain, local_domain_alt]);
    
    RAISE NOTICE 'Criada configuração inicial de CORS com % e %', local_domain, local_domain_alt;
  END IF;
  
  -- Adicionar comentário explicativo
  COMMENT ON TABLE public.cors_settings IS 'Configurações locais de CORS para a aplicação. Para resolver problemas de CORS, certifique-se de adicionar todas as origens necessárias nesta tabela e no painel do Supabase.';
END $$; 