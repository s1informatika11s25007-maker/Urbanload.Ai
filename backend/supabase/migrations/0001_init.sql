-- 0001_init.sql: profiles and roles
CREATE TYPE user_role AS ENUM ('rider', 'city_admin', 'dishub_officer', 'admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT UNIQUE NOT NULL, -- Primary Identifier
  email TEXT,                        -- Nullable (Mandatory only for admin/dishub)
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'rider'::user_role NOT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
