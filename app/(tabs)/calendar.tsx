import { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView 
} from 'react-native';
import ScreenContainer from '../../components/layouts/ScreenContainer';
import Card from '../../components/ui/Card';
import { useOrganization } from '../../hooks/useOrganization';
import { useWorkEvents } from '../../hooks/useWorkEvents';
import { useHolidays } from '../../hooks/useHolidays';
import { useAuth } from '../../hooks/useAuth';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function CalendarScreen() {
  const { activeOrganization, loading: orgLoading } = useOrganization();
  const { 
    calculateDayWorktime, 
    isWorkday,
    events,
    loading: eventsLoading 
  } = useWorkEvents(activeOrganization?.id);
  const { holidays, loading: holidaysLoading } = useHolidays();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const loading = orgLoading || eventsLoading || holidaysLoading;
  
  const getDaysInMonth = useCallback((year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  }, []);
  
  const getFirstDayOfMonth = useCallback((year: number, month: number) => {
    const date = new Date(Date.UTC(year, month, 1));
    return date.getUTCDay();
  }, []);
  
  const getDayEvents = useCallback((dateString: string) => {
    return events.filter(event => event.event_date === dateString);
  }, [events]);
  
  const isHoliday = useCallback((dateString: string) => {
    return holidays.some(holiday => holiday.date === dateString && !holiday.is_workday);
  }, [holidays]);
  
  const formatEventType = (type: string) => {
    const types = {
      work_start: 'Munkakezdés',
      work_end: 'Munkavégzés',
      official_departure: 'Hivatalos távozás',
      private_departure: 'Magán távozás',
      leave: 'Szabadság'
    };
    return types[type as keyof typeof types] || type;
  };
  
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ó ${mins}p`;
  };
  
  const previousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  const calendarDays = generateCalendarDays();
  const dayEvents = getDayEvents(selectedDate);
  
  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Betöltés...</Text>
        </View>
      </ScreenContainer>
    );
  }
  
  if (!activeOrganization) {
    return (
      <ScreenContainer>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>A naptár megtekintéséhez csatlakoznia kell egy szervezethez</Text>
        </View>
      </ScreenContainer>
    );
  }
  
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Munkanaptár</Text>
        
        <Card style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={previousMonth} style={styles.navButton}>
              <ChevronLeft size={24} color="#4B5563" />
            </TouchableOpacity>
            
            <Text style={styles.monthYearText}>
              {currentDate.toLocaleString('hu-HU', { month: 'long', year: 'numeric' })}
            </Text>
            
            <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
              <ChevronRight size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.weekdaysContainer}>
            {['Vas', 'Hét', 'Ke', 'Sze', 'Csü', 'Pén', 'Szo'].map((day, index) => (
              <Text key={index} style={styles.weekdayText}>
                {day}
              </Text>
            ))}
          </View>
          
          <View style={styles.daysContainer}>
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.emptyDay} />;
              }
              
              const dayNum = new Date(day).getUTCDate();
              const isSelected = day === selectedDate;
              const isToday = day === new Date().toISOString().split('T')[0];
              const isWorkDay = isWorkday(day);
              const hasEvents = getDayEvents(day).length > 0;
              const isHolidayDay = isHoliday(day);
              
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.day,
                    isSelected && styles.selectedDay,
                    isToday && styles.today,
                    !isWorkDay && styles.weekend,
                    isHolidayDay && styles.holiday
                  ]}
                  onPress={() => setSelectedDate(day)}
                >
                  <Text 
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText,
                      isToday && styles.todayText,
                      !isWorkDay && styles.weekendText,
                      isHolidayDay && styles.holidayText
                    ]}
                  >
                    {dayNum}
                  </Text>
                  {hasEvents && <View style={styles.eventIndicator} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
        
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            {new Date(selectedDate).toLocaleDateString('hu-HU', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          
          {isWorkday(selectedDate) ? (
            <Text style={styles.workdayText}>Munkanap</Text>
          ) : (
            <Text style={styles.nonWorkdayText}>
              {isHoliday(selectedDate) ? 'Ünnepnap' : 'Hétvége'}
            </Text>
          )}
          
          <Text style={styles.workTimeText}>
            Munkaidő: {formatMinutes(calculateDayWorktime(selectedDate))}
          </Text>
        </View>
        
        <Card style={styles.eventsCard}>
          <Text style={styles.eventsTitle}>Események</Text>
          
          <ScrollView style={styles.eventsScrollView}>
            {dayEvents.length > 0 ? (
              dayEvents.map(event => (
                <View key={event.id} style={styles.eventItem}>
                  <Text style={styles.eventType}>{formatEventType(event.event_type)}</Text>
                  <Text style={styles.eventTime}>{event.event_time}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noEventsText}>Nincsenek események ezen a napon</Text>
            )}
          </ScrollView>
        </Card>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4B5563',
    fontFamily: 'Inter-Medium',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  calendarCard: {
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayText: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  day: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  emptyDay: {
    width: '14.28%',
    height: 40,
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  selectedDay: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  today: {
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
  },
  todayText: {
    color: '#2563EB',
    fontFamily: 'Inter-SemiBold',
  },
  weekend: {
    opacity: 0.7,
  },
  weekendText: {
    color: '#9CA3AF',
  },
  holiday: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
  },
  holidayText: {
    color: '#DC2626',
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563EB',
  },
  selectedDateContainer: {
    marginBottom: 16,
  },
  selectedDateText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  workdayText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#059669',
    marginBottom: 4,
  },
  nonWorkdayText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
    marginBottom: 4,
  },
  workTimeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  eventsCard: {
    flex: 1,
  },
  eventsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  eventsScrollView: {
    flex: 1,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  eventType: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  eventTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  noEventsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  noDataText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    textAlign: 'center',
  },
});