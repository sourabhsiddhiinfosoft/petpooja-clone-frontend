import { create } from 'domain';
import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminDashboardSummary: build.query({
      query: () => ({ url: '/admin/dashboard/summary', method: 'GET' }),
      providesTags: ['Dashboard'],
    }),
    getRestaurants: build.query({
      query: () => ({ url: '/restaurants', method: 'GET' }),
      providesTags: ['Restaurants'],
    }),
    getRestaurantById: build.query({
      query: (_id) => ({ url: `/restaurants/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'Restaurants', id }],
    }),
    createRestaurant: build.mutation({
      query: (body) => ({ url: '/restaurants', method: 'POST', body }),
      invalidatesTags: ['Restaurants', 'Owners'],
    }),
    updateRestaurant: build.mutation({
      query: ({ _id, ...body }) =>{ console.log(_id); return({ url: `/restaurants/${_id}`, method: 'PUT', body })},
      invalidatesTags: (result, error, { _id }) => [{ type: 'Restaurants', _id }],
    }),
    deleteRestaurant: build.mutation({
      query: (_id) => ({ url: `/restaurants/${_id}`, method: 'DELETE' }),
      invalidatesTags: ['Restaurants'],
    }),
    getOwners: build.query({
      query: () => ({ url: '/owners', method: 'GET' }),
      providesTags: ['Owners'],
    }),
    createOwner: build.mutation({
      query: (body) => ({ url: '/owners', method: 'POST', body }),
      invalidatesTags: ['Owners'],
    }),
    deleteOwner: build.mutation({
      query: (_id) => ({ url: `/owners/remove/${_id}`, method: 'DELETE' }),
      invalidatesTags: ['Owners'],
    }),
    updateOwner: build.mutation({
      query: ({ _id, ...body }) => ({ url: `/owners/${_id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { _id }) => [{ type: 'Owners', _id }],
    }),
    assignOwnerToRestaurant: build.mutation({
      query: ({ restaurantId, ownerId }) => ({
        url: `/owners/assign`,
        method: 'POST',
        body: { ownerId,restaurantId },
      }),
      invalidatesTags: ['Restaurants', 'Owners'],
    }),
    createSubscription: build.mutation({
      query: (body) => ({ url: '/subscriptions', method: 'POST', body }),
      invalidatesTags: ['Subscriptions'],
    }),
    getSubscriptions: build.query({
      query: () => ({ url: '/subscriptions', method: 'GET' }),
      providesTags: ['Subscriptions'],
    }),
    updateSubscription: build.mutation({
      query: ({ id, ...body }) => ({ url: `/subscriptions/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Subscriptions', id }],
    }),
    deleteSubscription: build.mutation({
      query: (id) => ({ url: `/subscriptions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Subscriptions'],
    }),
    getRevenue: build.query({
      query: ({ type, date, year }) => {
        let url = `/admin/dashboard/revenue?type=${type}`;
        if (date) url += `&date=${date}`;
        if (year) url += `&year=${year}`;
        return { url, method: 'GET' };
      },
    }),
    getCustomersStats: build.query({
      query: ({ type, year }) => {
        let url = `/admin/dashboard/customers?type=${type}`;
        if (year) url += `&year=${year}`;
        return { url, method: 'GET' };
      },
    }),
  }),
});

export const {
  useGetAdminDashboardSummaryQuery,
  useGetRestaurantsQuery,
  useGetRestaurantByIdQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useDeleteRestaurantMutation,
  useGetOwnersQuery,
  useCreateOwnerMutation,
  useDeleteOwnerMutation,
  useUpdateOwnerMutation,
  useAssignOwnerToRestaurantMutation,
  useCreateSubscriptionMutation,
  useGetSubscriptionsQuery,
  useUpdateSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useGetRevenueQuery,
  useGetCustomersStatsQuery,
} = adminApi;


