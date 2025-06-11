import { StyleSheet, View, Text, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '@/components/layouts/ScreenContainer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { useOrganization } from '@/hooks/useOrganization';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSignOutAlt, faBuilding, faUser, faBuilding as faBuildingAlt } from '@fortawesome/free-solid-svg-icons';

export default function ProfileScreen() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { 
    activeOrganization,
    loading: orgLoading 
  } = useOrganization();
  
  const loading = authLoading || orgLoading;
  
  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth');
          }
        }
      ]
    );
  };

  const handleOrganizationsPress = () => {
    router.push('/organizations');
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
        <Text style={styles.title}>Profil</Text>
        
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <FontAwesomeIcon icon={faUser} size={36} color="#2563EB" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userRole}>
                {activeOrganization ? 'Aktív tag' : 'Nincs szervezet'}
              </Text>
            </View>
          </View>
        </Card>
        
        {activeOrganization && (
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <FontAwesomeIcon icon={faBuilding} size={20} color="#4B5563" />
              <Text style={styles.sectionTitle}>Jelenlegi szervezet</Text>
            </View>
            
            <View style={styles.orgContainer}>
              <Text style={styles.orgName}>{activeOrganization.name}</Text>
              <Text style={styles.orgAddress}>{activeOrganization.address}</Text>
              
              <View style={styles.orgDetails}>
                <View style={styles.orgDetailItem}>
                  <Text style={styles.orgDetailLabel}>Vezető</Text>
                  <Text style={styles.orgDetailValue}>{activeOrganization.leader_name}</Text>
                </View>
                
                <View style={styles.orgDetailItem}>
                  <Text style={styles.orgDetailLabel}>Email</Text>
                  <Text style={styles.orgDetailValue}>{activeOrganization.email}</Text>
                </View>
                
                <View style={styles.orgDetailItem}>
                  <Text style={styles.orgDetailLabel}>Telefon</Text>
                  <Text style={styles.orgDetailValue}>{activeOrganization.phone}</Text>
                </View>
              </View>
            </View>
          </Card>
        )}
        
        <View style={styles.actions}>
          <Button
            title="Szervezetek"
            variant="outline"
            onPress={handleOrganizationsPress}
            icon={<FontAwesomeIcon icon={faBuildingAlt} size={20} color="#2563EB" />}
            style={styles.organizationsButton}
          />
          <Button
            title="Kijelentkezés"
            variant="outline"
            onPress={handleSignOut}
            icon={<FontAwesomeIcon icon={faSignOutAlt} size={20} color="#2563EB" />}
          />
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
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userEmail: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  sectionCard: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#4B5563',
    marginLeft: 8,
  },
  orgContainer: {},
  orgName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 4,
  },
  orgAddress: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  orgDetails: {},
  orgDetailItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  orgDetailLabel: {
    width: 80,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  orgDetailValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  actions: {
    marginTop: 'auto',
    gap: 12,
  },
  organizationsButton: {
    marginBottom: 0,
  },
});