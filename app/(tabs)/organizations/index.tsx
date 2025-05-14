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
    console.log('[OrganizationsScreen] Apply button pressed for organization:', organizationId);
    
    if (!user) {
      console.error('[OrganizationsScreen] No user found when applying');
      Alert.alert('Error', 'You must be logged in to apply to an organization');
      return;
    }

    const existingApplication = userOrganizations.find(
      org => org.organization_id === organizationId
    );

    if (existingApplication) {
      console.log('[OrganizationsScreen] Found existing application:', existingApplication);
      Alert.alert(
        'Already Applied', 
        'You have already applied to this organization'
      );
      return;
    }

    console.log('[OrganizationsScreen] Starting application process');
    setApplying(organizationId);
    
    try {
      console.log('[OrganizationsScreen] Calling applyToOrganization');
      const { error } = await applyToOrganization(organizationId);
      
      if (error) {
        console.error('[OrganizationsScreen] Error from applyToOrganization:', error);
        Alert.alert('Error', error.toString());
        return;
      }
      
      console.log('[OrganizationsScreen] Application submitted successfully');
      Alert.alert(
        'Application Submitted',
        'Your application has been submitted and is waiting for approval.'
      );
    } catch (error: any) {
      console.error('[OrganizationsScreen] Error in handleApplyToOrganization:', error);
      Alert.alert('Error', error.message || 'Failed to apply to organization');
    } finally {
      setApplying(null);
    }
  };
  
  const confirmApply = (organizationId: string, organizationName: string) => {
    console.log('[OrganizationsScreen] Confirming application for:', organizationName);
    Alert.alert(
      'Apply to Organization',
      `Are you sure you want to apply to join ${organizationName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('[OrganizationsScreen] Application cancelled')
        },
        {
          text: 'Apply',
          style: 'default',
          onPress: () => {
            console.log('[OrganizationsScreen] Application confirmed, proceeding...');
            handleApplyToOrganization(organizationId);
          }
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
              <Text style={styles.approvedText}>Member</Text>
            </View>
          ) : status === 'pending' ? (
            <View style={[styles.statusBadge, styles.pendingBadge]}>
              <Text style={styles.pendingText}>Pending</Text>
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
                <Text style={styles.applyButtonText}>Apply</Text>
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
          <Text style={styles.loadingText}>Loading...</Text>
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
          <Text style={styles.title}>Organizations</Text>
        </View>
        
        <View style={styles.actions}>
          <Button
            title="Create Organization"
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
            <Text style={styles.emptyText}>No organizations found</Text>
            <Text style={styles.emptySubtext}>
              Create a new organization to get started
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
