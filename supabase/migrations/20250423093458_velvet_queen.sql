/*
  # Create holidays table

  1. New Tables
    - `holidays`
      - `id` (uuid, primary key)
      - `date` (date)
      - `name` (text)
      - `is_workday` (boolean)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `holidays` table
    - Add policy for authenticated users to read holidays
*/

CREATE TABLE IF NOT EXISTS public.holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  name text NOT NULL,
  is_workday boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read holidays" 
  ON public.holidays 
  FOR SELECT 
  TO authenticated 
  USING (true);