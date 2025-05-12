# Wuthering Waves Pick & Ban

Sistema de pick e ban para o jogo Wuthering Waves, permitindo criar salas de draft para escolher personagens em modo competitivo.

## Principais Características

- **Sistema de draft**: Pick/ban de personagens com ordem pré-definida
- **Salas multiplayer**: Crie salas e convide amigos para jogar
- **Integração com Supabase**: Autenticação e banco de dados em tempo real

## Solução de Problemas Comuns

### Problemas de Login/Tela Preta

Se você estiver enfrentando problemas ao fazer login, como tela preta após o login ou redirecionamentos infinitos:

1. **Limpar sessão**: Clique no link "Problemas para entrar? Limpar sessão" na página de login
2. **Limpar cookies do navegador**: Limpe os cookies específicos do site
3. **Acessar com URL de limpeza**: Acesse diretamente `/login?cleanup=true`

### Erros de Banco de Dados

Se estiver enfrentando erros relacionados ao banco de dados, como "Could not find a relationship between 'friends' and 'friend_id'":

1. Acesse a página do Dashboard que mostrará quais tabelas estão com problemas
2. Siga as instruções para executar o script SQL de correção em `scripts/fix-database.sql`
3. Para mais detalhes, consulte o arquivo `README-BANCO-DE-DADOS.md`

### Erro "Supabase URL and Key are required"

Se você estiver vendo erros relacionados às credenciais do Supabase:

1. Crie um arquivo `.env.local` na raiz do projeto
2. Configure as variáveis necessárias como descrito em `README.env.md`
3. Reinicie o servidor de desenvolvimento

## Desenvolvimento Local

### Pré-requisitos

- Node.js (v18+)
- NPM ou Yarn
- [Supabase CLI](https://supabase.com/docs/guides/cli) (opcional)
- Conta no Supabase com um projeto criado

### Instalação

1. Clone o repositório
   ```
   git clone <repository-url>
   ```

2. Instale as dependências
   ```
   npm install
   ```

3. Configure as variáveis de ambiente
   ```
   cp .env.example .env.local
   ```
   
4. Preencha as variáveis do Supabase no arquivo `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
   ```

5. Execute o projeto
   ```
   npm run dev
   ```

### Configuração do Banco de Dados

Para configurar o banco de dados Supabase:

1. Execute o script SQL em `scripts/setup-supabase.sql` no editor SQL do Supabase
2. Se encontrar problemas com as tabelas, execute `scripts/fix-database.sql`

### Estrutura do Projeto

- `/app` - Rotas e páginas da aplicação (Next.js App Router)
- `/components` - Componentes reutilizáveis
- `/hooks` - Hooks personalizados (auth, drafts, etc.)
- `/lib` - Bibliotecas e utilitários
- `/public` - Arquivos estáticos
- `/scripts` - Scripts úteis para configuração
- `/types` - Definições de tipos TypeScript

## Tecnologias

- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Shadcn UI](https://ui.shadcn.com/) - Componentes UI
- [TypeScript](https://www.typescriptlang.org/) - Linguagem tipada 