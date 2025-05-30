/*
  # Add return_from_departure event type

  1. Changes
    - Add new event type to work_events table check constraint
    - Update existing check constraint
*/

-- First, drop the existing check constraint
ALTER TABLE public.work_events 
DROP CONSTRAINT IF EXISTS work_events_event_type_check;

-- Add the new check constraint with return_from_departure
ALTER TABLE public.work_events
ADD CONSTRAINT work_events_event_type_check 
CHECK (event_type IN (
  'work_start',
  'work_end',
  'official_departure',
  'private_departure',
  'return_from_departure',
  'leave'
));