import { get } from 'http';
import { baseApi } from './baseApi';

export const ownerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    //dashboard
    getOwnerDashboard: build.query({ query: () => ({ url: '/owner/dashboard', method: 'GET' }) }),
    getOwnerDashboardSummary: build.query({ query: () => ({ url: '/owner/dashboard/summary', method: 'GET' }) }),
    getOwnerRevenue: build.query({ query: (params) => ({ url: '/owner/dashboard/revenue', method: 'GET', params }) }),
    getOwnerCustomerStats: build.query({ query: (params) => ({ url: '/owner/dashboard/customers', method: 'GET', params }) }),
    getOwnerRecentOrders: build.query({ query: () => ({ url: '/owner/dashboard/recent-orders', method: 'GET' }) }),

    //get restaurant details
    getRestaurantDetails: build.query({ query: (id) => ({ url: `/restaurants/${id}`, method: 'GET' }) }),
    updateRestaurantDetails: build.mutation({ query: ({ id, ...body }) => ({ url: `/restaurants/${id}`, method: 'PUT', body }) }),

    //Categories
    addCategory: build.mutation({ query: (body) => ({ url: '/categories', method: 'POST', body }), invalidatesTags: ['Menu'], }),
    getCategories: build.query({ query: (qury) => ({ url: `/categories/${qury || ""}`, method: 'GET' }), providesTags: ['Menu'], }),
    updateCategory: build.mutation({ query: ({ _id, ...body }) => ({ url: `/categories/${_id}`, method: 'PUT', body }), invalidatesTags: ['Menu'], }),
    deleteCategory: build.mutation({ query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }), invalidatesTags: ['Menu'], }),

    // Staff
    addStaff: build.mutation({ query: (body) => ({ url: '/staff', method: 'POST', body }), invalidatesTags: ['Staff'] }),
    getStaff: build.query({ query: () => ({ url: '/staff', method: 'GET' }), providesTags: ['Staff'] }),
    updateStaff: build.mutation({ query: ({ id, ...body }) => ({ url: `/staff/${id}`, method: 'PUT', body }), invalidatesTags: ['Staff'] }),
    deleteStaff: build.mutation({ query: (id) => ({ url: `/staff/${id}`, method: 'DELETE' }), invalidatesTags: ['Staff'] }),

    // Menu
    addMenuItem: build.mutation({ query: (body) => ({ url: '/menu', method: 'POST', body }), invalidatesTags: ['Menu'] }),
    getMenu: build.query({ query: (q) => { return `/menu?${q}`; }, providesTags: ['Menu'], }),
    updateMenuItem: build.mutation({ query: ({ _id, ...body }) => ({ url: `/menu/${_id}`, method: 'PUT', body }), invalidatesTags: ['Menu'] }),
    deleteMenuItem: build.mutation({ query: (id) => ({ url: `/menu/${id}`, method: 'DELETE' }), invalidatesTags: ['Menu'] }),

    // Areas
    addArea: build.mutation({ query: (body) => ({ url: '/areas', method: 'POST', body }), invalidatesTags: ['Areas'], }),
    getAreas: build.query({ query: (q) => ({ url: `/areas/restaurant/${q}`, method: 'GET' }), providesTags: ['Areas'], }),
    getAreasWithTables: build.query({ query: (q) => ({ url: `/areas/areas-with-tables?${q}`, method: 'GET' }), providesTags: ['Areas'], }),
    updateArea: build.mutation({ query: ({ _id, ...body }) => ({ url: `/areas/${_id}`, method: 'PUT', body }), invalidatesTags: ['Areas'], }),
    deleteArea: build.mutation({ query: (_id) => ({ url: `/areas/${_id}`, method: 'DELETE' }), invalidatesTags: ['Areas'], }),

    // Tables
    addTable: build.mutation({ query: (body) => ({ url: '/tables', method: 'POST', body }), invalidatesTags: ['Tables'], }),
    getTables: build.query({ query: (q) => ({ url: `/tables/restaurant/${q}`, method: 'GET', }), providesTags: ['Tables'], }),
    updateTable: build.mutation({ query: ({ _id, ...body }) => ({ url: `/tables/${_id}`, method: 'PUT', body }), invalidatesTags: ['Tables'], }),
    deleteTable: build.mutation({ query: (_id) => ({ url: `/tables/${_id}`, method: 'DELETE' }), invalidatesTags: ['Tables'], }),

    // Inventory
    addInventory: build.mutation({ query: (body) => ({ url: '/inventory', method: 'POST', body }), invalidatesTags: ['Inventory'] }),
    getInventory: build.query({ query: () => ({ url: '/inventory', method: 'GET' }), providesTags: ['Inventory'] }),
    updateInventory: build.mutation({ query: ({ id, ...body }) => ({ url: `/inventory/${id}`, method: 'PUT', body }), invalidatesTags: ['Inventory'] }),
    deleteInventory: build.mutation({ query: (id) => ({ url: `/inventory/${id}`, method: 'DELETE' }), invalidatesTags: ['Inventory'] }),

    // Branches
    createBranch: build.mutation({ query: ({ restaurantId, ...body }) => ({ url: `/branches/restaurants/${restaurantId}/branches`, method: 'POST', body, }), invalidatesTags: ['Branches'], }),
    listBranchesForRestaurant: build.query({ query: (restaurantId) => ({ url: `/branches/restaurants/${restaurantId}/branches`, method: 'GET', }), providesTags: ['Branches'], }),
    getBranch: build.query({ query: (id) => ({ url: `/branches/${id}`, method: 'GET', }), providesTags: ['Branches'], }),
    updateBranch: build.mutation({ query: ({ _id, ...body }) => ({ url: `/branches/${_id}`, method: 'PUT', body, }), invalidatesTags: ['Branches'], }),
    deleteBranch: build.mutation({ query: (_id) => ({ url: `/branches/${_id}`, method: 'DELETE', }), invalidatesTags: ['Branches'], }),

    //orders
    createOrder: build.mutation({ query: (body) => ({ url: '/orders', method: 'POST', body }), invalidatesTags: ['Orders', 'KOT'] }),
    getOrders: build.query({ query: () => ({ url: '/orders', method: 'GET' }), providesTags: ['Orders'] }),
    getOrderById: build.query({ query: (id) => ({ url: `/orders/${_id}`, method: 'GET' }), providesTags: (r, e, _id) => [{ type: 'Orders', _id }] }),
    updateOrderStatus: build.mutation({ query: ({ id, ...body }) => ({ url: `/orders/${id}/status`, method: 'PUT', body }), invalidatesTags: (r, e, { id }) => [{ type: 'Orders', id }] }),
    addPayment: build.mutation({ query: ({ id, ...body }) => ({ url: `/orders/${id}/payments`, method: 'POST', body }), invalidatesTags: (r, e, { id }) => [{ type: 'Orders', id }] }),
    updateOrder: build.mutation({ query: ({ orderId, body }) => ({ url: `/orders/${orderId}`, method: 'PUT', body, }), invalidatesTags: ['Orders', 'Tables', 'KOTs'], }),

    //KOT
    getKOT: build.query({ query: () => ({ url: '/kot', method: 'GET' }), providesTags: ['KOT'] }),
    updateKOTStatus: build.mutation({ query: ({ kotId, ...body }) => ({ url: `/kots/${kotId}/status`, method: 'PUT', body, }), invalidatesTags: ['KOTs'], }),
    getKOTList: build.query({ query: (q) => ({ url: `/kots?${q}`, method: 'GET' }), providesTags: ['KOT'] }),

  }),


});

export const {
  useGetOwnerDashboardQuery,
  useGetOwnerDashboardSummaryQuery,
  useGetOwnerRevenueQuery,
  useGetOwnerCustomerStatsQuery,
  useGetOwnerRecentOrdersQuery,
  useGetRestaurantDetailsQuery,
  useUpdateRestaurantDetailsMutation,
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAddStaffMutation,
  useGetStaffQuery,
  useUpdateStaffMutation,
  useDeleteStaffMutation,
  useAddMenuItemMutation,
  useGetMenuQuery,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useAddAreaMutation,
  useGetAreasQuery,
  useGetAreasWithTablesQuery,
  useUpdateAreaMutation,
  useDeleteAreaMutation,
  useAddTableMutation,
  useGetTablesQuery,
  useUpdateTableMutation,
  useDeleteTableMutation,
  useAddInventoryMutation,
  useGetInventoryQuery,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
  useCreateBranchMutation,
  useListBranchesForRestaurantQuery,
  useGetBranchQuery,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useGetOrdersQuery,
  useCreateOrderMutation,
  useGetOrderByIdQuery,
  useGetKOTQuery,
  useUpdateOrderStatusMutation,
  useAddPaymentMutation,
  useUpdateKOTStatusMutation,
  useGetKOTListQuery,
} = ownerApi;


