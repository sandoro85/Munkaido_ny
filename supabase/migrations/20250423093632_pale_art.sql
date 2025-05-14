/*
  # Add status column to organization_users table

  1. Changes
    - Add 'status' column to the 'organization_users' table with possible values: 'pending', 'approved', 'rejected'
    - Set default value to 'pending' for new records
    
  2. Purpose
    - This column is required for tracking the approval status of users in organizations
    - Fixes the error: "Could not find the 'status' column of 'organization_users' in the schema cache"
*/

-- First, create the status enum type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
    CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END $$;

-- Add the status column to the organization_users table with a default value
ALTER TABLE IF EXISTS organization_users
ADD COLUMN IF NOT EXISTS status user_status DEFAULT 'pending';