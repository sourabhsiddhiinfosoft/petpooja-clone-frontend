import { get } from 'http';
import { baseApi } from './baseApi';

export const ownerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    //get restaurant details
    getRestaurantDetails: build.query({ query: (id) => ({ url: `/restaurants/${id}`, method: 'GET' }) }),
    updateRestaurantDetails: build.mutation({ query: ({ id, ...body }) => ({ url: `/restaurants/${id}`, method: 'PUT', body }) }),
    
    //Categories
    addCategory: build.mutation({ query: (body) => ({ url: '/categories', method: 'POST', body }), invalidatesTags: ['Menu'] }),
    getCategories: build.query({ query: () => ({ url: '/categories', method: 'GET' }), providesTags: ['Menu'] }),
    updateCategory: build.mutation({ query: ({ id, ...body }) => ({ url: `/categories/${id}`, method: 'PUT', body }), invalidatesTags: ['Menu'] }),
    deleteCategory: build.mutation({ query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }), invalidatesTags: ['Menu'] }),

    // Staff
    addStaff: build.mutation({ query: (body) => ({ url: '/staff', method: 'POST', body }), invalidatesTags: ['Staff'] }),
    getStaff: build.query({ query: () => ({ url: '/staff', method: 'GET' }), providesTags: ['Staff'] }),
    updateStaff: build.mutation({ query: ({ id, ...body }) => ({ url: `/staff/${id}`, method: 'PUT', body }), invalidatesTags: ['Staff'] }),
    deleteStaff: build.mutation({ query: (id) => ({ url: `/staff/${id}`, method: 'DELETE' }), invalidatesTags: ['Staff'] }),

    // Menu
    addMenuItem: build.mutation({ query: (body) => ({ url: '/menu', method: 'POST', body }), invalidatesTags: ['Menu'] }),
    getMenu: build.query({ query: () => ({ url: '/menu', method: 'GET' }), providesTags: ['Menu'] }),
    updateMenuItem: build.mutation({ query: ({ _id, ...body }) => ({ url: `/menu/${_id}`, method: 'PUT', body }), invalidatesTags: ['Menu'] }),
    deleteMenuItem: build.mutation({ query: (id) => ({ url: `/menu/${id}`, method: 'DELETE' }), invalidatesTags: ['Menu'] }),

    // Areas
    addArea: build.mutation({ query: (body) => ({ url: '/areas', method: 'POST', body }), invalidatesTags: ['Areas'] }),
    getAreas: build.query({ query: (id) => ({ url: `/areas/restaurant/${id}`, method: 'GET' }), providesTags: ['Areas'] }),
    updateArea: build.mutation({ query: ({ _id, ...body }) => ({ url: `/areas/${_id}`, method: 'PUT', body }), invalidatesTags: ['Areas'] }),
    deleteArea: build.mutation({ query: (id) => ({ url: `/areas/${id}`, method: 'DELETE' }), invalidatesTags: ['Areas'] }),

    // Tables
    addTable: build.mutation({ query: (body) => ({ url: '/tables', method: 'POST', body }), invalidatesTags: ['Tables'] }),
    getTables: build.query({ query: (id) => ({ url: `/tables/restaurant/${id}`, method: 'GET' }), providesTags: ['Tables'] }),
    updateTable: build.mutation({ query: ({ _id, ...body }) => ({ url: `/tables/${_id}`, method: 'PUT', body }), invalidatesTags: ['Tables'] }),
    deleteTable: build.mutation({ query: (id) => ({ url: `/tables/${id}`, method: 'DELETE' }), invalidatesTags: ['Tables'] }),

    // Inventory
    addInventory: build.mutation({ query: (body) => ({ url: '/inventory', method: 'POST', body }), invalidatesTags: ['Inventory'] }),
    getInventory: build.query({ query: () => ({ url: '/inventory', method: 'GET' }), providesTags: ['Inventory'] }),
    updateInventory: build.mutation({ query: ({ id, ...body }) => ({ url: `/inventory/${id}`, method: 'PUT', body }), invalidatesTags: ['Inventory'] }),
    deleteInventory: build.mutation({ query: (id) => ({ url: `/inventory/${id}`, method: 'DELETE' }), invalidatesTags: ['Inventory'] }),
  }),
});

export const {
  useGetRestaurantDetailsQuery,
  useUpdateRestaurantDetailsMutation,
  useAddCategoryMutation,
  useGetCategoriesQuery,
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
} = ownerApi;


