# Qualidade na Obra — PBQP-H / SiAC

Sistema web responsivo para controle da qualidade em obras de edificações, com foco na execução e rastreabilidade dos processos exigidos pelo **PBQP-H / SiAC**.

A plataforma centraliza Fichas de Verificação de Serviço (FVS), inspeção de materiais, não conformidades, auditorias, processos, riscos, tarefas, equipe e indicadores gerenciais. Também permite anexar evidências fotográficas e gerar fichas em PDF para auditorias.

> Este sistema é uma ferramenta operacional de apoio ao SGQ. Ele não substitui o Manual da Qualidade, o Plano da Qualidade da Obra, os procedimentos documentados, a validação do responsável técnico nem os demais requisitos aplicáveis do SiAC.

## Principais funcionalidades

- Dashboard com indicadores de conformidade, FVS, não conformidades e tarefas;
- Catálogo com 24 modelos de FVS para serviços de construção civil;
- Inspeções por unidade habitacional, ambiente, equipe e responsável;
- Classificação dos itens como Conforme (C), Não Conforme (NC) ou Não Aplicável (NA);
- Registro de medições, observações, projeto, revisão e procedimento;
- Evidências fotográficas armazenadas em bucket privado;
- Impressão das FVS em A4 e geração de PDF com fotos;
- Cadastro e inspeção de 25 grupos de materiais controlados;
- Controle de fornecedor, lote, nota fiscal, quantidade e recebimento;
- Registro e acompanhamento de não conformidades;
- Gestão de auditorias e prontidão para certificação;
- Gestão de processos, riscos, oportunidades e tarefas;
- Cadastro de equipe e acompanhamento de competências;
- Autenticação por e-mail e senha;
- Proteção dos dados por Row Level Security (RLS);
- Identificação do autor de cada registro;
- Interface adaptada para computador, tablet e celular.

## Tecnologias

| Tecnologia | Utilização |
|---|---|
| React 19 | Interface e componentes |
| TypeScript | Tipagem e regras da aplicação |
| Vite | Ambiente de desenvolvimento e build |
| Supabase Auth | Login e gerenciamento de sessões |
| Supabase Database | Persistência dos registros em PostgreSQL |
| Supabase Storage | Armazenamento privado das fotografias |
| Supabase RLS | Controle de acesso aos dados e arquivos |
| Lucide React | Ícones da interface |
| CSS | Layout responsivo e impressão A4 |

## Requisitos

- [Node.js](https://nodejs.org/) 20 ou superior;
- npm;
- Projeto criado no [Supabase](https://supabase.com/);
- Navegador atualizado, como Chrome, Edge, Firefox ou Safari.

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone URL_DO_SEU_REPOSITORIO
cd Qualidade-na-Obra-PBQP-H-SiAC
npm install
```

Crie o arquivo de configuração local:

```bash
cp .env.example .env
```

No Windows PowerShell, você também pode usar:

```powershell
Copy-Item .env.example .env
```

Preencha o `.env` com os dados públicos do projeto Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-anon
```

Os valores ficam disponíveis no Supabase em **Project Settings → API**.

> Nunca coloque a chave `service_role` no frontend, no arquivo `.env` do Vite ou no GitHub. Utilize somente a chave pública `anon`/`publishable`.

## Configuração do Supabase

### 1. Ativar autenticação

No painel do Supabase:

1. Acesse **Authentication → Sign In / Providers**;
2. Habilite o provedor **Email**;
3. Mantenha **Anonymous sign-ins** desativado;
4. Defina se o usuário deverá confirmar o e-mail;
5. Salve as alterações.

Durante a implantação, o cadastro público pode permanecer habilitado. Depois de cadastrar a equipe, recomenda-se desativá-lo e criar novos usuários por convite.

### 2. Criar banco, políticas e Storage

1. Acesse **SQL Editor**;
2. Crie uma nova consulta;
3. Cole todo o conteúdo de [`supabase-schema.sql`](./supabase-schema.sql);
4. Execute com **Run**.

O script cria:

- Tabelas operacionais;
- Colunas de autoria (`user_id` e `created_by`);
- Índices por proprietário;
- Políticas de Row Level Security;
- Bucket privado `inspection-photos`;
- Políticas do Storage por diretório do usuário;
- Limite de 10 MB por fotografia;
- Restrição a formatos de imagem suportados.

Se já houver dados criados antes da autenticação, consulte [`README-SEGURANCA.md`](./README-SEGURANCA.md) para atribuí-los ao primeiro usuário.

## Executando localmente

```bash
npm run dev
```

Acesse o endereço informado pelo Vite, normalmente:

```text
http://localhost:5173
```

## Comandos disponíveis

| Comando | Descrição |
|---|---|
| `npm install` | Instala as dependências |
| `npm run dev` | Inicia o ambiente de desenvolvimento |
| `npm run build` | Valida o TypeScript e gera a versão de produção |
| `npm run preview` | Abre localmente a versão compilada |

## Fluxo de uso

### FVS

1. Entre com e-mail e senha;
2. Acesse **FVS de serviços**;
3. Clique em **Nova inspeção**;
4. Selecione o modelo da FVS;
5. Identifique unidade, ambiente, data, inspetor, projeto e procedimento;
6. Avalie cada item como C, NC ou NA;
7. Registre medição, observação ou evidência;
8. Anexe uma fotografia quando necessário;
9. Salve a inspeção.

O resultado geral é calculado automaticamente:

- **Em andamento:** existe item sem preenchimento;
- **Reprovado:** pelo menos um item foi classificado como NC;
- **Aprovado:** todos os itens foram preenchidos e não há NC.

### Materiais controlados

1. Acesse **Materiais**;
2. Clique em **Novo recebimento**;
3. Selecione o material controlado;
4. Informe fornecedor, lote, validade, nota fiscal e quantidade;
5. Registre verificações e observações;
6. Classifique o recebimento como aprovado, reprovado ou em análise.

### Impressão e PDF

1. Abra uma inspeção salva;
2. Clique em **Imprimir / Salvar PDF**;
3. Aguarde o carregamento das fotos;
4. Na janela de impressão, selecione **Salvar como PDF**;
5. Em **Mais definições**, desative **Cabeçalhos e rodapés**.

O layout de impressão inclui identificação da empresa, obra, endereço, ART, responsável técnico, dados da inspeção, resultados, evidências e campos de assinatura.

## Segurança

O frontend utiliza somente a chave pública do Supabase. A proteção efetiva é feita pelo Auth, pelas políticas RLS e pelas políticas do Storage.

Regras implementadas:

- Visitantes sem autenticação não acessam a plataforma;
- Usuários autenticados podem consultar os registros da equipe;
- Inclusões recebem o `user_id` e o e-mail do autor;
- Alteração e exclusão são permitidas somente ao proprietário do registro;
- Fotografias ficam em bucket privado;
- Cada fotografia é gravada dentro do diretório do usuário;
- O aplicativo utiliza links assinados e temporários para visualizar imagens;
- Arquivos `.env` não são enviados ao Git.

> A versão atual diferencia usuários autenticados e proprietários dos registros, mas ainda não possui papéis formais de administrador, funcionário e auditor.

## Estrutura do projeto

```text
.
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── CrudModule.tsx
│   │   └── shared.tsx
│   ├── hooks/
│   │   └── useSupabaseTable.ts
│   ├── lib/
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── auth.tsx
│   ├── operational.tsx
│   ├── modules.tsx
│   ├── tasks-page.tsx
│   ├── index.css
│   ├── features.css
│   ├── print-identification.css
│   ├── print-fix.css
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── supabase-schema.sql
├── README-SEGURANCA.md
├── tsconfig.json
└── vite.config.ts
```

## Dados e módulos

O banco contempla os seguintes módulos:

- `materials`: recebimentos e materiais controlados;
- `inspections`: FVS, respostas e referências das fotos;
- `non_conformities`: ocorrências, gravidade e tratamento;
- `audit_items`: itens de auditoria e evidências;
- `processes`: processos, responsáveis e eficácia;
- `risks`: riscos, oportunidades e tratamentos;
- `tasks`: tarefas, prazos e responsáveis;
- `team_members`: equipe e competências;
- `scenarios`: análise de cenários e matriz SWOT.

As imagens não são armazenadas dentro do banco. O PostgreSQL mantém apenas a referência do arquivo, enquanto os bytes ficam no Supabase Storage.

## Build de produção

```bash
npm run build
```

Os arquivos finais serão gerados em `dist/`. Essa pasta pode ser publicada em serviços compatíveis com aplicações Vite, como Vercel, Netlify, Cloudflare Pages ou hospedagem estática equivalente.

Antes da publicação:

- Configure as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` na hospedagem;
- Cadastre a URL pública em **Supabase → Authentication → URL Configuration**;
- Revise os domínios de redirecionamento;
- Confirme que o cadastro público está configurado conforme a política da empresa;
- Execute testes com usuário comum antes de disponibilizar o sistema.

## Limitações atuais

- Não há modo offline ou sincronização posterior;
- Não há papéis formais de administrador, funcionário e auditor;
- Não há assinatura digital certificada;
- O PDF é produzido pela impressão do navegador;
- As tolerâncias técnicas devem ser validadas pelo responsável técnico;
- O sistema não substitui documentos e procedimentos formais do SGQ.

## Roadmap sugerido

- [ ] Perfis de administrador, funcionário e auditor;
- [ ] Convites e gestão de usuários pelo administrador;
- [ ] Histórico de alterações e trilha de auditoria;
- [ ] Modo offline para inspeções em campo;
- [ ] Geolocalização, data e hora gravadas na fotografia;
- [ ] Assinaturas eletrônicas;
- [ ] Geração de PDF no servidor com numeração e hash;
- [ ] Notificações de prazos e não conformidades;
- [ ] Exportação de indicadores;
- [ ] PWA instalável e versão com Capacitor para Android/iOS.

## Conformidade e responsabilidade técnica

Os critérios, tolerâncias, ensaios, frequências de inspeção e regras de amostragem devem ser confrontados com:

- Projetos e revisões vigentes;
- Procedimentos executivos;
- Especificações dos fabricantes;
- Normas ABNT aplicáveis;
- Requisitos legais e contratuais;
- Plano da Qualidade da Obra;
- Orientações do responsável técnico.

## Contribuição

Antes de enviar alterações:

1. Crie uma branch;
2. Faça mudanças pequenas e bem identificadas;
3. Execute `npm run build`;
4. Não inclua `.env`, chaves, senhas ou dados pessoais;
5. Abra um Pull Request descrevendo o impacto funcional e eventuais alterações no banco.

## Licença

Este repositório ainda não possui uma licença de código aberto definida. Sem um arquivo de licença, todos os direitos permanecem reservados ao proprietário do projeto.

## Aviso

PBQP-H, SiAC, CAIXA, Supabase e demais marcas mencionadas pertencem aos seus respectivos titulares. Este projeto não representa certificação automática nem afiliação oficial com esses órgãos ou empresas.
