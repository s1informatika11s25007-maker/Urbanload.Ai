import { useState } from 'react';
import { UserRole } from '../types/roles';

export function useRole() {
  const [role, setRole] = useState<UserRole>('rider');
  return { role, setRole };
}
