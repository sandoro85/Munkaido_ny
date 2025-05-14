import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

type Holiday = Database['public']['Tables']['holidays']['Row'];

export function useHolidays() {
  const [loading, setLoading] = useState(true);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/fetch-holidays`,
        {
          headers: {
            Authorization: `Bearer ${supabase.supabaseKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 
          `Failed to fetch holidays: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setHolidays(data);
    } catch (err) {
      console.error('Error fetching holidays:', err);
      setError(err instanceof Error ? err.message : 'Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    holidays,
    error,
    refreshHolidays: fetchHolidays,
  };
}