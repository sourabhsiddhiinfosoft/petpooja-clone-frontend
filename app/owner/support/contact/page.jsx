// pages/support/contact.js
"use client";

import SupportForm from "../../../../components/SupportForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 ">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Contact Support</h1>
        <SupportForm isPublic />
      </div>
    </div>
  );
}