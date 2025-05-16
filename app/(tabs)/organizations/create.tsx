import { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Building, User, Mail, Phone, MapPin } from 'lucide-react-native';
import ScreenContainer from '@/components/layouts/ScreenContainer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextInput from '@/components/ui/TextInput';
import { useOrganization } from '@/hooks/useOrganization';

export default function CreateOrganizationScreen() {
  const { createOrganization } = useOrganization();
  
  const [orgName, setOrgName] = useState('');
  const [orgAddress, setOrgAddress] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = () => {
    console.log('[CreateOrganization] Validating form data');
    const newErrors: Record<string, string> = {};
    
    if (!orgName) {
      newErrors.orgName = 'Organization name is required';
    }
    
    if (!orgAddress) {
      newErrors.orgAddress = 'Address is required';
    }
    
    if (!leaderName) {
      newErrors.leaderName = 'Leader name is required';
    }
    
    if (!leaderEmail) {
      newErrors.leaderEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(leaderEmail)) {
      newErrors.leaderEmail = 'Please enter a valid email';
    }
    
    if (!leaderPhone) {
      newErrors.leaderPhone = 'Phone number is required';
    }
    
    console.log('[CreateOrganization] Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    console.log('[CreateOrganization] Submit button pressed');
    if (!validate()) {
      console.log('[CreateOrganization] Form validation failed');
      return;
    }
    
    setLoading(true);
    console.log('[CreateOrganization] Creating organization with data:', {
      name: orgName,
      address: orgAddress,
      leader_name: leaderName,
      email: leaderEmail,
      phone: leaderPhone
    });
    
    try {
      const { data, error } = await createOrganization({
        name: orgName,
        address: orgAddress,
        leader_name: leaderName,
        email: leaderEmail,
        phone: leaderPhone,
      });
      
      if (error) {
        console.error('[CreateOrganization] Error creating organization:', error);
        throw error;
      }
      
      console.log('[CreateOrganization] Organization created successfully:', data);
      Alert.alert(
        'Success',
        'Organization created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('[CreateOrganization] Navigating back to main screen');
              router.replace('/(tabs)');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('[CreateOrganization] Error in handleSubmit:', error);
      Alert.alert('Error', error.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.title}>Create Organization</Text>
        </View>
        
        <Card style={styles.formCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Organization Details</Text>
              
              <TextInput
                label="Organization Name"
                placeholder="Enter organization name"
                value={orgName}
                onChangeText={setOrgName}
                error={errors.orgName}
                leftIcon={<Building size={20} color="#4B5563" />}
              />
              
              <TextInput
                label="Organization Address"
                placeholder="Enter full address"
                value={orgAddress}
                onChangeText={setOrgAddress}
                error={errors.orgAddress}
                leftIcon={<MapPin size={20} color="#4B5563" />}
              />
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Leader Details</Text>
              
              <TextInput
                label="Leader Name"
                placeholder="Enter leader's full name"
                value={leaderName}
                onChangeText={setLeaderName}
                error={errors.leaderName}
                leftIcon={<User size={20} color="#4B5563" />}
              />
              
              <TextInput
                label="Email"
                placeholder="Enter leader's email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={leaderEmail}
                onChangeText={setLeaderEmail}
                error={errors.leaderEmail}
                leftIcon={<Mail size={20} color="#4B5563" />}
              />
              
              <TextInput
                label="Phone Number"
                placeholder="Enter leader's phone number"
                keyboardType="phone-pad"
                value={leaderPhone}
                onChangeText={setLeaderPhone}
                error={errors.leaderPhone}
                leftIcon={<Phone size={20} color="#4B5563" />}
              />
            </View>
            
            <Button
              title="Create Organization"
              onPress={handleSubmit}
              isLoading={loading}
              fullWidth
              style={styles.submitButton}
            />
          </ScrollView>
        </Card>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  formCard: {
    flex: 1,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});