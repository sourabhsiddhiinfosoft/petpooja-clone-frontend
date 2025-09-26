import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie'; // Add this import

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://petpooja-clone-backend.vercel.app/api' || 'https://petpooja.siswebapp.com/api';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      // Read token from cookies
      headers.set('Access-Control-Allow-Origin', '*'); // Allow all origins
      headers.set("Access-Control-Allow-Credentials", "true"); // Allow credentials
      const token = Cookies.get('token'); // Use your cookie name
      if (token) headers.set('authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: [
    'Auth',
    'Dashboard',
    'Restaurants',
    'Owners',
    'Subscriptions',
    'Staff',
    'Menu',
    'Areas',
    'Tables',
    'Inventory',
    'Orders',
    'KOT',
  ],
  endpoints: () => ({}),
});


// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// export const baseApi = createApi({
//   reducerPath: 'api',
//   baseQuery: fetchBaseQuery({
//     baseUrl: API_BASE_URL,
//     prepareHeaders: (headers, { getState }) => {
//       const token = getState()?.auth?.token;
//       if (token) headers.set('authorization', `Bearer ${token}`);
//       headers.set('Content-Type', 'application/json');
//       return headers;
//     },
//     credentials: 'include',
//   }),
//   tagTypes: [
//     'Auth',
//     'Restaurants',
//     'Owners',
//     'Subscriptions',
//     'Staff',
//     'Menu',
//     'Areas',
//     'Tables',
//     'Inventory',
//     'Orders',
//     'KOT',
//   ],
//   endpoints: () => ({}),
// });


