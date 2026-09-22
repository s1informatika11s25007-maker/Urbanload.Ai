import { useState } from 'react';

export function useRole() {
  const [role, setRole] = useState('rider');
  return { role, setRole };
}
