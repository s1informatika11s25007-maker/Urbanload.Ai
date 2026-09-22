import { queryDb } from '../../config/db';

export async function checkGeofenceCoordinates(lat: number, lng: number) {
  return queryDb('SELECT * FROM check_geofence($1, $2)', [lat, lng]);
}
