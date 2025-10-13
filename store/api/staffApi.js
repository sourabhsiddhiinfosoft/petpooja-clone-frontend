import { baseApi } from './baseApi';

export const staffApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation({ query: (body) => ({ url: '/orders', method: 'POST', body }), invalidatesTags: ['Orders', 'KOT'] }),
    getOrders: build.query({ query: () => ({ url: '/orders', method: 'GET' }), providesTags: ['Orders'] }),
    getOrderById: build.query({ query: (id) => ({ url: `/orders/${id}`, method: 'GET' }), providesTags: (r,e,id)=>[{ type:'Orders', id }] }),
    updateOrderStatus: build.mutation({ query: ({ id, ...body }) => ({ url: `/orders/${id}/status`, method: 'PUT', body }), invalidatesTags: (r,e,{id})=>[{ type:'Orders', id }] }),
    addPayment: build.mutation({ query: ({ id, ...body }) => ({ url: `/orders/${id}/payments`, method: 'POST', body }), invalidatesTags: (r,e,{id})=>[{ type:'Orders', id }] }),
    getKOT: build.query({ query: () => ({ url: '/kot', method: 'GET' }), providesTags: ['KOT'] }),
    getKOTList: build.query({ query: (q) => ({ url: `/kots?${q}`, method: 'GET' }), providesTags: ['KOT'] }),
    createKOT: build.mutation({ query: (body) => ({ url: '/kot', method: 'POST', body }), invalidatesTags: ['KOT'] }),
    updateKOTStatus: build.mutation({ query: ({ id, ...body }) => ({ url: `/kot/${id}/status`, method: 'PUT', body }), invalidatesTags: (r,e,{id})=>[{ type:'KOT', id }] }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useAddPaymentMutation,
  useGetKOTQuery,
  useGetKOTListQuery,
  useCreateKOTMutation,
  useUpdateKOTStatusMutation,
} = staffApi;


