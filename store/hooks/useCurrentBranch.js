import { useSelector, useDispatch } from 'react-redux';
import { setCurrentBranch, setBranches, setUser } from '../slices/branchSlice';

export const useCurrentBranch = () => {
  const dispatch = useDispatch();
  const { currentBranch, branches, isLoading, error,user } = useSelector((state) => state.branch);

  const selectBranch = (branch) => {
    dispatch(setCurrentBranch(branch));
  };

  const setUserData = (userData)=>{
    dispatch(setUser(userData))
  }

  const setAllBranches = (branchesList) => {
    dispatch(setBranches(branchesList));
  };

  const clearBranch = () => {
    dispatch(setCurrentBranch(null));
  };

  return {
    currentBranch,
    branches, // Now includes the full list
    user,//userdata
    isLoading,
    error,
    selectBranch,
    setAllBranches, // Action to populate branches
    setUserData,
    clearBranch,
  };
};
