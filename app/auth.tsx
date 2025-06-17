import { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import ScreenContainer from '@/components/layouts/ScreenContainer';
import TextInput from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, signUp } = useAuth();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'Az email cím megadása kötelező';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Kérjük, adjon meg egy érvényes email címet';
    }
    
    if (!password) {
      newErrors.password = 'A jelszó megadása kötelező';
    } else if (password.length < 6) {
      newErrors.password = 'A jelszónak legalább 6 karakter hosszúnak kell lennie';
    }
    
    if (isSignUp && password !== confirmPassword) {
      newErrors.confirmPassword = 'A jelszavak nem egyeznek';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          Alert.alert('Regisztráció sikertelen', error.message);
        } else {
          Alert.alert(
            'Fiók létrehozva',
            'A fiókja sikeresen létrejött. Kérjük, jelentkezzen be.',
            [{ text: 'OK', onPress: () => setIsSignUp(false) }]
          );
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          Alert.alert('Bejelentkezés sikertelen', error.message);
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      Alert.alert('Hiba', error.message);
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
        <View style={styles.headerContainer}>
          <Text style={styles.logo}>Munkaidő</Text>
          <Text style={styles.subtitle}>Munkaidő követés egyszerűen</Text>
        </View>
        
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>
            {isSignUp ? 'Új fiók létrehozása' : 'Üdvözöljük újra'}
          </Text>
          
          <TextInput
            label="Email cím"
            placeholder="Adja meg az email címét"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            leftIcon={<FontAwesomeIcon icon={faEnvelope} size={20} color="#4B5563" />}
          />
          
          <TextInput
            label="Jelszó"
            placeholder="Adja meg a jelszavát"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            leftIcon={<FontAwesomeIcon icon={faLock} size={20} color="#4B5563" />}
          />
          
          {isSignUp && (
            <TextInput
              label="Jelszó megerősítése"
              placeholder="Adja meg újra a jelszavát"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              leftIcon={<FontAwesomeIcon icon={faLock} size={20} color="#4B5563" />}
            />
          )}
          
          <Button
            title={isSignUp ? 'Regisztráció' : 'Bejelentkezés'}
            onPress={handleSubmit}
            isLoading={loading}
            fullWidth
            style={styles.submitButton}
          />
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isSignUp ? 'Már van fiókja?' : 'Még nincs fiókja?'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
            >
              <Text style={styles.switchAction}>
                {isSignUp ? 'Bejelentkezés' : 'Regisztráció'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  formCard: {
    padding: 24,
  },
  formTitle: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  switchText: {
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  switchAction: {
    color: '#2563EB',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
});