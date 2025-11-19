"use client";
import { useState } from "react";
import FileUploader from "./FileUploader";
import { useCreateTicketMutation } from "../store/api/ownerApi";
import toast from "react-hot-toast";
import { DocumentTextIcon, TagIcon, ExclamationTriangleIcon, ChatBubbleLeftIcon, PaperClipIcon, TicketIcon } from "@heroicons/react/24/outline";

export default function SupportForm({ user, isPublic }) {
  const [form, setForm] = useState({ subject: '', type: 'general', priority: 'medium', message: '', attachments: [] });
  const [errors, setErrors] = useState({});
  const [createTicket, { isLoading }] = useCreateTicketMutation();

  const validateForm = () => {
    const newErrors = {};
    if (!form.subject.trim()) newErrors.subject = "Subject is required.";
    if (!form.message.trim()) newErrors.message = "Message is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await createTicket({ ...form, restaurantId: user?.restaurantId }).unwrap();
      toast.success('Support ticket created successfully!');
      setForm({ subject: '', type: 'general', priority: 'medium', message: '', attachments: [] });
      setErrors({});
    } catch (error) {
      toast.error('Failed to create ticket. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <TicketIcon className="h-6 w-6 text-blue-600" />
            Create Support Ticket
          </h3>
          <p className="text-gray-600 mt-2">Describe your issue or request help from our support team.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4" />
              Subject
            </label>
            <input
              type="text"
              placeholder="Briefly describe your issue"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className={`border rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <TagIcon className="h-4 w-4" />
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="general">General Inquiry</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="billing">Billing Issue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-4 w-4" />
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <ChatBubbleLeftIcon className="h-4 w-4" />
              Message
            </label>
            <textarea
              placeholder="Provide detailed information about your issue or request..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`border rounded-lg px-4 py-3 w-full resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={5}
              required
            />
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <PaperClipIcon className="h-4 w-4" />
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition">
              <FileUploader onUpload={(files) => setForm({ ...form, attachments: files })} />
              <p className="text-sm text-gray-500 mt-2">Upload screenshots or files (max 5MB)</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                'Submit Ticket'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}