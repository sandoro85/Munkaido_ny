/*
  # Initial Schema Setup

  1. Tables
    - organizations
    - organization_users
    - holidays
    - work_events

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
    - Handle existing policies
*/

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

-- Create organization_users table with enum type for status
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.organization_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role text DEFAULT 'member',
    status user_status DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    UNIQUE(organization_id, user_id)
);

-- Create holidays table
CREATE TABLE IF NOT EXISTS public.holidays (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date NOT NULL,
    name text NOT NULL,
    is_workday boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Create work_events table
CREATE TABLE IF NOT EXISTS public.work_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_type text NOT NULL CHECK (
        event_type IN (
            'work_start',
            'work_end',
            'official_departure',
            'private_departure',
            'leave'
        )
    ),
    event_date date NOT NULL,
    event_time time NOT NULL,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_organization_users_user_id ON public.organization_users(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_organization_id ON public.organization_users(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_users_status ON public.organization_users(status);

CREATE INDEX IF NOT EXISTS idx_work_events_user_id ON public.work_events(user_id);
CREATE INDEX IF NOT EXISTS idx_work_events_organization_id ON public.work_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_events_event_date ON public.work_events(event_date);
CREATE INDEX IF NOT EXISTS idx_work_events_date_time ON public.work_events(event_date, event_time);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read organizations" ON public.organizations;
    DROP POLICY IF EXISTS "Users can insert organizations" ON public.organizations;
    DROP POLICY IF EXISTS "Users can update organizations" ON public.organizations;
    DROP POLICY IF EXISTS "Users can read their own organization_users" ON public.organization_users;
    DROP POLICY IF EXISTS "Users can insert their own organization_users" ON public.organization_users;
    DROP POLICY IF EXISTS "Organization admins can update organization_users" ON public.organization_users;
    DROP POLICY IF EXISTS "Users can read holidays" ON public.holidays;
    DROP POLICY IF EXISTS "Users can read own and organization events" ON public.work_events;
    DROP POLICY IF EXISTS "Users can create own events in their organizations" ON public.work_events;
    DROP POLICY IF EXISTS "Users can update own events" ON public.work_events;
    DROP POLICY IF EXISTS "Users can delete own events" ON public.work_events;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Create policies for organizations
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

-- Create policies for organization_users
CREATE POLICY "Users can read their own organization_users"
    ON public.organization_users
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own organization_users"
    ON public.organization_users
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid() AND
        NOT EXISTS (
            SELECT 1 FROM organization_users ou
            WHERE ou.user_id = auth.uid()
            AND ou.organization_id = organization_id
        )
    );

CREATE POLICY "Organization admins can update organization_users"
    ON public.organization_users
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

-- Create policies for holidays
CREATE POLICY "Users can read holidays"
    ON public.holidays
    FOR SELECT
    TO authenticated
    USING (true);

-- Create policies for work_events
CREATE POLICY "Users can read own and organization events"
    ON public.work_events
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() 
            AND status = 'approved'
        )
    );

CREATE POLICY "Users can create own events in their organizations"
    ON public.work_events
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid() AND
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() 
            AND status = 'approved'
        )
    );

CREATE POLICY "Users can update own events"
    ON public.work_events
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own events"
    ON public.work_events
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());