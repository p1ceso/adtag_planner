-- Recreate Profiles Table and Triggers
-- Run this in Supabase SQL Editor

BEGIN;

-- Drop the table and any dependent objects (CASCADE removes dependent objects like policies)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Recreate the profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  email text,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Allow authenticated users to select only their own profile
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Allow authenticated users to insert only their own profile
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- Allow authenticated users to update only their own profile
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Trigger function to auto-create profile on auth.user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile when a new auth.user is created.
  -- Use COALESCE to avoid null constraint errors if fields are missing.
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Revoke execution from public to secure the function
REVOKE EXECUTE ON FUNCTION public.handle_new_user FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user FROM anon, authenticated;

-- Drop an existing trigger with the same name if present, then create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;
