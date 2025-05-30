import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/types/supabase';
import NetInfo from '@react-native-community/netinfo';

type WorkEvent = Database['public']['Tables']['work_events']['Row'];
type Holiday = Database['public']['Tables']['holidays']['Row'];
type EventType = WorkEvent['event_type'];

export function useWorkEvents(organizationId?: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<WorkEvent[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  // Set up network state listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!user || !organizationId) {
      setLoading(false);
      return;
    }

    console.log('[useWorkEvents] Fetching events for user:', user.id);
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('work_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .order('event_date', { ascending: false })
        .order('event_time', { ascending: true });

      if (error) {
        console.error('[useWorkEvents] Error fetching events:', error);
        throw error;
      }

      console.log('[useWorkEvents] Fetched events:', data?.length);
      setEvents(data || []);
    } catch (error) {
      console.error('[useWorkEvents] Error in fetchEvents:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, organizationId]);

  const fetchHolidays = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      setHolidays(data || []);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  }, []);

  useEffect(() => {
    fetchEvents().catch(console.error);
    fetchHolidays();
  }, [fetchEvents, fetchHolidays]);

  const recordEvent = async (
    eventType: EventType, 
    eventDate: string, 
    eventTime: string
  ) => {
    if (!isOnline) {
      throw new Error('No internet connection available. Please try again when you\'re online.');
    }

    if (!user || !organizationId) {
      throw new Error('User or organization not found');
    }

    console.log('[useWorkEvents] Recording event:', { eventType, eventDate, eventTime });

    try {
      // Check if an event of the same type already exists for today
      const { data: existingEvents } = await supabase
        .from('work_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('organization_id', organizationId)
        .eq('event_date', eventDate)
        .eq('event_type', eventType);

      if (existingEvents && existingEvents.length > 0) {
        throw new Error(`You have already recorded a ${eventType.replace('_', ' ')} event for today`);
      }

      // Record the new event
      const { data, error } = await supabase
        .from('work_events')
        .insert([
          {
            user_id: user.id,
            organization_id: organizationId,
            event_type: eventType,
            event_date: eventDate,
            event_time: eventTime
          }
        ])
        .select();

      if (error) {
        console.error('[useWorkEvents] Error recording event:', error);
        throw error;
      }

      console.log('[useWorkEvents] Event recorded successfully:', data[0]);

      // Update local state
      setEvents(prev => [...prev, data[0]]);
      
      return { data: data[0], error: null };
    } catch (error: any) {
      console.error('[useWorkEvents] Error in recordEvent:', error);
      throw error;
    }
  };

  const updateEvent = async (
    eventId: string,
    updates: Partial<Pick<WorkEvent, 'event_date' | 'event_time' | 'event_type'>>
  ) => {
    if (!user) {
      return { error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('work_events')
        .update(updates)
        .eq('id', eventId)
        .eq('user_id', user.id)
        .select();

      if (error) {
        throw error;
      }

      // Update local state
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId ? { ...event, ...updates } : event
        )
      );
      
      return { data: data[0], error: null };
    } catch (error) {
      console.error('Error updating event:', error);
      return { data: null, error };
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!user) {
      return { error: 'User not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('work_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setEvents(prev => prev.filter(event => event.id !== eventId));
      
      return { error: null };
    } catch (error) {
      console.error('Error deleting event:', error);
      return { error };
    }
  };

  const calculateDayWorktime = (date: string) => {
    const dayEvents = events.filter(event => event.event_date === date);
    
    const workStart = dayEvents.find(event => event.event_type === 'work_start');
    const workEnd = dayEvents.find(event => event.event_type === 'work_end');
    const leave = dayEvents.find(event => event.event_type === 'leave');
    
    if (leave) {
      return 8 * 60; // 8 hours in minutes
    }
    
    if (!workStart || !workEnd) {
      return 0;
    }
    
    let workMinutes = 0;
    let currentStart = new Date(`${date}T${workStart.event_time}`);
    
    // Process all events chronologically
    const sortedEvents = dayEvents
      .sort((a, b) => a.event_time.localeCompare(b.event_time));
    
    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      const eventTime = new Date(`${date}T${event.event_time}`);
      
      switch (event.event_type) {
        case 'work_start':
          currentStart = eventTime;
          break;
          
        case 'work_end':
          workMinutes += (eventTime.getTime() - currentStart.getTime()) / (1000 * 60);
          break;
          
        case 'official_departure':
        case 'private_departure':
          workMinutes += (eventTime.getTime() - currentStart.getTime()) / (1000 * 60);
          break;
          
        case 'return_from_departure':
          currentStart = eventTime;
          break;
      }
    }
    
    return Math.max(0, workMinutes);
  };

  const isWorkday = (date: string) => {
    const dateObj = new Date(date);
    const day = dateObj.getDay();
    
    // Check if it's a weekend (0 = Sunday, 6 = Saturday)
    if (day === 0 || day === 6) {
      return false;
    }
    
    // Check if it's a holiday
    const holiday = holidays.find(h => h.date === date);
    if (holiday && !holiday.is_workday) {
      return false;
    }
    
    return true;
  };

  const getEventsByMonth = () => {
    const groupedEvents: Record<string, Record<string, WorkEvent[]>> = {};
    
    events.forEach(event => {
      const [year, month] = event.event_date.split('-');
      const yearMonth = `${year}-${month}`;
      
      if (!groupedEvents[year]) {
        groupedEvents[year] = {};
      }
      
      if (!groupedEvents[year][yearMonth]) {
        groupedEvents[year][yearMonth] = [];
      }
      
      groupedEvents[year][yearMonth].push(event);
    });
    
    return groupedEvents;
  };

  const calculateMonthlyBalance = (year: string, month: string) => {
    // Get all days in the month
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    let totalWorkMinutes = 0;
    let requiredWorkMinutes = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      if (isWorkday(date)) {
        requiredWorkMinutes += 8 * 60; // 8 hours in minutes
        totalWorkMinutes += calculateDayWorktime(date);
      }
    }
    
    return totalWorkMinutes - requiredWorkMinutes;
  };

  return {
    loading,
    events,
    holidays,
    recordEvent,
    updateEvent,
    deleteEvent,
    fetchEvents,
    calculateDayWorktime,
    isWorkday,
    getEventsByMonth,
    calculateMonthlyBalance,
    isOnline,
  };
}