import { useEffect, useState } from 'react';
import { statsAPI } from '../services/api/stats';
import { UserStats } from '../types';
import { friendlyError } from '../utils/friendlyError';

export const useStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await statsAPI.getStats();
      setStats(data);
    } catch (e: unknown) {
      setError(friendlyError(e, "Couldn't load stats. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  };
};