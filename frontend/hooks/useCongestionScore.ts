import { useEffect, useState } from 'react';
import { fetchCongestionScores } from '../lib/api/congestion';

export function useCongestionScore() {
  const [scores, setScores] = useState<any[]>([]);

  useEffect(() => {
    fetchCongestionScores().then((res) => {
      if (res.success) setScores(res.data);
    });
  }, []);

  return scores;
}
