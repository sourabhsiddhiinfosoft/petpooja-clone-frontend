     // pages/admin/support.js
     "use client";
     import { useState } from "react";
      import DashboardLayout from '../../../components/DashboardLayout';
      import TicketList from '../../../components/TicketList';

     export default function AdminSupportPage() {
       const [filters, setFilters] = useState({});

       return (
         <DashboardLayout userType="admin">
           <div className="space-y-6">
             <div className="bg-white p-6 rounded-lg shadow">
               <h1 className="text-2xl font-bold">Support Inbox</h1>
               <TicketList filters={filters} isAdmin />
             </div>
           </div>
         </DashboardLayout>
       );
     }
     