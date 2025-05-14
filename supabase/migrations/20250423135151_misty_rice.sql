/*
  # Fix work events table

  1. Changes
    - Drop and recreate work_events table with proper constraints
    - Add proper indexes and foreign keys
    - Update RLS policies
    
  2. Security
    - Enable RLS
    - Add policies for CRUD operations
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.work_events;

-- Create work_events table
CREATE TABLE public.work_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
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
CREATE INDEX idx_work_events_user_id ON public.work_events(user_id);
CREATE INDEX idx_work_events_organization_id ON public.work_events(organization_id);
CREATE INDEX idx_work_events_event_date ON public.work_events(event_date);
CREATE INDEX idx_work_events_date_time ON public.work_events(event_date, event_time);

-- Enable Row Level Security
ALTER TABLE public.work_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own events and events in their organizations
CREATE POLICY "Users can read own and organization events" ON public.work_events
    FOR SELECT
    TO public
    USING (
        user_id = auth.uid() OR
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() 
            AND status = 'approved'
        )
    );

-- Users can create events for themselves in their organizations
CREATE POLICY "Users can create own events in their organizations" ON public.work_events
    FOR INSERT
    TO public
    WITH CHECK (
        user_id = auth.uid() AND
        organization_id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() 
            AND status = 'approved'
        )
    );

-- Users can update their own events
CREATE POLICY "Users can update own events" ON public.work_events
    FOR UPDATE
    TO public
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own events
CREATE POLICY "Users can delete own events" ON public.work_events
    FOR DELETE
    TO public
    USING (user_id = auth.uid());