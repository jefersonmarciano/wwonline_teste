# Instruções para Correção do Banco de Dados

Se você estiver enfrentando problemas com o login ou com a navegação após o login, é possível que haja um problema com a estrutura do banco de dados Supabase.

## Sintomas Comuns

1. **Erro no console:** "Could not find a relationship between 'friends' and 'friend_id'"
2. **Erro 400 (Bad Request)** ao carregar recursos
3. **Tela preta** ou tela de carregamento infinito após login
4. **Redirecionamentos em loop** entre páginas

## Como Corrigir

### Executar o Script SQL de Correção

1. Acesse o painel de controle do Supabase para o seu projeto
2. Navegue até **"SQL Editor"** no menu lateral
3. Crie uma nova query (botão "New Query")
4. Copie e cole todo o conteúdo do arquivo `scripts/fix-database.sql` na área de edição
5. Execute o script clicando em "Run" ou pressionando Ctrl+Enter
6. Aguarde a conclusão da execução (isso pode levar alguns segundos)

### Conteúdo do Script

O script realiza as seguintes ações:

1. Recria e corrige as tabelas:
   - `friends` (amigos)
   - `friend_requests` (solicitações de amizade) 
   - `notifications` (notificações)

2. Configura políticas de segurança para essas tabelas

3. Corrige colunas com nomenclatura incorreta (renomeia `createdAt` para `created_at` e `updatedAt` para `updated_at` no formato esperado pelo PostgreSQL)

### Verificação

Após executar o script:

1. Volte ao seu aplicativo
2. Limpe os cookies e sessão usando o botão "Limpar sessão" na tela de login
3. Faça login novamente
4. Acesse a página Dashboard que mostrará se as tabelas foram corrigidas corretamente

## Problemas Persistentes

Se os problemas persistirem mesmo após executar o script:

1. Verifique se há erros na execução do script no painel do Supabase
2. Certifique-se de que seu usuário no Supabase tem permissões para criar e modificar tabelas
3. Limpe completamente o cache do navegador e os cookies
4. Faça logout e login novamente

## Contato para Suporte

Se continuar enfrentando problemas, entre em contato com o administrador do sistema ou abra uma issue no repositório do projeto. 