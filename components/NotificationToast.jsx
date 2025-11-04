'use client';

import React, { useEffect, useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import toast from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

/**
 * NotificationToast Component
 * Automatically displays toast notifications for Socket.IO events
 */
export function NotificationToast() {
  const { notifications, addNotificationHandler } = useNotifications();
  const [displayedNotifications, setDisplayedNotifications] = useState(new Set());

  useEffect(() => {
    // Register notification handler
    const unsubscribe = addNotificationHandler((notification) => {
      // Check if notification was already displayed
      if (displayedNotifications.has(notification.id)) {
        return;
      }

      // Mark as displayed
      setDisplayedNotifications(prev => new Set([...prev, notification.id]));

      // Determine icon and styling based on notification type
      let icon, iconColor, bgColor, duration;

      if (notification.type === 'kot_created') {
        icon = <ExclamationTriangleIcon className="w-6 h-6" />;
        iconColor = 'text-blue-500';
        bgColor = 'bg-blue-50 border-blue-200';
        duration = 5000; // 5 seconds
      } else if (notification.type === 'kot_status_updated') {
        const status = notification.data?.newStatus;
        if (status === 'ready') {
          icon = <CheckCircleIcon className="w-6 h-6" />;
          iconColor = 'text-green-500';
          bgColor = 'bg-green-50 border-green-200';
          duration = 6000; // 6 seconds for ready status
        } else if (status === 'preparing') {
          icon = <ClockIcon className="w-6 h-6" />;
          iconColor = 'text-yellow-500';
          bgColor = 'bg-yellow-50 border-yellow-200';
          duration = 4000;
        } else {
          icon = <ClockIcon className="w-6 h-6" />;
          iconColor = 'text-gray-500';
          bgColor = 'bg-gray-50 border-gray-200';
          duration = 3000;
        }
      } else {
        icon = <ExclamationTriangleIcon className="w-6 h-6" />;
        iconColor = 'text-gray-500';
        bgColor = 'bg-gray-50 border-gray-200';
        duration = 3000;
      }

      // Show toast notification
      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full ${bgColor} border shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className={`flex-shrink-0 ${iconColor}`}>
                  {icon}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {notification.message}
                  </p>
                  {notification.data?.kot && (
                    <div className="mt-2 text-xs text-gray-400">
                      Table: {notification.data.kot.tableNo || 'N/A'} • 
                      Items: {notification.data.kot.items?.length || 0}
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className={`${bgColor} rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    onClick={() => {
                      toast.dismiss(t.id);
                    }}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ),
        {
          duration: duration,
          position: 'top-right',
        }
      );
    });

    // Cleanup
    return unsubscribe;
  }, [addNotificationHandler, displayedNotifications]);

  // Clean up displayed notifications set periodically to prevent memory leaks
  useEffect(() => {
    const interval = setInterval(() => {
      // Keep only recent notification IDs (last 100)
      setDisplayedNotifications(prev => {
        const arr = Array.from(prev);
        return new Set(arr.slice(0, 100));
      });
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  // This component doesn't render anything visible
  return null;
}

/**
 * NotificationConnectionStatus Component
 * Shows connection status (optional, for debugging)
 */
export function NotificationConnectionStatus() {
  const { isConnected, connectionError } = useNotifications();

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
        isConnected 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isConnected ? '🔌 Connected' : '🔴 Disconnected'}
        {connectionError && ` - ${connectionError}`}
      </div>
    </div>
  );
}

