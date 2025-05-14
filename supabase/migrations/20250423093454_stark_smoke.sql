/*
  # Create organizations table

  1. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `address` (text)
      - `leader_name` (text)
      - `email` (text)
      - `phone` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `organizations` table
    - Add policy for authenticated users to read/write
*/

CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  leader_name text,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read organizations" 
  ON public.organizations 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Users can insert organizations" 
  ON public.organizations 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Users can update organizations" 
  ON public.organizations 
  FOR UPDATE 
  TO authenticated 
  USING (true);