/*
  # Add event type to work events table

  1. Changes
    - Add event_type column to work_events table with specific event types
    - Update existing policies to work with the new column

  2. Event Types
    - work_start: When user starts working
    - work_end: When user ends their work day
    - official_departure: When user leaves for official business
    - private_departure: When user leaves for private matters
    - leave: When user is on leave
*/

ALTER TABLE public.work_events
ADD COLUMN IF NOT EXISTS event_type text CHECK (
  event_type IN (
    'work_start',
    'work_end',
    'official_departure',
    'private_departure',
    'leave'
  )
) NOT NULL;