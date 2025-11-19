import { useState } from "react";
import { useGetTicketsQuery, useUpdateTicketMutation } from "../store/api/ownerApi";
import Link from "next/link";

export default function TicketList({ filters, userId, isAdmin }) {
  const [localFilters, setLocalFilters] = useState(filters || {});
  const { data: tickets, refetch } = useGetTicketsQuery(localFilters);
  const [updateTicket] = useUpdateTicketMutation();

  const handleStatusChange = async (id, status) => {
    await updateTicket({ id, status });
    refetch();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Tickets</h3>
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })} className="border rounded px-3 py-2">
          <option value="">All Status</option><option value="open">Open</option><option value="resolved">Resolved</option>
        </select>
        <select onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })} className="border rounded px-3 py-2">
          <option value="">All Types</option><option value="bug">Bug</option><option value="feature">Feature</option>
        </select>
      </div>
      {/* List */}
<div className="space-y-2">
  {tickets?.map(ticket => (
    <div key={ticket._id} className="overflow-hidden relative text-left rounded-lg max-w-[290px] shadow-xl bg-white">
      <button className="absolute right-2.5 top-2.5 flex items-center justify-content-center px-4 py-2 bg-white text-black border-2 border-gray-300 text-base font-light w-[30px] h-[30px] rounded-md transition-all duration-300 hover:bg-red-600 hover:border-red-600 hover:text-white" type="button" onClick={() => {/* Add dismiss logic, e.g., remove ticket from state */}}>×</button>
      <div className="pt-5 px-4 pb-4">
        <div className="flex mx-auto bg-blue-100 flex-shrink-0 justify-center items-center w-12 h-12 rounded-full animate-pulse transition-all duration-500">
          {/* Ticket icon SVG - replace with your preferred icon */}
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-400 w-8 h-8">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="mt-3 text-center">
          <span className="text-blue-800 text-base font-semibold leading-6">{ticket.subject}</span>
          <p className="mt-2 text-gray-600 text-sm leading-5">Status: {ticket.status} | Type: {ticket.type}</p>
        </div>
        <div className="mx-4 my-3">
          <Link href={isAdmin ? `/admin/support/tickets/${ticket._id}` : `/owner/support/tickets/${ticket._id}`} className="inline-flex px-4 py-2 bg-blue-600 text-white text-base leading-6 font-medium justify-center w-full rounded-md shadow-sm hover:bg-blue-700 transition-all duration-300">View</Link>
          {isAdmin && (
            <div className="inline-flex mt-3 px-4 py-2 text-gray-900 text-base leading-6 font-medium justify-center w-full rounded-md border border-gray-300 bg-white shadow-sm">
              <select onChange={(e) => handleStatusChange(ticket._id, e.target.value)} className="w-full bg-transparent border-none outline-none">
                <option value={ticket.status}>{ticket.status}</option>
                <option value="resolved">Resolve</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  ))}
        {tickets?.length === 0 && <p>No tickets found.</p>}
      </div>
    </div>
  );
}