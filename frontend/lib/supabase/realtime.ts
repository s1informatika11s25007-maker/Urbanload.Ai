import { createClient } from './client';

export function subscribeToZoneChanges(onUpdate: (payload: any) => void) {
  const supabase = createClient();
  const channel = supabase
    .channel('zones_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'zones' }, onUpdate)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
