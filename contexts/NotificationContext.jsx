'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../lib/socketService';
import Cookies from 'js-cookie';

const NotificationContext = createContext(null);

/**
 * Notification Provider Component
 * Manages Socket.IO connection and real-time notifications
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const authUser = useSelector((state) => state.auth?.user);
  const branchUser = useSelector((state) => state.branch?.user);
  
  // Use refs to avoid stale closures
  const userRef = useRef(null);
  const notificationsHandlersRef = useRef([]);

  // Update user ref when auth or branch user changes
  useEffect(() => {
    const currentUser = branchUser || authUser;
    userRef.current = currentUser;
  }, [authUser, branchUser]);

  /**
   * Add notification handler
   */
  const addNotificationHandler = useCallback((handler) => {
    notificationsHandlersRef.current.push(handler);
    return () => {
      notificationsHandlersRef.current = notificationsHandlersRef.current.filter(h => h !== handler);
    };
  }, []);

  /**
   * Connect to Socket.IO
   */
  const connect = useCallback(() => {
    const user = userRef.current;
    const token = Cookies.get('token');
    
    if (!token || !user) {
      console.warn('NotificationProvider: Cannot connect - missing token or user');
      return;
    }

    const userData = {
      restaurantId: user.restaurantId || Cookies.get('restaurantId'),
      branchId: user.branchId,
      role: user.role || Cookies.get('role'),
    };

    if (!userData.restaurantId) {
      console.warn('NotificationProvider: Cannot connect - missing restaurantId');
      return;
    }

    socketService.connect(
      userData,
      // onConnect
      () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log('NotificationProvider: Connected to Socket.IO');
      },
      // onDisconnect
      (reason) => {
        setIsConnected(false);
        console.log('NotificationProvider: Disconnected from Socket.IO', reason);
      },
      // onError
      (error) => {
        setIsConnected(false);
        setConnectionError(error);
        console.error('NotificationProvider: Connection error', error);
      }
    );
  }, []);

  /**
   * Disconnect from Socket.IO
   */
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setNotifications([]);
  }, []);

  // Connect when component mounts or user data is available
  useEffect(() => {
    const user = branchUser || authUser;
    const token = Cookies.get('token');
    
    if (token && user && user.restaurantId) {
      connect();
      
      // Set up event listeners
      const handleKOTCreated = (data) => {
        console.log('NotificationProvider: KOT created', data);
        const notification = {
          id: `kot_created_${Date.now()}_${Math.random()}`,
          type: 'kot_created',
          title: 'New KOT Created',
          message: data.message || `New KOT #${data.kot?._id?.slice(-6)?.toUpperCase()} for Table ${data.kot?.tableNo}`,
          data: data,
          timestamp: new Date(),
        };
        
        setNotifications((prev) => [notification, ...prev.slice(0, 49)]); // Keep max 50 notifications
        
        // Call all registered handlers
        notificationsHandlersRef.current.forEach(handler => {
          try {
            handler(notification);
          } catch (error) {
            console.error('NotificationProvider: Error in notification handler', error);
          }
        });
      };

      const handleKOTStatusUpdated = (data) => {
        console.log('NotificationProvider: KOT status updated', data);
        const statusMessages = {
          pending: 'Pending',
          preparing: 'Preparing',
          ready: 'Ready',
        };
        
        const notification = {
          id: `kot_status_${Date.now()}_${Math.random()}`,
          type: 'kot_status_updated',
          title: 'KOT Status Updated',
          message: data.message || `KOT #${data.kot?._id?.slice(-6)?.toUpperCase()} is now ${statusMessages[data.newStatus] || data.newStatus}`,
          data: data,
          timestamp: new Date(),
        };
        
        setNotifications((prev) => [notification, ...prev.slice(0, 49)]); // Keep max 50 notifications
        
        // Call all registered handlers
        notificationsHandlersRef.current.forEach(handler => {
          try {
            handler(notification);
          } catch (error) {
            console.error('NotificationProvider: Error in notification handler', error);
          }
        });
      };

      // Subscribe to events - socketService.on handles connection check
      socketService.on('kot:created', handleKOTCreated);
      socketService.on('kot:status_updated', handleKOTStatusUpdated);

      // Cleanup on unmount or user change
      return () => {
        socketService.off('kot:created', handleKOTCreated);
        socketService.off('kot:status_updated', handleKOTStatusUpdated);
        disconnect();
      };
    }
  }, [connect, disconnect, authUser, branchUser]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Remove a specific notification
  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  }, []);

  const value = {
    notifications,
    isConnected,
    connectionError,
    connect,
    disconnect,
    clearNotifications,
    removeNotification,
    addNotificationHandler,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notification context
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

