"use client";
import { useState } from "react";

export default function LoadingButton({ 
  children, 
  onClick, 
  loadingText = "Processing...", 
  className = "", 
  ...props 
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    setLoading(true);
    try {
      await onClick(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`relative flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-70 ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="absolute left-3 h-5 w-5 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z"
          ></path>
        </svg>
      )}
      {loading ? <span className="ml-5">{loadingText}</span> : children}
    </button>
  );
}
