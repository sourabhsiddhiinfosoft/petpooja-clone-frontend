import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentBranch: null, // Selected branch object
  branches: [], // List of all branches (optional, for caching)
  isLoading: false,
  error: null,
  user:null
};

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {
    setCurrentBranch: (state, action) => {
      state.currentBranch = action.payload;
      state.error = null;
    },
    setBranches: (state, action) => {
      state.branches = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearBranch: (state) => {
      state.currentBranch = null;
    },
    setUser:(state,action)=>{
        state.user = action.payload
    }
  },
});

export const { setCurrentBranch, setBranches,setUser, setLoading, setError, clearBranch } = branchSlice.actions;
export default branchSlice.reducer;
