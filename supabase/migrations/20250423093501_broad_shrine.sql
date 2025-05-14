/*
  # Create organization_users table with proper relationships

  1. New Tables (if not exists)
    - `organization_users`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key to organizations.id)
      - `user_id` (uuid, foreign key to auth.users.id)
      - `role` (text)
      - `created_at` (timestamp)
  2. Relationships
    - Foreign key from `organization_users.organization_id` to `organizations.id`
  3. Security
    - Enable RLS on `organization_users` table
    - Add policy for authenticated users to read their own organization_users entries
*/

CREATE TABLE IF NOT EXISTS public.organization_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE public.organization_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own organization_users" 
  ON public.organization_users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own organization_users" 
  ON public.organization_users 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);