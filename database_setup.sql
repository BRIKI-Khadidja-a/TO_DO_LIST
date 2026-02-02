-- Création de la table users avec validation
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Table pour les todos
CREATE SEQUENCE IF NOT EXISTS todos_id_seq;

CREATE TABLE IF NOT EXISTS public.todos (
  id integer NOT NULL DEFAULT nextval('todos_id_seq'::regclass),
  title text NOT NULL,
  completed boolean DEFAULT false,
  priority text DEFAULT 'medium'::text CHECK (priority IN ('low', 'medium', 'high')),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT todos_pkey PRIMARY KEY (id)
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(created_at);