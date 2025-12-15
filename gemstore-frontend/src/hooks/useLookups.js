// hooks/useLookups.js
import { useState, useEffect } from 'react';
import { listingService } from '../api/listingService';

export function useLookups() {
  const [lookups, setLookups] = useState({
    gemstoneTypes: [],
    colors: [],
    colorQualities: [],
    clarityGrades: [],
    cuts: [],
    origins: [],
    treatments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        setLoading(true);
        const data = await listingService.getAllLookups();
        setLookups(data);
      } catch (err) {
        setError(err.message || 'Failed to load lookup data');
        console.error('Error fetching lookups:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLookups();
  }, []);

  return { lookups, loading, error };
}

export default useLookups;