import { StyleSheet, View, Text } from 'react-native';
import { WorkStatus } from '@/hooks/useWorkStatus';

const STATUS_CONFIG = {
  not_started: {
    label: 'Nem kezdte el',
    colors: {
      bg: '#F3F4F6',
      text: '#4B5563'
    }
  },
  working: {
    label: 'Dolgozik',
    colors: {
      bg: '#DCFCE7',
      text: '#059669'
    }
  },
  official_leave: {
    label: 'Hivatalos távollét',
    colors: {
      bg: '#E0E7FF',
      text: '#4F46E5'
    }
  },
  private_leave: {
    label: 'Magán távollét',
    colors: {
      bg: '#FEF3C7',
      text: '#D97706'
    }
  },
  finished: {
    label: 'Nap vége',
    colors: {
      bg: '#E5E7EB',
      text: '#374151'
    }
  },
  on_leave: {
    label: 'Szabadságon',
    colors: {
      bg: '#FCE7F3',
      text: '#BE185D'
    }
  }
};

interface WorkStatusBadgeProps {
  status: WorkStatus;
}

export default function WorkStatusBadge({ status }: WorkStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  return (
    <View style={[styles.badge, { backgroundColor: config.colors.bg }]}>
      <Text style={[styles.text, { color: config.colors.text }]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});