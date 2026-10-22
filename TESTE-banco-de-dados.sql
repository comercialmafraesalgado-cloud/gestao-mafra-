-- ============================================================================
-- BANCO DE TESTE — Gestão Mafra · Projeto de Segurança · Fase 3
-- ============================================================================
-- Rode este SQL UMA vez, DENTRO do projeto SUPABASE DE TESTE (o novo, não o de
-- produção). No painel do Supabase de teste: menu "SQL Editor" → "New query" →
-- cole tudo → "Run".
--
-- ⚠️  CONFIRA ANTES DE RODAR: o endereço do projeto no topo da tela tem que ser
--     o do TESTE (NÃO pode ser vycoezpwxawwgqdrtisy, que é a produção).
--     Mesmo assim, o passo 0 abaixo trava sozinho se perceber que é a produção.
--
-- O que este SQL faz:
--   0) TRAVA DE SEGURANÇA: aborta se a tabela já tiver dados e não estiver
--      marcada como teste (ou seja, se for a produção). Nada é alterado.
--   1) cria a tabela "dados" igualzinha à da produção (chave / valor / atualizado_em);
--   2) libera o acesso (grants) e liga o RLS com uma política ABERTA só para o
--      teste funcionar agora (igual ao estado atual da produção). Na FASE 5 esta
--      política aberta é trocada pelas regras de verdade (cada login só enxerga o seu).
--   3) marca o banco como "teste" e põe um aviso fictício na tela.
-- ============================================================================

-- 0) TRAVA DE SEGURANÇA — impede rodar na produção por engano ------------------
--    A produção já tem muitos dados e NÃO tem a marca de teste → aborta.
do $$
begin
  if to_regclass('public.dados') is not null
     and exists (select 1 from public.dados limit 1)
     and not exists (select 1 from public.dados where chave = 'mafra:_ambiente' and valor = 'teste')
  then
    raise exception 'ABORTADO: a tabela "dados" ja tem dados e nao esta marcada como TESTE. Este script e so para o banco de TESTE. (Voce rodou no projeto de producao por engano?)';
  end if;
end $$;

-- 1) TABELA (mesma estrutura da produção) -------------------------------------
create table if not exists public.dados (
  chave         text primary key,
  valor         text,
  atualizado_em timestamptz default now()
);

-- 2a) GRANTS — garante leitura e escrita para a chave publishable/anon ---------
--     (RLS decide as LINHAS; o grant decide o acesso à TABELA. Sem isto, o app
--      poderia dar "permission denied" mesmo com a política aberta.)
grant select, insert, update, delete on public.dados to anon, authenticated;

-- 2b) RLS LIGADO + política aberta TEMPORÁRIA (só no teste, trocada na Fase 5) --
alter table public.dados enable row level security;

-- remove a política aberta se já existir (para rodar este SQL de novo sem erro)
drop policy if exists "teste_acesso_aberto" on public.dados;

-- ⚠️ POLÍTICA ABERTA — EXCLUSIVA DO BANCO DE TESTE.
--    Deixa o app de teste ler e gravar normalmente enquanto montamos o ambiente.
--    NUNCA replicar using(true)/with check(true) na produção. Na FASE 5 a produção
--    recebe RLS restritivo por papel/condomínio; esta política é substituída lá.
create policy "teste_acesso_aberto"
  on public.dados
  for all
  to anon, authenticated
  using (true)
  with check (true);

comment on policy "teste_acesso_aberto" on public.dados is
  'TEMPORARIA - SO AMBIENTE DE TESTE - trocar pelas regras reais na Fase 5. Nao usar em producao.';

-- 3) MARCA DE TESTE + dado fictício (a marca também arma a trava do passo 0) ----
insert into public.dados (chave, valor) values
  ('mafra:_ambiente', 'teste'),
  ('mafra:avisos',
   '[{"id":"teste1","titulo":"AMBIENTE DE TESTE","texto":"Este e o site de TESTE da Gestao Mafra. Pode mexer a vontade: nada aqui afeta a producao.","data":"2026-10-22","autor":"sistema"}]')
on conflict (chave) do nothing;

-- ============================================================================
-- PRONTO. Confirmação rápida (deve aparecer a tabela "dados" e a marca "teste"):
-- ============================================================================
select
  (select count(*) from information_schema.tables
     where table_schema = 'public' and table_name = 'dados')      as tabela_dados_existe,
  (select valor from public.dados where chave = 'mafra:_ambiente') as marca_ambiente;
