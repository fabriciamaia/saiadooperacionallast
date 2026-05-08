# Saia do Operacional :: v4 (com login + Supabase)

Ferramenta da Implementare para profissionais da saúde proprietários de consultório organizarem o que sai da mão deles.

## O que tem aqui

- **Login com email + senha** (cadastro autônomo da cliente)
- **5 etapas** (níveis, escolha de área, lista, diagnóstico, plano de delegação)
- **Fase 0 do plano:** pergunta se já tem processo desenhado, e adapta o caminho
- **Página de gestão diária** (acompanhar delegações no dia a dia)
- **Painel admin** (você, Fá, vê todas as clientes)
- **Banco Supabase** (gratuito até 50k usuárias)

## Os arquivos

- `index.html` :: tela de login
- `cadastro.html` :: criar conta
- `recuperar-senha.html` + `redefinir-senha.html` :: fluxo de recuperação
- `app.html` :: a ferramenta (5 etapas)
- `gestao.html` :: gestão diária das delegações
- `admin.html` :: painel pra você (admin)
- `setup-supabase.sql` :: schema do banco (rodar uma vez)
- `supabase-config.js` :: chaves do Supabase (você preenche)
- `auth.js` :: autenticação e acesso ao banco
- `header.js` :: header compartilhado entre páginas
- `icons.js` :: biblioteca de ícones SVG
- `app.js` :: lógica da ferramenta
- `style.css` :: estilo compartilhado

## Como subir (passo a passo)

### 1. Criar projeto no Supabase
1. Vá em https://supabase.com e crie conta grátis (pode usar Google).
2. Clique em "New project".
3. Escolha região **South America (São Paulo)**.
4. Define uma senha forte do banco e guarda em lugar seguro.
5. Espera o projeto subir (1 a 2 minutos).

### 2. Rodar o schema do banco
1. No menu lateral do Supabase, abre **SQL Editor**.
2. Clique "New query".
3. Cole TODO o conteúdo do arquivo `setup-supabase.sql`.
4. Clique **Run** no canto inferior direito.
5. Deve aparecer "Success. No rows returned." Isso significa que está tudo certo.

### 3. Pegar as chaves
1. No menu lateral, vá em **Settings → API**.
2. Copie:
   - **Project URL** (algo tipo `https://abcd1234.supabase.co`)
   - **anon public** (chave longa que começa com `eyJ...`)
3. Abra o arquivo `supabase-config.js` num editor de texto.
4. Substitua `COLE_AQUI_SUA_URL` pela Project URL.
5. Substitua `COLE_AQUI_SUA_ANON_KEY` pela anon public.
6. Salve.

### 4. Subir os arquivos no GitHub
1. Crie um repositório novo no GitHub (público ou privado, tanto faz).
2. Faça upload de todos os arquivos da pasta.

### 5. Deploy no Vercel (mais fácil)
1. Vá em https://vercel.com e crie conta grátis (pode logar com o GitHub).
2. Clique "New Project".
3. Importa o repositório do GitHub.
4. Não mexe em nada nas configurações. Clica "Deploy".
5. Em ~30 segundos o site está no ar com URL tipo `seu-projeto.vercel.app`.

### 6. Te tornar admin (Fá)
1. Acessa o site e cria sua conta normalmente pelo cadastro.
2. Volta no Supabase, **SQL Editor**, e roda esse comando trocando o e-mail:
   ```sql
   UPDATE perfis SET is_admin = TRUE WHERE email = 'seu-email@dominio.com';
   ```
3. Faz logout e login de novo. Agora aparece a aba "Admin" pra você.

### 7. Configurar emails (opcional mas recomendado)
Por padrão, o Supabase exige confirmação de email. Pra desligar enquanto testa:
1. **Authentication → Providers → Email**
2. Desliga "Confirm email"
3. Salva

Quando quiser ativar de novo (em produção, recomendado), liga e configura o template de email em **Authentication → Email Templates**.

## Custos
- Supabase: grátis até 50.000 usuárias e 500MB de banco
- Vercel: grátis pra projetos pessoais
- Você só paga se ultrapassar (improvável)

## Arquitetura de dados

Três tabelas no Supabase:

- **perfis** :: nome, email, especialidade, fase (você atribui), is_admin
- **estado_ferramenta** :: 1 linha por usuária com TODO o estado em JSON (atividades, áreas concluídas, fase ICP que ela escolheu)
- **log_acompanhamento** :: registros diários da página de gestão (status + observação)

RLS (Row Level Security) está ligado: cada usuária só vê os próprios dados, exceto admin que vê tudo.

## O que cada cliente vê

1. Cria conta (nome, email, especialidade, senha)
2. Cai direto na ferramenta
3. Faz as 5 etapas no ritmo dela
4. Os dados ficam salvos automaticamente (debounce 500ms)
5. Pode acessar de qualquer dispositivo com a mesma conta
6. Página de gestão diária: registra como cada delegação está rodando
7. Imprime/PDF do plano final

## O que VOCÊ vê (admin)

- Lista de todas as clientes cadastradas
- Quantas atividades cada uma mapeou
- Quantas estão delegando
- Pode atribuir fase pra cada uma (Expansão / Evolução / Nova Fase)
- Modal com detalhes do estado atual de cada cliente
