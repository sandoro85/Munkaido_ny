import { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  FlatList,
  SectionList
} from 'react-native';
import ScreenContainer from '@/components/layouts/ScreenContainer';
import Card from '@/components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useWorkEvents } from '@/hooks/useWorkEvents';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronDown, faChevronRight, faChevronUp } from '@fortawesome/free-solid-svg-icons';

export default function ReportScreen() {
  const { user } = useAuth();
  const { activeOrganization, loading: orgLoading } = useOrganization();
  const { 
    loading: eventsLoading, 
    getEventsByMonth, 
    calculateMonthlyBalance,
    calculateDayWorktime,
    isWorkday 
  } = useWorkEvents(activeOrganization?.id);
  
  const [expandedYear, setExpandedYear] = useState<string | null>(new Date().getFullYear().toString());
  const [expandedMonth, setExpandedMonth] = useState<string | null>(
    `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
  );
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  
  const loading = orgLoading || eventsLoading;
  
  const groupedEvents = getEventsByMonth();
  
  const getYears = () => {
    return Object.keys(groupedEvents).sort((a, b) => b.localeCompare(a));
  };
  
  const getMonths = (year: string) => {
    if (!groupedEvents[year]) return [];
    return Object.keys(groupedEvents[year]).sort((a, b) => b.localeCompare(a));
  };
  
  const getDays = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    if (!groupedEvents[year] || !groupedEvents[year][yearMonth]) return [];
    
    // Get all events for this month
    const monthEvents = groupedEvents[year][yearMonth];
    
    // Group events by day
    const dayGroups: Record<string, any[]> = {};
    monthEvents.forEach(event => {
      if (!dayGroups[event.event_date]) {
        dayGroups[event.event_date] = [];
      }
      dayGroups[event.event_date].push(event);
    });
    
    // Sort days in descending order
    return Object.keys(dayGroups).sort((a, b) => b.localeCompare(a));
  };
  
  const formatEventType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };
  
  const getMonthName = (month: string) => {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    return date.toLocaleString('default', { month: 'long' });
  };
  
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const sign = minutes >= 0 ? '+' : '';
    return `${sign}${hours}h ${mins}m`;
  };
  
  const formatTime = (time: string) => {
    return time;
  };
  
  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }
  
  if (!activeOrganization) {
    return (
      <ScreenContainer>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>You need to join an organization to view reports</Text>
        </View>
      </ScreenContainer>
    );
  }
  
  const renderYear = ({ item: year }: { item: string }) => {
    const isExpanded = expandedYear === year;
    
    return (
      <View style={styles.yearContainer}>
        <TouchableOpacity
          style={styles.yearHeader}
          onPress={() => setExpandedYear(isExpanded ? null : year)}
        >
          <Text style={styles.yearText}>{year}</Text>
          <FontAwesomeIcon 
            icon={isExpanded ? faChevronUp : faChevronDown} 
            size={24} 
            color="#6B7280" 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View>
            {getMonths(year).map(month => renderMonth(month))}
          </View>
        )}
      </View>
    );
  };
  
  const renderMonth = (month: string) => {
    const isExpanded = expandedMonth === month;
    const monthBalance = calculateMonthlyBalance(month.split('-')[0], month.split('-')[1]);
    
    return (
      <View key={month} style={styles.monthContainer}>
        <TouchableOpacity
          style={styles.monthHeader}
          onPress={() => setExpandedMonth(isExpanded ? null : month)}
        >
          <View style={styles.monthInfo}>
            <Text style={styles.monthText}>{getMonthName(month)}</Text>
            <Text 
              style={[
                styles.balanceText, 
                monthBalance >= 0 ? styles.positiveBalance : styles.negativeBalance
              ]}
            >
              {formatMinutes(monthBalance)}
            </Text>
          </View>
          <FontAwesomeIcon 
            icon={isExpanded ? faChevronUp : faChevronDown} 
            size={20} 
            color="#6B7280" 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View>
            {getDays(month).map(day => renderDay(day))}
          </View>
        )}
      </View>
    );
  };
  
  const renderDay = (day: string) => {
    const isExpanded = expandedDay === day;
    const dayEvents = groupedEvents[day.split('-')[0]][`${day.split('-')[0]}-${day.split('-')[1]}`].filter(
      event => event.event_date === day
    );
    
    const dayWorktime = calculateDayWorktime(day);
    const isWorkDay = isWorkday(day);
    const balance = isWorkDay ? dayWorktime - 8 * 60 : dayWorktime;
    
    const formattedDate = new Date(day).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    return (
      <Card key={day} style={styles.dayCard}>
        <TouchableOpacity
          style={styles.dayHeader}
          onPress={() => setExpandedDay(isExpanded ? null : day)}
        >
          <View style={styles.dayInfo}>
            <Text style={styles.dayText}>{formattedDate}</Text>
            <View style={styles.dayStats}>
              <Text style={styles.workTimeText}>{formatMinutes(dayWorktime).replace('+', '')}</Text>
              {isWorkDay && (
                <Text 
                  style={[
                    styles.balanceText, 
                    balance >= 0 ? styles.positiveBalance : styles.negativeBalance
                  ]}
                >
                  {formatMinutes(balance)}
                </Text>
              )}
            </View>
          </View>
          <FontAwesomeIcon 
            icon={isExpanded ? faChevronUp : faChevronRight} 
            size={20} 
            color="#6B7280" 
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.eventsContainer}>
            {dayEvents.length > 0 ? (
              dayEvents.map(event => (
                <View key={event.id} style={styles.eventItem}>
                  <Text style={styles.eventType}>{formatEventType(event.event_type)}</Text>
                  <Text style={styles.eventTime}>{formatTime(event.event_time)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noEventsText}>No events recorded for this day</Text>
            )}
          </View>
        )}
      </Card>
    );
  };
  
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Work Time Report</Text>
        
        {getYears().length > 0 ? (
          <FlatList
            data={getYears()}
            renderItem={renderYear}
            keyExtractor={item => item}
            contentContainerStyle={styles.reportList}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No work events recorded yet</Text>
          </View>
        )}
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
  reportList: {
    paddingBottom: 16,
  },
  yearContainer: {
    marginBottom: 16,
  },
  yearHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  yearText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
  },
  monthContainer: {
    marginTop: 8,
    marginLeft: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  monthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#4B5563',
    marginRight: 8,
  },
  balanceText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  positiveBalance: {
    color: '#059669',
  },
  negativeBalance: {
    color: '#DC2626',
  },
  dayCard: {
    marginTop: 8,
    marginLeft: 24,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {
    flex: 1,
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  dayStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  workTimeText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginRight: 8,
  },
  eventsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  eventType: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
  },
  eventTime: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1F2937',
  },
  noEventsText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
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