"use client";
import { useState, useEffect } from "react";
import { useGetTicketQuery, useAddMessageMutation, useUpdateTicketMutation } from "../store/api/ownerApi";
import toast from "react-hot-toast";
import { PaperAirplaneIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export default function TicketThread({ ticketId, user }) {
  const { data: ticket, isLoading, error, refetch } = useGetTicketQuery(ticketId);
  const [addMessage, { isLoading: isReplying }] = useAddMessageMutation();
  const [updateTicket, { isLoading: isUpdating }] = useUpdateTicketMutation();
  const [message, setMessage] = useState('');
  const [newStatus, setNewStatus] = useState(ticket?.status || 'open');

  useEffect(() => {
    if (ticket?.status) setNewStatus(ticket.status);
  }, [ticket]);

  const handleReply = async () => {
    if (!message.trim()) return toast.error("Message cannot be empty");
    try {
      await addMessage({ id: ticketId, text: message, status: newStatus }).unwrap();
      toast.success("Reply sent successfully!");
      setMessage('');
      refetch();
    } catch (err) {
      toast.error("Failed to send reply. Please try again.");
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await updateTicket({ id: ticketId, status: newStatus }).unwrap();
      toast.success("Status updated successfully!");
      refetch();
    } catch (err) {
      toast.error("Failed to update status. Please try again.");
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading ticket...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error loading ticket.</div>;

  const statusColors = {
    open: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket?.subject}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[ticket?.status]}`}>
                {ticket?.status?.replace('_', ' ')}
              </span>
              <span className="text-sm text-gray-600">Type: {ticket?.type}</span>
              <span className="text-sm text-gray-600">Priority: {ticket?.priority}</span>
              {ticket?.assignee && <span className="text-sm text-gray-600">Assigned to: {ticket.assignee.name}</span>}
            </div>
            <p className="text-sm text-gray-500 mt-1">Created by {ticket?.createdBy?.name} on {new Date(ticket?.createdAt).toLocaleDateString()}</p>
          </div>
          {/* Status Update for Authorized Users */}
          {user?.role === 'admin' || user?.role === 'support' || (user?.role === 'owner' && ticket?.restaurantId === user.restaurantId) ? (
            <div className="flex items-center gap-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="open">Open</option>

                {user?.role === 'admin' && <option value="in_progress">In Progress</option>}
                <option value="resolved">Resolved</option>
                  {user?.role === 'admin' && <option value="closed">Closed</option>}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating}
                className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="p-6 max-h-96 overflow-y-auto space-y-4">
        {ticket?.messages?.map((msg, index) => (
          <div key={msg._id || index} className="flex gap-3">
            <div className="flex-shrink-0">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{msg.fromUserId?.name || 'Unknown'}</span>
                <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-gray-700 mt-1">{msg.text}</p>
              {msg.attachments?.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Attachments:</p>
                  {msg.attachments.map((att, i) => (
                    <a key={i} href={att} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                      File {i + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reply Form */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
            rows={3}
          />
          <button
            onClick={handleReply}
            disabled={isReplying || !message.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            {isReplying ? 'Sending...' : 'Send'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Attachments can be added here (placeholder).</p>
      </div>
    </div>
  );
}