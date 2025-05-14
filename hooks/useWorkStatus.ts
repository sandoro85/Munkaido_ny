import { useState, useEffect } from 'react';
import { useWorkEvents } from './useWorkEvents';

export type WorkStatus = 
  | 'not_started'
  | 'working'
  | 'official_leave'
  | 'private_leave'
  | 'finished'
  | 'on_leave';

export function useWorkStatus(organizationId?: string) {
  const { events, loading } = useWorkEvents(organizationId);
  const [status, setStatus] = useState<WorkStatus>('not_started');

  useEffect(() => {
    if (!events.length) {
      setStatus('not_started');
      return;
    }

    // Get today's events
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = events
      .filter(event => event.event_date === today)
      .sort((a, b) => a.event_time.localeCompare(b.event_time));

    if (!todayEvents.length) {
      setStatus('not_started');
      return;
    }

    // Check for leave day
    if (todayEvents.some(event => event.event_type === 'leave')) {
      setStatus('on_leave');
      return;
    }

    const lastEvent = todayEvents[todayEvents.length - 1];

    switch (lastEvent.event_type) {
      case 'work_start':
        setStatus('working');
        break;
      case 'work_end':
        setStatus('finished');
        break;
      case 'official_departure':
        setStatus('official_leave');
        break;
      case 'private_departure':
        setStatus('private_leave');
        break;
      default:
        setStatus('not_started');
    }
  }, [events]);

  return {
    status,
    loading,
  };
}