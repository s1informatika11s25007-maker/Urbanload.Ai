import { useState } from 'react';
import { UserRole } from '@shared/types';

export function useRole() {
  const [role, setRole] = useState<UserRole>('rider');
  return { role, setRole };
}
