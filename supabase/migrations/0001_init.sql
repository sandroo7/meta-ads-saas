-- ═══════════════════════════════════════════════════════════════════════
--  Esquema inicial — Meta Ads SaaS
--  Ejecútalo en Supabase → SQL Editor (o con la CLI de Supabase).
-- ═══════════════════════════════════════════════════════════════════════

-- ───────────────── Perfiles (1:1 con auth.users de Supabase) ─────────────
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz default now()
);

-- ───────────── Conexión con Meta: 1 token (CIFRADO) por usuario ──────────
create table public.meta_connections (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  meta_user_id            text,                 -- id del usuario en Facebook
  access_token_encrypted  text not null,        -- token LARGO cifrado (nunca en claro)
  token_expires_at        timestamptz,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now(),
  unique(user_id)
);

-- ─────────────── Cuentas de anuncios del usuario (caché) ─────────────────
create table public.ad_accounts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  account_id  text not null,          -- act_123456...
  name        text,
  currency    text,
  created_at  timestamptz default now(),
  unique(user_id, account_id)
);

-- ─────────────────────── Trabajos de subida ─────────────────────────────
create table public.jobs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  account_id  text,
  status      text default 'pending', -- pending | running | done | error
  payload     jsonb,                  -- lo que se va a crear
  result      jsonb,                  -- ids creados
  error       text,
  created_at  timestamptz default now()
);

-- ─────────────────────────── Seguridad (RLS) ────────────────────────────
alter table public.profiles         enable row level security;
alter table public.meta_connections enable row level security;
alter table public.ad_accounts      enable row level security;
alter table public.jobs             enable row level security;

-- Cada usuario solo ve/edita LO SUYO:
create policy "own profile"  on public.profiles
  for all using (auth.uid() = id)      with check (auth.uid() = id);
create policy "own accounts" on public.ad_accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own jobs"     on public.jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ⚠️ meta_connections: RLS activado y SIN políticas A PROPÓSITO.
--    El navegador NO puede tocar los tokens. Solo el backend con la
--    service_role key (que se salta RLS) los lee/escribe. Más seguro.

-- ───────── Crear el perfil automáticamente al registrarse ────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
