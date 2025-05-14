/*
  # Create work events table

  1. New Tables
    - `work_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `organization_id` (uuid, foreign key to organizations)
      - `event_date` (date)
      - `event_time` (time)
      - `description` (text)
      - `created_at` (timestamptz)

  2. Indexes
    - Index on user_id for faster user-specific queries
    - Index on organization_id for faster organization-specific queries
    - Index on event_date for date-based filtering
    - Composite index on (event_date, event_time) for chronological sorting

  3. Security
    - Enable RLS
    - Users can read their own events and events in their organizations
    - Users can create events for themselves in their organizations
    - Users can update and delete their own events
*/

CREATE TABLE IF NOT EXISTS public.work_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    organization_id uuid NOT NULL REFERENCES organizations(id),
    event_date date NOT NULL,
    event_time time NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT fk_organization
        FOREIGN KEY (organization_id) 
        REFERENCES organizations(id)
        ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_work_events_user_id ON public.work_events(user_id);
CREATE INDEX IF NOT EXISTS idx_work_events_organization_id ON public.work_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_events_event_date ON public.work_events(event_date);
CREATE INDEX IF NOT EXISTS idx_work_events_date_time ON public.work_events(event_date, event_time);

-- Enable Row Level Security
ALTER TABLE public.work_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own events and events in their organizations
CREATE POLICY "Users can read own and organization events" ON public.work_events
    FOR SELECT
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
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Users can delete their own events
CREATE POLICY "Users can delete own events" ON public.work_events
    FOR DELETE
    USING (user_id = auth.uid());