-- ==========================================================
-- Charakter Journal – Supabase-Schema
-- ----------------------------------------------------------
-- Dieses Skript einmal komplett in Supabase einfügen und
-- ausführen: Projekt öffnen → "SQL Editor" → "New query" →
-- diesen kompletten Inhalt einfügen → "Run".
--
-- Es legt alle Tabellen für Kommentare, Likes, Chroniken und
-- Voting an, inklusive Row-Level-Security (RLS), sodass:
--   • jeder Besucher Kommentare/Chroniken lesen kann,
--   • jeder Besucher (nach Captcha) einen Kommentar, ein Like,
--     eine Chronik oder eine Stimme einsenden kann,
--   • die E-Mail-Adresse NIE über die öffentliche Schnittstelle
--     lesbar ist (nur der Admin sieht sie, über den Service-Key),
--   • nur der Admin (Service-Key) hervorheben/löschen/freigeben kann.
-- ==========================================================

-- ---------- Kommentare (Community-Seite) ----------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  parent_id uuid references public.comments(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  email text not null check (char_length(email) between 3 and 200),
  message text not null check (char_length(message) between 1 and 3000),
  likes int not null default 0,
  highlighted boolean not null default false,
  hidden boolean not null default false
);
create index if not exists comments_parent_idx on public.comments(parent_id);
create index if not exists comments_created_idx on public.comments(created_at);

alter table public.comments enable row level security;

-- Jeder darf nicht-versteckte Kommentare lesen (E-Mail wird über die
-- öffentliche View unten trotzdem nie ausgeliefert).
create policy "comments_public_select" on public.comments
  for select using (hidden = false);

-- Jeder darf einen neuen Kommentar anlegen (Captcha prüft das Formular
-- clientseitig vor dem Absenden; likes/highlighted/hidden müssen auf
-- den Startwerten bleiben).
create policy "comments_public_insert" on public.comments
  for insert with check (likes = 0 and highlighted = false and hidden = false);

-- Öffentliche Sicht OHNE E-Mail-Spalte – das ist es, was die Website lädt.
create or replace view public.comments_public as
  select id, created_at, parent_id, name, message, likes, highlighted
  from public.comments
  where hidden = false;

-- Likes einzeln zählen (verhindert Mehrfach-Likes pro Browser über die
-- gespeicherte Kennung im localStorage der Besucher:innen; kein Konto nötig).
create table if not exists public.comment_likes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  visitor text not null,
  created_at timestamptz not null default now(),
  primary key (comment_id, visitor)
);
alter table public.comment_likes enable row level security;
create policy "comment_likes_public_select" on public.comment_likes for select using (true);
create policy "comment_likes_public_insert" on public.comment_likes for insert with check (true);

-- Like-Zähler automatisch hochzählen
create or replace function public.bump_comment_likes() returns trigger as $$
begin
  update public.comments set likes = likes + 1 where id = new.comment_id;
  return new;
end;
$$ language plpgsql security definer;
drop trigger if exists comment_likes_bump on public.comment_likes;
create trigger comment_likes_bump after insert on public.comment_likes
  for each row execute function public.bump_comment_likes();

-- ---------- Chroniken von Azeroth (Story-Bibliothek) ----------
create table if not exists public.chronicles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null check (char_length(title) between 1 and 160),
  author text not null check (char_length(author) between 1 and 80),
  character_name text not null check (char_length(character_name) between 1 and 80),
  writing_style text not null default 'Sonstiges',
  summary text not null default '',
  cover_path text not null default '',
  book_path text not null default '',
  has_audio boolean not null default false,
  upvotes int not null default 0,
  downvotes int not null default 0,
  approved boolean not null default false,
  featured boolean not null default false,
  submitter_email text not null default ''
);
create index if not exists chronicles_approved_idx on public.chronicles(approved);

alter table public.chronicles enable row level security;

-- Nur freigegebene Chroniken sind öffentlich sichtbar.
create policy "chronicles_public_select" on public.chronicles
  for select using (approved = true);

-- Jeder darf eine Chronik einsenden – sie ist aber erst nach Admin-
-- Freigabe öffentlich sichtbar (approved startet immer false).
create policy "chronicles_public_insert" on public.chronicles
  for insert with check (approved = false and featured = false and upvotes = 0 and downvotes = 0);

-- Öffentliche Sicht OHNE Einsender-E-Mail.
create or replace view public.chronicles_public as
  select id, created_at, title, author, character_name, writing_style, summary,
         cover_path, book_path, has_audio, upvotes, downvotes, featured
  from public.chronicles
  where approved = true;

-- Voting (ein Up- oder Downvote pro Browser-Kennung und Chronik)
create table if not exists public.chronicle_votes (
  chronicle_id uuid not null references public.chronicles(id) on delete cascade,
  visitor text not null,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (chronicle_id, visitor)
);
alter table public.chronicle_votes enable row level security;
create policy "chronicle_votes_public_select" on public.chronicle_votes for select using (true);
create policy "chronicle_votes_public_insert" on public.chronicle_votes for insert with check (true);
create policy "chronicle_votes_public_update" on public.chronicle_votes for update using (true) with check (true);

create or replace function public.apply_chronicle_vote() returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    if new.value = 1 then
      update public.chronicles set upvotes = upvotes + 1 where id = new.chronicle_id;
    else
      update public.chronicles set downvotes = downvotes + 1 where id = new.chronicle_id;
    end if;
  elsif (TG_OP = 'UPDATE' and old.value <> new.value) then
    if new.value = 1 then
      update public.chronicles set upvotes = upvotes + 1, downvotes = greatest(downvotes - 1, 0) where id = new.chronicle_id;
    else
      update public.chronicles set downvotes = downvotes + 1, upvotes = greatest(upvotes - 1, 0) where id = new.chronicle_id;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;
drop trigger if exists chronicle_votes_apply on public.chronicle_votes;
create trigger chronicle_votes_apply after insert or update on public.chronicle_votes
  for each row execute function public.apply_chronicle_vote();

-- ---------- Storage (Buchcover-Bilder & HTML-Bücher) ----------
insert into storage.buckets (id, name, public)
  values ('chronicles', 'chronicles', true)
  on conflict (id) do nothing;

create policy "chronicles_storage_public_read" on storage.objects
  for select using (bucket_id = 'chronicles');
create policy "chronicles_storage_public_upload" on storage.objects
  for insert with check (bucket_id = 'chronicles' and (metadata->>'size')::bigint < 25000000);

-- ==========================================================
-- Wichtig zur Admin-Moderation:
-- Hervorheben/Löschen von Kommentaren und Freigeben/Löschen von
-- Chroniken läuft NICHT über diese öffentlichen Policies, sondern
-- über den "service_role"-Schlüssel, der RLS automatisch umgeht.
-- Diesen Schlüssel NUR im Dashboard (admin.html) eintragen, NIEMALS
-- in js/config.js oder sonst auf der öffentlichen Website!
-- ==========================================================
