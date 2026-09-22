import { createClient } from './client.js';

export function subscribeToZoneChanges(onUpdate) {
  const supabase = createClient();
  const channel = supabase
    .channel('zones_realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'zones' }, onUpdate)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToPhoneVerification(phoneNumber, onVerified) {
  const supabase = createClient();
  const cleanPhone = phoneNumber ? phoneNumber.trim() : '';
  const channelName = `profile_otp_${cleanPhone.replace(/[^a-zA-Z0-9]/g, '') || 'global'}`;

  const profileChannel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
      },
      (payload) => {
        if (
          payload.new &&
          payload.new.phone_verified === true &&
          (!cleanPhone || payload.new.phone_number === cleanPhone)
        ) {
          onVerified(payload.new);
        }
      }
    )
    .on(
      'broadcast',
      { event: 'otp_verified' },
      (payload) => {
        if (!cleanPhone || payload.payload?.phoneNumber === cleanPhone) {
          onVerified(payload.payload);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(profileChannel);
  };
}
