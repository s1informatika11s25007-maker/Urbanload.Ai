export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RIDER: {
    DASHBOARD: '/rider/dashboard',
    BOOKINGS: '/rider/bookings',
    NEW_BOOKING: '/rider/bookings/new',
    CONGESTION: '/rider/congestion',
  },
  CITY: {
    DASHBOARD: '/city/dashboard',
    LIVEMAP: '/city/livemap',
    ZONES: '/city/zones',
    CONGESTION: '/city/congestion',
  },
  DISHUB: {
    DASHBOARD: '/dishub/dashboard',
    SCAN: '/dishub/scan',
  },
} as const;
