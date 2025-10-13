"use client";
import { useEffect } from "react";
import { useMeQuery } from "../store/api/authApi";
import { useListBranchesForRestaurantQuery } from "../store/api/ownerApi";
import { useCurrentBranch } from "../store/hooks/useCurrentBranch";

export default function BranchSelector({ className = "" }) {
  const { data: meData } = useMeQuery();
  const restaurantId = meData?.restaurantId;

  const { data: branchesFromApi, isLoading: branchesLoading } = useListBranchesForRestaurantQuery(restaurantId, {skip: !restaurantId,});

  const { currentBranch, branches: branchesFromRedux,user, selectBranch, setAllBranches,setUserData,isLoading ,error} = useCurrentBranch();

//Populate Redux with User after API Fetch

useEffect(()=>{
if(meData && Object.keys(meData).length > 0){
    setUserData(meData);
}
},[meData,setUserData])

  // Populate Redux with branches after API fetch
  useEffect(() => {
    if (branchesFromApi && branchesFromApi.length > 0) {
      setAllBranches(branchesFromApi); // Store in Redux
    }
  }, [branchesFromApi, setAllBranches]);

  // Auto-select first branch if none selected and branches exist
  useEffect(() => {
    if (!currentBranch && branchesFromRedux && branchesFromRedux.length > 0) {
      selectBranch(branchesFromRedux[0]);
    }
  }, [branchesFromRedux, currentBranch, selectBranch]);

  if (branchesLoading || isLoading) {
    return (
      <div className={`px-3 py-2 text-sm ${className}`}>
        Loading branches...
      </div>
    );
  }

  // Use branchesFromRedux for the dropdown (cached in Redux)
  const branches = branchesFromRedux || branchesFromApi || [];

  return (
    <div className={`relative ${className}`}>
      {/* <label className="block text-sm font-medium text-gray-700 mb-1">Select Branch</label> */}
      <select
        value={currentBranch?._id || ""}
        onChange={(e) => {
          const selected = branches.find((branch) => branch._id === e.target.value);
          if (selected) {
            selectBranch(selected);
          }
        }}
        className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
        disabled={!branches || branches.length === 0}
      >
        <option value="">Select a branch</option>
        {branches.map((branch) => (
          <option key={branch._id} value={branch._id}>
            {branch.name} - {branch.address?.city} ({branch.status})
          </option>
        ))}
      </select>

      {/* {currentBranch && (
        <p className="text-xs text-gray-500 mt-1">
          Selected: {currentBranch.name} ({currentBranch.address?.city})
        </p>
      )} */}

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}


// "use client";
// import { useEffect } from "react";
// import { useCurrentBranch } from "../store/hooks/useCurrentBranch";
// import { useMeQuery } from "../store/api/authApi";
// import { useListBranchesForRestaurantQuery } from "../store/api/ownerApi";

// export default function BranchSelector({ className = "" }) {
//   const { data: userData } = useMeQuery();
//   const restaurantId = userData?.restaurantId;

//   const { data: branches, isLoading: branchesLoading } = useListBranchesForRestaurantQuery(restaurantId, {
//     skip: !restaurantId,
//   });

//   const { currentBranch, selectBranch, isLoading } = useCurrentBranch();

//   useEffect(() => {
//     // Auto-select first branch if none selected and branches exist
//     if (!currentBranch && branches && branches.length > 0) {
//       selectBranch(branches[0]);
//     }
//   }, [branches, currentBranch, selectBranch]);

//   if (branchesLoading || isLoading) {
//     return (
//       <div className={`px-3 py-2 text-sm ${className}`}>
//         Loading branches...
//       </div>
//     );
//   }

//   return (
//     <div className={`relative ${className}`}>
//       {/* <label className="block text-sm font-medium text-gray-700 mb-1">Select Branch</label> */}
//       <select
//         value={currentBranch?._id || ""}
//         onChange={(e) => {
//           const selected = branches.find((branch) => branch._id === e.target.value);
//           selectBranch(selected);
//         }}
//         className="border border-gray-300 rounded-lg px-2 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
//         disabled={!branches || branches.length === 0}
//       >
//         <option value="">Select a branch</option>
//         {branches?.map((branch) => (
//           <option key={branch._id} value={branch._id}>
//             {branch.name} - {branch.address?.city} ({branch.status})
//           </option>
//         ))}
//       </select>

//       {/* {currentBranch && (
//         <p className="text-xs text-gray-500 mt-1">
//           Selected: {currentBranch.name} ({currentBranch.address?.city})
//         </p>
//       )} */}
//     </div>
//   );
// }
