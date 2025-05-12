# Aplicação de Draft e Gerenciamento de Times

Este projeto é uma aplicação para gerenciar times, personagens e realizar drafts em tempo real usando Next.js e Supabase.

## Funcionalidades

- Sistema de autenticação com Supabase
- Gerenciamento de personagens e armas
- Criação de times e decks para torneios
- Sistema de draft em tempo real entre dois jogadores
- ID de jogador exclusivo para convites

## Configuração do Projeto

### Pré-requisitos

- Node.js 18.17 ou superior
- Conta no Supabase (https://supabase.io)

### Instalação

1. Clone o repositório
   ```bash
   git clone <repositório>
   cd nome-do-projeto
   ```

2. Instale as dependências
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente

   Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

   ```
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   ```

4. Configure o banco de dados Supabase

   Execute o script SQL presente em `scripts/setup-supabase.sql` no SQL Editor do seu projeto Supabase para criar todas as tabelas e políticas de segurança necessárias.

5. Execute o projeto em modo de desenvolvimento
   ```bash
   npm run dev
   ```

## Estrutura do Aplicativo

- `/app` - Componentes da aplicação e páginas
- `/components` - Componentes reutilizáveis
- `/hooks` - Hooks personalizados (autenticação, draft, etc.)
- `/lib` - Utilitários e configuração do Supabase
- `/types` - Definições de tipos TypeScript
- `/styles` - Estilos CSS globais
- `/public` - Arquivos estáticos

## Sistema de Draft

O sistema de draft segue a seguinte ordem:

1. **Banimentos Iniciais:**
   - Jogador 1 bane → Jogador 2 bane

2. **Picks Iniciais:**
   - Jogador 1 escolhe → Jogador 2 escolhe (4 rodadas)

3. **Banimentos do Meio:**
   - Jogador 1 bane → Jogador 2 bane

4. **Picks Finais:**
   - Jogador 1 escolhe → Jogador 2 escolhe (3 rodadas)

## Uso do ID de Jogador

Cada usuário recebe um ID de jogador único ao se registrar. Este ID pode ser compartilhado com outros jogadores para ser convidado para drafts.

Para convidar um jogador para um draft:
1. Vá para "Criar Nova Sala de Draft"
2. Selecione seu deck
3. Adicione o ID do oponente no campo adequado
4. O oponente receberá uma notificação e poderá entrar na sala

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes. 