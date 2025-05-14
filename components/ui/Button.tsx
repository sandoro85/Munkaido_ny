import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  View, 
  TouchableOpacityProps 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  style,
  ...props
}: ButtonProps) {
  const getButtonStyles = () => {
    const buttonStyles = [styles.button, styles[variant], styles[`${size}Button`]];
    
    if (fullWidth) {
      buttonStyles.push(styles.fullWidth);
    }
    
    return buttonStyles;
  };

  const getTextStyles = () => {
    const textStyles = [styles.text, styles[`${variant}Text`], styles[`${size}Text`]];
    return textStyles;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator 
          color={variant === 'outline' ? '#2563EB' : '#ffffff'} 
          size={size === 'sm' ? 'small' : 'small'} 
        />
      );
    }

    return (
      <View style={styles.contentContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={getTextStyles()}>{title}</Text>
      </View>
    );
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={isLoading}
        style={[getButtonStyles(), style]}
        {...props}
      >
        <LinearGradient
          colors={['#2563EB', '#1E40AF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isLoading}
      style={[getButtonStyles(), style]}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  primary: {
    backgroundColor: '#2563EB',
  },
  secondary: {
    backgroundColor: '#0D9488',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  destructive: {
    backgroundColor: '#DC2626',
  },
  gradient: {
    borderRadius: 8,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#2563EB',
  },
  destructiveText: {
    color: '#FFFFFF',
  },
  smButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mdButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  lgButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },
});