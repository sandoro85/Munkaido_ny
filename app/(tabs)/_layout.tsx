import { Tabs } from 'expo-router';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Calendar, Clock, BarChart3, Settings, User } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Redirect } from 'expo-router';

export default function TabLayout() {
  const { session, loading } = useAuth();
  
  // If user is not logged in, redirect to auth
  if (!loading && !session) {
    return <Redirect href="/auth" />;
  }
  
  // Custom tab bar button component
  function TabBarIcon({ 
    focused, 
    icon: Icon, 
    label 
  }: { 
    focused: boolean; 
    icon: any; 
    label: string 
  }) {
    return (
      <View style={styles.tabBarItem}>
        <Icon 
          size={24} 
          color={focused ? '#2563EB' : '#6B7280'} 
          strokeWidth={focused ? 2.5 : 2}
        />
        <Text 
          style={[
            styles.tabBarLabel, 
            { color: focused ? '#2563EB' : '#6B7280', fontFamily: focused ? 'Inter-Medium' : 'Inter-Regular' }
          ]}
        >
          {label}
        </Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Record',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={Clock} label="Rögzítés" />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={BarChart3} label="Jelentés" />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={Calendar} label="Naptár" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={User} label="Profil" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tabBarItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});