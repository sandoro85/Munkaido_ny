/*
  # Fix organization users table and policies

  1. Changes
    - Drop existing policies
    - Create organizations table
    - Create user_status enum type
    - Create organization_users table with proper constraints
    - Add indexes for better performance
    - Set up RLS policies with fixed NEW reference

  2. Security
    - Enable RLS
    - Add policies for proper access control
    - Ensure users can only manage their own memberships
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert organizations" ON organizations;
DROP POLICY IF EXISTS "Users can read organizations" ON organizations;
DROP POLICY IF EXISTS "Users can update organizations" ON organizations;
DROP POLICY IF EXISTS "Users can read their own organization_users" ON organization_users;
DROP POLICY IF EXISTS "Users can insert their own organization_users" ON organization_users;
DROP POLICY IF EXISTS "Organization admins can update organization_users" ON organization_users;

-- Create organizations table if not exists
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  leader_name text,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Create enum type if not exists
DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create the new table
CREATE TABLE IF NOT EXISTS public.organization_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  status user_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organization_users_user_id ON organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_organization_id ON organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_status ON organization_users(status);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations
CREATE POLICY "Users can insert organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read organizations"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update organizations"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create policies for organization_users
CREATE POLICY "Users can read their own organization_users"
  ON organization_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own organization_users"
  ON organization_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    NOT EXISTS (
      SELECT 1 FROM organization_users ou
      WHERE ou.user_id = auth.uid()
      AND ou.organization_id = organization_users.organization_id
    )
  );

CREATE POLICY "Organization admins can update organization_users"
  ON organization_users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      WHERE ou.organization_id = organization_users.organization_id
      AND ou.user_id = auth.uid()
      AND ou.role = 'admin'
      AND ou.status = 'approved'
    )
  );