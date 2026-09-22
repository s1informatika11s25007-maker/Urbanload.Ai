export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          user_id: string;
          zone_id: string;
          truck_dimension: Json;
          time_window_start: string;
          time_window_end: string;
          status: string;
          created_at: string;
        }
      }
      zones: {
        Row: {
          id: string;
          name: string;
          max_truck_capacity: number;
          status: string;
        }
      }
    }
  }
}
