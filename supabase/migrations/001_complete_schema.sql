-- =====================================================
-- SendColis - Migration complète selon cahier des charges
-- =====================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================================================
-- TABLE: PROFILES (Utilisateurs avec KYC)
-- =====================================================
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  
  -- KYC Fields
  id_document_url text, -- URL du scan de la pièce d'identité
  id_document_type text check (id_document_type in ('passport', 'national_id', 'driver_license')),
  id_verified boolean default false,
  verification_status text default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  verification_date timestamp with time zone,
  
  -- Role
  role text default 'user' check (role in ('user', 'admin')),
  account_status text default 'active' check (account_status in ('active', 'suspended', 'banned')),
  
  -- Stats
  total_shipments_sent integer default 0,
  total_shipments_delivered integer default 0,
  average_rating numeric(3,2) default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select using ( true );

create policy "Users can insert their own profile."
  on profiles for insert with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update using ( auth.uid() = id );

-- Trigger pour créer automatiquement un profil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- TABLE: LISTINGS (Annonces de voyage)
-- =====================================================
create table if not exists public.listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  
  -- Trajet
  departure_city text not null,
  arrival_city text not null,
  departure_date date not null,
  arrival_date date,
  
  -- Transport
  transport_type text check (transport_type in ('plane', 'train', 'bus', 'boat', 'car')),
  flight_number text, -- Numéro de vol/train/etc
  
  -- Capacité
  available_weight numeric not null,
  price_per_kg numeric not null,
  
  -- Restrictions
  accepted_parcel_types text[], -- ['documents', 'clothes', 'electronics', 'food', etc]
  special_conditions text,
  
  description text,
  image_url text,
  
  status text default 'active' check (status in ('active', 'full', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.listings enable row level security;

create policy "Listings are viewable by everyone."
  on listings for select using ( true );

create policy "Users can insert their own listings."
  on listings for insert with check ( auth.uid() = user_id );

create policy "Users can update their own listings."
  on listings for update using ( auth.uid() = user_id );

-- =====================================================
-- TABLE: TRANSACTIONS (Mise en relation + Envoi)
-- =====================================================
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) not null,
  sender_id uuid references public.profiles(id) not null,
  traveler_id uuid references public.profiles(id) not null,
  
  -- Colis
  parcel_description text,
  parcel_photo_url text,
  weight_requested numeric not null,
  parcel_dimensions jsonb, -- {length: x, width: y, height: z}
  parcel_type text,
  
  -- Financier
  connection_fee numeric default 5000, -- Frais de mise en relation
  transport_price numeric not null, -- Prix du transport (weight * price_per_kg)
  commission_rate numeric default 0.15, -- 10-15%
  commission_amount numeric,
  total_price numeric not null, -- connection_fee + transport_price
  traveler_payout numeric, -- transport_price - commission_amount
  
  -- Statuts
  status text default 'pending_approval' check (status in (
    'pending_approval', 
    'approved', 
    'connection_fee_paid',
    'transport_fee_paid', 
    'in_transit',
    'delivered', 
    'cancelled',
    'disputed'
  )),
  payment_status text default 'pending' check (payment_status in (
    'pending', 
    'connection_paid',
    'fully_paid',
    'held_in_escrow', 
    'released', 
    'refunded'
  )),
  
  -- Contrat
  contract_url text, -- URL du PDF généré
  contract_signed_sender boolean default false,
  contract_signed_traveler boolean default false,
  
  -- Dates importantes
  pickup_date timestamp with time zone,
  delivery_date timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "Users can see their own transactions."
  on transactions for select
  using ( auth.uid() = sender_id or auth.uid() = traveler_id );

create policy "Senders can create transactions."
  on transactions for insert
  with check ( auth.uid() = sender_id );

create policy "Involved parties can update transactions."
  on transactions for update
  using ( auth.uid() = sender_id or auth.uid() = traveler_id );

-- =====================================================
-- TABLE: MESSAGES (Chat)
-- =====================================================
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  transaction_id uuid references public.transactions(id) not null,
  sender_id uuid references public.profiles(id) not null,
  content text not null,
  attachment_url text,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

create policy "Users can see messages in their transactions."
  on messages for select
  using ( exists (
    select 1 from transactions
    where transactions.id = messages.transaction_id
    and (transactions.sender_id = auth.uid() or transactions.traveler_id = auth.uid())
  ));

create policy "Users can send messages in their transactions."
  on messages for insert
  with check ( exists (
    select 1 from transactions
    where transactions.id = transaction_id
    and (transactions.sender_id = auth.uid() or transactions.traveler_id = auth.uid())
  ));

-- =====================================================
-- TABLE: REVIEWS (Notations)
-- =====================================================
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  transaction_id uuid references public.transactions(id) not null,
  reviewer_id uuid references public.profiles(id) not null,
  target_id uuid references public.profiles(id) not null,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone."
  on reviews for select using ( true );

create policy "Participants can create reviews."
  on reviews for insert
  with check ( auth.uid() = reviewer_id );

-- =====================================================
-- TABLE: PROHIBITED_ITEMS (Produits interdits)
-- =====================================================
create table if not exists public.prohibited_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null,
  description text,
  severity text check (severity in ('warning', 'forbidden')),
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.prohibited_items enable row level security;

create policy "Prohibited items are viewable by everyone."
  on prohibited_items for select using ( true );

-- Données initiales
insert into public.prohibited_items (name, category, description, severity) values
  ('Stupéfiants', 'Drogues', 'Toute substance illicite', 'forbidden'),
  ('Armes à feu', 'Armes', 'Armes, munitions, explosifs', 'forbidden'),
  ('Produits inflammables', 'Chimie', 'Essence, gaz, produits corrosifs', 'forbidden'),
  ('Produits périssables', 'Alimentaire', 'Viande, poisson sans autorisation', 'warning'),
  ('Médicaments non autorisés', 'Médical', 'Médicaments sans ordonnance ou autorisation', 'warning'),
  ('Contrefaçons', 'Commercial', 'Produits de contrefaçon', 'forbidden')
on conflict do nothing;

-- =====================================================
-- TABLE: DISPUTES (Litiges)
-- =====================================================
create table if not exists public.disputes (
  id uuid default uuid_generate_v4() primary key,
  transaction_id uuid references public.transactions(id) not null,
  reported_by uuid references public.profiles(id) not null,
  reason text not null,
  description text,
  status text default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  resolution text,
  resolved_by uuid references public.profiles(id),
  resolved_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.disputes enable row level security;

create policy "Users can see disputes they're involved in."
  on disputes for select
  using ( 
    auth.uid() = reported_by or 
    exists (
      select 1 from transactions 
      where transactions.id = disputes.transaction_id 
      and (transactions.sender_id = auth.uid() or transactions.traveler_id = auth.uid())
    )
  );

create policy "Users can create disputes."
  on disputes for insert
  with check ( auth.uid() = reported_by );

-- =====================================================
-- TABLE: PAYMENT_TRANSACTIONS (Paiements)
-- =====================================================
create table if not exists public.payment_transactions (
  id uuid default uuid_generate_v4() primary key,
  transaction_id uuid references public.transactions(id) not null,
  payer_id uuid references public.profiles(id) not null,
  amount numeric not null,
  payment_method text check (payment_method in ('mobile_money', 'card', 'paypal', 'bank_transfer')),
  payment_provider text, -- 'airtel_money', 'moov_money', etc
  provider_transaction_id text,
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payment_transactions enable row level security;

create policy "Users can see their own payments."
  on payment_transactions for select
  using ( auth.uid() = payer_id );

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Fonction pour calculer la note moyenne d'un utilisateur
create or replace function update_user_rating()
returns trigger as $$
begin
  update profiles
  set average_rating = (
    select avg(rating)::numeric(3,2)
    from reviews
    where target_id = new.target_id
  )
  where id = new.target_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_rating_trigger on reviews;
create trigger update_rating_trigger
  after insert on reviews
  for each row
  execute function update_user_rating();

-- Fonction pour calculer automatiquement les montants
create or replace function calculate_transaction_amounts()
returns trigger as $$
begin
  new.commission_amount := new.transport_price * new.commission_rate;
  new.traveler_payout := new.transport_price - new.commission_amount;
  new.total_price := new.connection_fee + new.transport_price;
  return new;
end;
$$ language plpgsql;

drop trigger if exists calculate_amounts_trigger on transactions;
create trigger calculate_amounts_trigger
  before insert or update on transactions
  for each row
  execute function calculate_transaction_amounts();
