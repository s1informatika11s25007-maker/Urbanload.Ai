import { useEffect, useState } from 'react';
import { fetchCongestionScores } from '../lib/api/congestion.js';

export function useCongestionScore() {
  const [scores, setScores] = useState([]);
  useEffect(() => {
    fetchCongestionScores().then((res) => {
      if (res.success) setScores(res.data);
    });
  }, []);
  return scores;
}
