import { baseApi } from './baseApi';

export const staffApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
  getKOT: build.query({ query: (_id) => ({ url: `/kots/kot/${_id}`, method: 'GET' }), providesTags: ['KOT'] }),
    getKOTList: build.query({ query: (q) => ({ url: `/kots?${q}`, method: 'GET' }), providesTags: ['KOT'] }),
    createKOT: build.mutation({ query: (body) => ({ url: '/kots', method: 'POST', body }), invalidatesTags: ['KOT'] }),
    updateKOTStatus: build.mutation({ query: ({ id, ...body }) => ({ url: `/kot/${id}/status`, method: 'PUT', body }), invalidatesTags: (r,e,{id})=>[{ type:'KOT', id }] }),
    getRunningTables: build.query({query: (q) =>  ({ url: `/tables/running-tables-by-staff/${q}`, method: 'GET' }),providesTags: ['Tables'],}),
}),
overrideExisting:true
});

export const {
  useGetKOTQuery,
  useGetKOTListQuery,
  useCreateKOTMutation,
  useUpdateKOTStatusMutation,
  useGetRunningTablesQuery
} = staffApi;


