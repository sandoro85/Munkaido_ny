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
import ScreenContainer from '@/components/layouts/ScreenContainer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TextInput from '@/components/ui/TextInput';
import { useOrganization } from '@/hooks/useOrganization';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faArrowLeft, 
  faBuilding, 
  faUser, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt 
} from '@fortawesome/free-solid-svg-icons';

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
    const newErrors: Record<string, string> = {};
    
    if (!orgName) {
      newErrors.orgName = 'A szervezet neve kötelező';
    }
    
    if (!orgAddress) {
      newErrors.orgAddress = 'A cím megadása kötelező';
    }
    
    if (!leaderName) {
      newErrors.leaderName = 'A vezető neve kötelező';
    }
    
    if (!leaderEmail) {
      newErrors.leaderEmail = 'Az email cím megadása kötelező';
    } else if (!/\S+@\S+\.\S+/.test(leaderEmail)) {
      newErrors.leaderEmail = 'Kérjük, adjon meg egy érvényes email címet';
    }
    
    if (!leaderPhone) {
      newErrors.leaderPhone = 'A telefonszám megadása kötelező';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await createOrganization({
        name: orgName,
        address: orgAddress,
        leader_name: leaderName,
        email: leaderEmail,
        phone: leaderPhone,
      });
      
      if (error) {
        throw error;
      }
      
      Alert.alert(
        'Sikeres',
        'A szervezet sikeresen létrejött!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Hiba', error.message || 'Nem sikerült létrehozni a szervezetet');
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
            <FontAwesomeIcon icon={faArrowLeft} size={24} color="#4B5563" />
          </TouchableOpacity>
          <Text style={styles.title}>Új szervezet létrehozása</Text>
        </View>
        
        <Card style={styles.formCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Szervezet adatai</Text>
              
              <TextInput
                label="Szervezet neve"
                placeholder="Adja meg a szervezet nevét"
                value={orgName}
                onChangeText={setOrgName}
                error={errors.orgName}
                leftIcon={<FontAwesomeIcon icon={faBuilding} size={20} color="#4B5563" />}
              />
              
              <TextInput
                label="Szervezet címe"
                placeholder="Adja meg a teljes címet"
                value={orgAddress}
                onChangeText={setOrgAddress}
                error={errors.orgAddress}
                leftIcon={<FontAwesomeIcon icon={faMapMarkerAlt} size={20} color="#4B5563" />}
              />
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Vezető adatai</Text>
              
              <TextInput
                label="Vezető neve"
                placeholder="Adja meg a vezető teljes nevét"
                value={leaderName}
                onChangeText={setLeaderName}
                error={errors.leaderName}
                leftIcon={<FontAwesomeIcon icon={faUser} size={20} color="#4B5563" />}
              />
              
              <TextInput
                label="Email cím"
                placeholder="Adja meg a vezető email címét"
                keyboardType="email-address"
                autoCapitalize="none"
                value={leaderEmail}
                onChangeText={setLeaderEmail}
                error={errors.leaderEmail}
                leftIcon={<FontAwesomeIcon icon={faEnvelope} size={20} color="#4B5563" />}
              />
              
              <TextInput
                label="Telefonszám"
                placeholder="Adja meg a vezető telefonszámát"
                keyboardType="phone-pad"
                value={leaderPhone}
                onChangeText={setLeaderPhone}
                error={errors.leaderPhone}
                leftIcon={<FontAwesomeIcon icon={faPhone} size={20} color="#4B5563" />}
              />
            </View>
            
            <Button
              title="Szervezet létrehozása"
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