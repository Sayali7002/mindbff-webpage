import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabase';
import { 
  MindfulnessEntry, 
  JournalEntry, 
  GratitudeEntry, 
  StrengthEntry, 
  MindfulnessEntryType 
} from '@/lib/mindfulness';

interface UseMindfulnessOptions {
  type?: MindfulnessEntryType;
  autoFetch?: boolean;
}

export function useMindfulness(options: UseMindfulnessOptions = {}) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MindfulnessEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState<number | null>(null);
  
  // Helper function to get session and headers
  const getAuthHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? { Authorization: `Bearer ${session.access_token}` } : undefined;
  }, []);
  
  // Cache key generator based on user ID and entry type
  const getCacheKey = useCallback(() => {
    if (!user || !options.type) return null;
    return `mindfulness_${options.type}_${user.id}`;
  }, [user, options.type]);
  
  // Get cached entries from localStorage
  const getCachedEntries = useCallback(() => {
    const cacheKey = getCacheKey();
    if (!cacheKey) return null;
    
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (!cachedData) return null;
      
      const { entries, timestamp } = JSON.parse(cachedData);
      // Cache is valid for 5 minutes (300000 ms)
      const isCacheValid = Date.now() - timestamp < 300000;
      
      if (isCacheValid) {
        return entries;
      }
      return null;
    } catch (err) {
      console.error('Error reading from cache:', err);
      return null;
    }
  }, [getCacheKey]);
  
  // Save entries to localStorage cache
  const cacheEntries = useCallback((entriesToCache: MindfulnessEntry[]) => {
    const cacheKey = getCacheKey();
    if (!cacheKey) return;
    
    try {
      const cacheData = {
        entries: entriesToCache,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Error caching entries:', err);
    }
  }, [getCacheKey]);
  
  // Fetch entries from API
  const fetchEntries = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    
    // Try to get cached entries first if not forcing refresh
    if (!forceRefresh) {
      const cachedEntries = getCachedEntries();
      if (cachedEntries) {
        setEntries(cachedEntries);
        return;
      }
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      let url = '/api/mindfulness';
      if (options.type) {
        url += `?type=${options.type}`;
      }
      
      const headers = await getAuthHeaders();
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch entries: ${response.statusText}`);
      }
      
      const data = await response.json();
      setEntries(data);
      setLastFetchTimestamp(Date.now());
      
      // Cache the fetched entries
      cacheEntries(data);
    } catch (err: any) {
      console.error('Error fetching mindfulness entries:', err);
      setError(err.message || 'Failed to fetch entries');
    } finally {
      setIsLoading(false);
    }
  }, [user, options.type, getAuthHeaders, getCachedEntries, cacheEntries]);
  
  // Create a new entry
  const createEntry = useCallback(async (entry: Omit<MindfulnessEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/mindfulness', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(entry),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create entry: ${response.statusText}`);
      }
      
      const data = await response.json();
      const updatedEntries = [data, ...entries];
      setEntries(updatedEntries);
      
      // Update cache with new entry
      cacheEntries(updatedEntries);
      
      return data;
    } catch (err: any) {
      console.error('Error creating mindfulness entry:', err);
      setError(err.message || 'Failed to create entry');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, getAuthHeaders, entries, cacheEntries]);
  
  // Update an existing entry
  const updateEntry = useCallback(async (id: string, updates: Partial<Omit<MindfulnessEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/mindfulness', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ id, ...updates }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update entry: ${response.statusText}`);
      }
      
      const data = await response.json();
      const updatedEntries = entries.map(entry => entry.id === id ? data : entry);
      setEntries(updatedEntries);
      
      // Update cache with modified entries
      cacheEntries(updatedEntries);
      
      return data;
    } catch (err: any) {
      console.error('Error updating mindfulness entry:', err);
      setError(err.message || 'Failed to update entry');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, getAuthHeaders, entries, cacheEntries]);
  
  // Delete an entry
  const deleteEntry = useCallback(async (id: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/mindfulness?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete entry: ${response.statusText}`);
      }
      
      const updatedEntries = entries.filter(entry => entry.id !== id);
      setEntries(updatedEntries);
      
      // Update cache after deletion
      cacheEntries(updatedEntries);
      
      return true;
    } catch (err: any) {
      console.error('Error deleting mindfulness entry:', err);
      setError(err.message || 'Failed to delete entry');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, getAuthHeaders, entries, cacheEntries]);
  
  // Migrate data from localStorage to Supabase
  const migrateFromLocalStorage = useCallback(async () => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Implement migration logic here
      // This would typically be a custom API endpoint
      const headers = await getAuthHeaders();
      const response = await fetch('/api/mindfulness/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to migrate data: ${response.statusText}`);
      }
      
      // Refresh entries after migration
      await fetchEntries(true); // Force refresh from API
      return true;
    } catch (err: any) {
      console.error('Error migrating data:', err);
      setError(err.message || 'Failed to migrate data');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchEntries, getAuthHeaders]);
  
  // Helper functions for specific entry types
  
  // Journal entries
  const createJournalEntry = useCallback((content: string, mood: string, isPrivate: boolean = true, tags?: string[]) => {
    return createEntry({
      type: 'journal',
      content,
      mood,
      is_private: isPrivate,
      tags
    });
  }, [createEntry]);
  
  // Gratitude entries
  const createGratitudeEntry = useCallback((content: string, category: string, isPrivate: boolean = true) => {
    return createEntry({
      type: 'gratitude',
      content,
      category,
      is_private: isPrivate
    });
  }, [createEntry]);
  
  // Strength entries
  const createStrengthEntry = useCallback((content: string, category?: string, isPrivate: boolean = true) => {
    return createEntry({
      type: 'strength',
      content,
      category,
      is_private: isPrivate
    });
  }, [createEntry]);
  
  // Auto-fetch entries on mount if enabled
  useEffect(() => {
    if (options.autoFetch !== false && user) {
      fetchEntries();
    }
  }, [fetchEntries, options.autoFetch, user]);
  
  // Return typed entries based on the requested type
  const getTypedEntries = useCallback(() => {
    if (options.type === 'journal') {
      return entries as JournalEntry[];
    } else if (options.type === 'gratitude') {
      return entries as GratitudeEntry[];
    } else if (options.type === 'strength') {
      return entries as StrengthEntry[];
    }
    return entries;
  }, [entries, options.type]);
  
  return {
    entries: getTypedEntries(),
    isLoading,
    error,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
    migrateFromLocalStorage,
    createJournalEntry,
    createGratitudeEntry,
    createStrengthEntry,
    lastFetchTimestamp
  };
} 