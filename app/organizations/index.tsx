import { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  FlatList,
  Platform 
} from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '@/components/layouts/ScreenContainer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { Building, Plus, ChevronRight, ArrowLeft } from 'lucide-react-native';

export default function OrganizationsScreen() {
  const { user } = useAuth();
  const { 
    organizations, 
    userOrganizations,
    applyToOrganization,
    loading 
  } = useOrganization();
  
  const [applying, setApplying] = useState<string | null>(null);
  
  const handleApplyToOrganization = async (organizationId: string) => {
    if (!user) {
      Alert.alert('Hiba', 'A jelentkezéshez be kell jelentkeznie');
      return;
    }

    const existingApplication = userOrganizations.find(
      org => org.organization_id === organizationId
    );

    if (existingApplication) {
      Alert.alert(
        'Már jelentkezett', 
        'Már van egy aktív jelentkezése ehhez a szervezethez'
      );
      return;
    }

    setApplying(organizationId);
    
    try {
      const { error } = await applyToOrganization(organizationId);
      
      if (error) {
        Alert.alert('Hiba', error.toString());
        return;
      }
      
      Alert.alert(
        'Jelentkezés elküldve',
        'A jelentkezését elküldtük és jóváhagyásra vár.'
      );
    } catch (error: any) {
      Alert.alert('Hiba', error.message || 'Nem sikerült jelentkezni a szervezethez');
    } finally {
      setApplying(null);
    }
  };
  
  const confirmApply = (organizationId: string, organizationName: string) => {
    Alert.alert(
      'Jelentkezés a szervezethez',
      `Biztosan szeretne jelentkezni a(z) ${organizationName} szervezethez?`,
      [
        {
          text: 'Mégse',
          style: 'cancel'
        },
        {
          text: 'Jelentkezés',
          style: 'default',
          onPress: () => handleApplyToOrganization(organizationId)
        }
      ]
    );
  };
  
  const getOrganizationStatus = (organizationId: string) => {
    const orgUser = userOrganizations.find(ou => 
      ou.organization_id === organizationId && (ou.status === 'approved' || ou.status === 'pending')
    );
    return orgUser?.status;
  };
  
  const renderOrganizationItem = ({ item }: { item: any }) => {
    const status = getOrganizationStatus(item.id);
    const isApplying = applying === item.id;
    
    return (
      <Card style={styles.orgCard}>
        <View style={styles.orgHeader}>
          <View style={styles.orgIcon}>
            <Building size={24} color="#2563EB" />
          </View>
          <View style={styles.orgInfo}>
            <Text style={styles.orgName}>{item.name}</Text>
            <Text style={styles.orgAddress}>{item.address}</Text>
          </View>
          <ChevronRight size={20} color="#6B7280" />
        </View>
        
        <View style={styles.orgActions}>
          {status === 'approved' ? (
            <View style={[styles.statusBadge, styles.approvedBadge]}>
              <Text style={styles.approvedText}>Tag</Text>
            </View>
          ) : status === 'pending' ? (
            <View style={[styles.statusBadge, styles.pendingBadge]}>
              <Text style={styles.pendingText}>Folyamatban</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.applyButton, isApplying && styles.applyButtonDisabled]}
              onPress={() => confirmApply(item.id, item.name)}
              disabled={isApplying}
            >
              {isApplying ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <Text style={styles.applyButtonText}>Jelentkezés</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </Card>
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.title}>Szervezetek</Text>
        </View>
        
        <View style={styles.actions}>
          <Button
            title="Új szervezet létrehozása"
            icon={<Plus size={20} color="#FFFFFF" />}
            onPress={() => router.push('/organizations/create')}
            style={styles.createButton}
          />
        </View>
        
        {organizations.length > 0 ? (
          <FlatList
            data={organizations}
            renderItem={renderOrganizationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.orgList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nincsenek szervezetek</Text>
            <Text style={styles.emptySubtext}>
              Hozzon létre egy új szervezetet a kezdéshez
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  actions: {
    marginBottom: 24,
  },
  createButton: {
    alignSelf: 'flex-start',
  },
  orgList: {
    paddingBottom: 16,
  },
  orgCard: {
    marginBottom: 16,
  },
  orgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orgIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  orgAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  orgActions: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  applyButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
      },
      android: {
        elevation: 2,
      },
      web: {
        cursor: 'pointer',
      },
    }),
  },
  applyButtonDisabled: {
    opacity: 0.7,
    ...Platform.select({
      web: {
        cursor: 'not-allowed',
      },
    }),
  },
  applyButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: '#D1FAE5',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  approvedText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#059669',
  },
  pendingText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#D97706',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#4B5563',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});