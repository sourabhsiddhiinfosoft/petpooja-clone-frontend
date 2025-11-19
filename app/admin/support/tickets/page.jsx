     // pages/support/tickets.js
     "use client";
     import { useState } from "react";
     import DashboardLayout from "../../components/DashboardLayout";
     import TicketList from "../../components/TicketList";
     import { useCurrentBranch } from "../../store/hooks/useCurrentBranch";

     export default function MyTicketsPage() {
       const { user } = useCurrentBranch();
       const [filters, setFilters] = useState({});

       return (
         <DashboardLayout userType={user?.role}>
           <div className="space-y-6">
             <div className="bg-white p-6 rounded-lg shadow">
               <h1 className="text-2xl font-bold">My Support Tickets</h1>
               <TicketList filters={filters} userId={user.id} />
             </div>
           </div>
         </DashboardLayout>
       );
     }
     