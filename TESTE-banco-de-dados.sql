-- ============================================================================
-- BANCO DE TESTE — Gestão Mafra · Projeto de Segurança · Fase 3
-- ============================================================================
-- Rode este SQL UMA vez, DENTRO do projeto SUPABASE DE TESTE (o novo, não o de
-- produção). No painel do Supabase de teste: menu "SQL Editor" → "New query" →
-- cole tudo → "Run".
--
-- ⚠️  CONFIRA ANTES DE RODAR: o endereço do projeto no topo da tela tem que ser
--     o do TESTE (NÃO pode ser vycoezpwxawwgqdrtisy, que é a produção).
--
-- O que este SQL faz:
--   1) cria a tabela "dados" igualzinha à da produção (chave / valor / atualizado_em);
--   2) liga o RLS e cria uma política ABERTA só para o teste funcionar agora
--      (igual ao estado atual da produção). Na FASE 5 esta política aberta é
--      trocada pelas regras de verdade (cada login só enxerga o que é dele).
-- ============================================================================

-- 1) TABELA (mesma estrutura da produção) -----------------------------------
create table if not exists public.dados (
  chave         text primary key,
  valor         text,
  atualizado_em timestamptz default now()
);

-- 2) RLS LIGADO + política aberta TEMPORÁRIA (só no teste, trocada na Fase 5) --
alter table public.dados enable row level security;

-- remove a política aberta se já existir (para poder rodar este SQL de novo sem erro)
drop policy if exists "teste_acesso_aberto" on public.dados;

-- ⚠️ POLÍTICA ABERTA — SOMENTE PARA O AMBIENTE DE TESTE.
--    Deixa o app de teste ler e gravar normalmente enquanto montamos o ambiente.
--    NÃO use esta política na produção. Ela é substituída pelas regras reais na Fase 5.
create policy "teste_acesso_aberto"
  on public.dados
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- ============================================================================
-- 3) (OPCIONAL) DADOS FICTÍCIOS para a tela de teste não ficar vazia.
--    NUNCA coloque dados reais de condomínio/condômino no ambiente de teste.
--    Pode rodar ou pular este bloco — é só um aviso de exemplo.
-- ============================================================================
insert into public.dados (chave, valor)
values (
  'mafra:avisos',
  '[{"id":"teste1","titulo":"AMBIENTE DE TESTE","texto":"Este e o site de TESTE da Gestao Mafra. Pode mexer a vontade: nada aqui afeta a producao.","data":"2026-10-22","autor":"sistema"}]'
)
on conflict (chave) do nothing;

-- ============================================================================
-- PRONTO. Confirmação rápida (deve aparecer 1 linha, a "dados"):
-- ============================================================================
select table_name
from information_schema.tables
where table_schema = 'public' and table_name = 'dados';
