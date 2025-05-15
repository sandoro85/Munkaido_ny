import { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Alert, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform 
} from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '@/components/layouts/ScreenContainer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import WorkStatusBadge from '@/components/ui/WorkStatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { useWorkEvents } from '@/hooks/useWorkEvents';
import { useWorkStatus } from '@/hooks/useWorkStatus';
import { Play, Timer, Flag, UserCheck, Calendar } from 'lucide-react-native';

export default function RecordScreen() {
  const { user } = useAuth();
  const { 
    activeOrganization, 
    hasApprovedOrganization,
    hasPendingOrganization,
    loading: orgLoading
  } = useOrganization();
  
  const { 
    recordEvent, 
    calculateDayWorktime,
    isOnline,
    loading: eventsLoading 
  } = useWorkEvents(activeOrganization?.id);

  const { status: workStatus } = useWorkStatus(activeOrganization?.id);
  
  const [recording, setRecording] = useState<string | null>(null);
  
  const loading = orgLoading || eventsLoading;
  
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ó ${mins}p`;
  };
  
  const today = new Date().toISOString().split('T')[0];
  const todayWorktime = calculateDayWorktime(today);
  
  const handleRecordEvent = async (eventType: string) => {
    if (!isOnline) {
      Alert.alert(
        'Nincs internetkapcsolat',
        'Az események rögzítéséhez internetkapcsolat szükséges. Kérjük, próbálja újra amikor online lesz.'
      );
      return;
    }

    if (!hasApprovedOrganization) {
      Alert.alert(
        'Szervezet szükséges',
        'Az események rögzítéséhez csatlakoznia kell egy szervezethez.',
        [
          { text: 'Csatlakozás', onPress: () => router.push('/organizations') },
          { text: 'Mégse', style: 'cancel' }
        ]
      );
      return;
    }
    
    setRecording(eventType);
    
    try {
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toTimeString().substring(0, 5);
      
      const { data, error } = await recordEvent(
        eventType as any,
        date,
        time
      );
      
      if (error) {
        throw error;
      }
      
      Alert.alert('Sikeres', `${formatEventType(eventType)} sikeresen rögzítve!`);
    } catch (error: any) {
      Alert.alert('Hiba', error.message || 'Nem sikerült rögzíteni az eseményt');
    } finally {
      setRecording(null);
    }
  };
  
  const formatEventType = (eventType: string) => {
    const types = {
      work_start: 'Munkakezdés',
      work_end: 'Munkavégzés',
      official_departure: 'Hivatalos távozás',
      private_departure: 'Magán távozás',
      leave: 'Szabadság'
    };
    return types[eventType as keyof typeof types] || eventType;
  };
  
  const confirmRecordEvent = (eventType: string) => {
    Alert.alert(
      `${formatEventType(eventType)} rögzítése`,
      `Biztosan rögzíti a ${formatEventType(eventType).toLowerCase()}t most?`,
      [
        {
          text: 'Mégse',
          style: 'cancel'
        },
        {
          text: 'Rögzítés',
          onPress: () => handleRecordEvent(eventType)
        }
      ]
    );
  };
  
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
  
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Üdvözöljük{user?.email ? `, ${user.email.split('@')[0]}` : ''}!</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('hu-HU', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
          <WorkStatusBadge status={workStatus} />
        </View>
        
        {!hasApprovedOrganization && (
          <Card style={styles.warningCard}>
            <Text style={styles.warningTitle}>
              {hasPendingOrganization 
                ? 'Szervezeti jelentkezés folyamatban' 
                : 'Nincs csatlakozott szervezet'}
            </Text>
            <Text style={styles.warningText}>
              {hasPendingOrganization 
                ? 'A jelentkezése adminisztrátori jóváhagyásra vár.' 
                : 'Az események rögzítéséhez csatlakoznia kell egy szervezethez.'}
            </Text>
            {!hasPendingOrganization && (
              <Button 
                title="Csatlakozás szervezethez" 
                variant="primary" 
                onPress={() => router.push('/organizations')}
                style={styles.joinButton}
              />
            )}
          </Card>
        )}
        
        <Card style={styles.statsCard}>
          <View style={styles.todayStats}>
            <Text style={styles.statLabel}>Mai munkaidő</Text>
            <Text style={styles.statValue}>{formatMinutes(todayWorktime)}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.viewReportButton}
            onPress={() => router.push('/report')}
          >
            <Text style={styles.viewReportText}>Jelentés megtekintése</Text>
          </TouchableOpacity>
        </Card>
        
        <View style={styles.buttonSection}>
          <Text style={styles.sectionTitle}>Esemény rögzítése</Text>
          
          <View style={styles.buttonGrid}>
            <TouchableOpacity 
              style={[styles.eventButton, styles.workStartButton]}
              onPress={() => confirmRecordEvent('work_start')}
              disabled={!hasApprovedOrganization || recording !== null}
            >
              {recording === 'work_start' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Play size={30} color="#FFFFFF" />
                  <Text style={styles.eventButtonText}>Munkakezdés</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.eventButton, styles.workEndButton]}
              onPress={() => confirmRecordEvent('work_end')}
              disabled={!hasApprovedOrganization || recording !== null}
            >
              {recording === 'work_end' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Flag size={30} color="#FFFFFF" />
                  <Text style={styles.eventButtonText}>Munkavégzés</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.eventButton, styles.officialDepartureButton]}
              onPress={() => confirmRecordEvent('official_departure')}
              disabled={!hasApprovedOrganization || recording !== null}
            >
              {recording === 'official_departure' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <UserCheck size={30} color="#FFFFFF" />
                  <Text style={styles.eventButtonText}>Hivatalos távozás</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.eventButton, styles.privateDepartureButton]}
              onPress={() => confirmRecordEvent('private_departure')}
              disabled={!hasApprovedOrganization || recording !== null}
            >
              {recording === 'private_departure' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Timer size={30} color="#FFFFFF" />
                  <Text style={styles.eventButtonText}>Magán távozás</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.eventButton, styles.leaveButton]}
              onPress={() => confirmRecordEvent('leave')}
              disabled={!hasApprovedOrganization || recording !== null}
            >
              {recording === 'leave' ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Calendar size={30} color="#FFFFFF" />
                  <Text style={styles.eventButtonText}>Szabadság</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 12,
  },
  warningCard: {
    marginBottom: 16,
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#D97706',
  },
  warningTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#92400E',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    lineHeight: 20,
    marginBottom: 16,
  },
  joinButton: {
    alignSelf: 'flex-start',
  },
  statsCard: {
    marginBottom: 24,
  },
  todayStats: {
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  viewReportButton: {
    alignSelf: 'flex-end',
  },
  viewReportText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563EB',
  },
  buttonSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  eventButton: {
    width: '48%',
    height: 120,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        cursor: 'pointer',
      },
    }),
  },
  workStartButton: {
    backgroundColor: '#2563EB',
  },
  workEndButton: {
    backgroundColor: '#0D9488',
  },
  officialDepartureButton: {
    backgroundColor: '#8B5CF6',
  },
  privateDepartureButton: {
    backgroundColor: '#F59E0B',
  },
  leaveButton: {
    backgroundColor: '#EC4899',
  },
  eventButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginTop: 12,
    textAlign: 'center',
  },
});