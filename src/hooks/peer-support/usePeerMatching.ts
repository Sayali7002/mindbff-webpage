import { useState, useEffect, useCallback, useRef } from 'react';
import { PeerMatch, PeerFilters } from '@/types/peer-support';
import { supabase } from '@/lib/supabase';
import { normalizePreferences } from '@/lib/peer-support/filters';
import { filterPeers, sortPeers } from '@/lib/peer-support/matching';

export function usePeerMatching() {
  const [allPeers, setAllPeers] = useState<PeerMatch[]>([]);
  const [filteredPeers, setFilteredPeers] = useState<PeerMatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState<boolean>(false);
  
  // Track if we've already fetched peers for the current journey
  const lastJourneyRef = useRef<string[]>([]);
  const lastSupportTypeRef = useRef<string | null>(null);
  const hasFetchedRef = useRef<boolean>(false);

  // Fetch user profile once on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.id) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!error && profile) {
            setUserProfile(profile);
          }
        }
        
        setIsProfileLoaded(true);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setIsProfileLoaded(true);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Apply client-side filters to the cached peers
  const applyFilters = useCallback((peers: PeerMatch[], filters?: Partial<PeerFilters>) => {
    if (!peers || peers.length === 0) return [];
    
    let result = [...peers];
    
    // Apply client-side filters
    if (filters) {
      // Filter by active status if specified
      if (filters.activeOnly === true) {
        result = result.filter(peer => peer.isActive === true);
      }
      
      // Apply sorting
      if (filters.sortBy) {
        result = sortPeers(result, filters.sortBy);
      }
    }
    
    return result;
  }, []);

  // Fetch peers with filters
  const fetchPeers = useCallback(async (filters?: Partial<PeerFilters>) => {
    try {
      const finalFilters: Record<string, any> = {};
      
      // Add support type filter based on user's role if not provided
      if (!filters?.supportType && userProfile) {
        const supportType = userProfile.support_type || userProfile.supportType;
        
        if (supportType === 'support-seeker' || supportType === 'I want to vent out') {
          finalFilters.supportType = 'support-giver';
        } else if (supportType === 'support-giver' || supportType === 'I want to be there for others') {
          finalFilters.supportType = 'support-seeker';
        }
      } else if (filters?.supportType) {
        finalFilters.supportType = filters.supportType;
      }
      
      // Add support preferences if available
      let supportPreferences: string[] = [];
      if (filters?.supportPreferences && filters.supportPreferences.length > 0) {
        supportPreferences = normalizePreferences(filters.supportPreferences);
        finalFilters.supportPreferences = JSON.stringify(supportPreferences);
      } else if (userProfile) {
        const preferences = userProfile.support_preferences || userProfile.supportPreferences;
        if (preferences && Array.isArray(preferences) && preferences.length > 0) {
          supportPreferences = normalizePreferences(preferences);
          finalFilters.supportPreferences = JSON.stringify(supportPreferences);
        }
      }
      
      // Check if we need to fetch from API or can use cached data
      const currentSupportType = finalFilters.supportType || null;
      const journeyChanged = JSON.stringify(supportPreferences) !== JSON.stringify(lastJourneyRef.current);
      const supportTypeChanged = currentSupportType !== lastSupportTypeRef.current;
      const shouldFetchFromApi = !hasFetchedRef.current || journeyChanged || supportTypeChanged;
      
      if (shouldFetchFromApi) {
        console.log('Fetching peers from API - journey or support type changed');
        setIsLoading(true);
        setError(null);
        
        // Build query params
        const params = new URLSearchParams();
        Object.entries(finalFilters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        
        const {
          data: { session: peerSession }
        } = await supabase.auth.getSession();

        const response = await fetch(`/api/peer-support?${params.toString()}`, {
          headers: peerSession ? { Authorization: `Bearer ${peerSession.access_token}` } : undefined,
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch peers');
        }
        
        const data = await response.json();
        
        if (data.peers && Array.isArray(data.peers)) {
          setAllPeers(data.peers);
          
          // Apply client-side filters
          const filtered = applyFilters(data.peers, filters);
          setFilteredPeers(filtered);
          
          // Update refs to track what we've fetched
          lastJourneyRef.current = supportPreferences;
          lastSupportTypeRef.current = currentSupportType;
          hasFetchedRef.current = true;
        }
        setIsLoading(false);
      } else {
        console.log('Using cached peers - only client-side filters changed');
        // Just apply client-side filters to existing data
        const filtered = applyFilters(allPeers, filters);
        setFilteredPeers(filtered);
      }
    } catch (err) {
      console.error('Error fetching peers:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  }, [userProfile, applyFilters, allPeers]);

  return {
    peers: allPeers,
    filteredPeers,
    isLoading,
    error,
    userProfile,
    isProfileLoaded,
    fetchPeers
  };
}
