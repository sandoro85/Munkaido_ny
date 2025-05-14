import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface Organization {
  id: string;
  name: string;
  address: string;
  created_at: string;
  leader_name: string;
  email: string;
  phone: string;
}

interface UserOrganization {
  id: string;
  user_id: string;
  organization_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export function useOrganization() {
  const { user } = useAuth();
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    if (user) {
      fetchOrganizations();
      fetchUserOrganizations();
    } else {
      setOrganizations([]);
      setUserOrganizations([]);
      setLoading(false);
    }
  }, [user]);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setOrganizations(data);
      }
    } catch (error: any) {
      console.error('[useOrganization] Error fetching organizations:', error.message);
      Alert.alert('Error', 'Failed to load organizations');
    }
  };

  const fetchUserOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_users') // Changed from user_organizations to organization_users
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      if (data) {
        setUserOrganizations(data);
      }
    } catch (error: any) {
      console.error('[useOrganization] Error fetching user organizations:', error.message);
      Alert.alert('Error', 'Failed to load your organization applications');
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (organizationData: Omit<Organization, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([organizationData])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // After creating the organization, automatically create an admin user
        const { error: userError } = await supabase
          .from('organization_users') // Changed from user_organizations to organization_users
          .insert({
            organization_id: data.id,
            user_id: user?.id,
            role: 'admin',
            status: 'approved'
          });

        if (userError) throw userError;

        // Update local state
        setOrganizations(prev => [data, ...prev]);
        await fetchUserOrganizations(); // Refresh user organizations
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('[useOrganization] Error creating organization:', error.message);
      return { data: null, error };
    }
  };

  const applyToOrganization = async (organizationId: string) => {
    try {
      const { data, error } = await supabase
        .from('organization_users') // Changed from user_organizations to organization_users
        .insert({
          user_id: user?.id,
          organization_id: organizationId,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setUserOrganizations(prev => [...prev, data]);

      return { error: null };
    } catch (error: any) {
      console.error('[useOrganization] Error applying to organization:', error.message);
      return { error: error.message || 'Unknown error' };
    }
  };

  // Get the active (approved) organization for the current user
  const activeOrganization = organizations.find(org => 
    userOrganizations.some(userOrg => 
      userOrg.organization_id === org.id && 
      userOrg.status === 'approved'
    )
  );

  // Check if user has any approved organizations
  const hasApprovedOrganization = userOrganizations.some(org => org.status === 'approved');

  // Check if user has any pending organizations
  const hasPendingOrganization = userOrganizations.some(org => org.status === 'pending');

  return {
    organizations,
    userOrganizations,
    activeOrganization,
    hasApprovedOrganization,
    hasPendingOrganization,
    createOrganization,
    applyToOrganization,
    loading,
  };
}