import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

/**
 * Socket.IO Service for real-time notifications
 * Manages Socket.IO connection with JWT authentication
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Get Socket.IO server URL
   */
  getSocketURL() {
    // Extract base URL from API URL (remove /api suffix if present)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://petpooja-clone-backend.vercel.app/api' || 'https://petpooja.siswebapp.com/api';
    const baseUrl = apiUrl.replace('/api', '');
    return baseUrl;
  }

  /**
   * Initialize and connect to Socket.IO server
   * @param {Object} userData - User data containing restaurantId, branchId, role
   * @param {Function} onConnect - Callback when connected
   * @param {Function} onDisconnect - Callback when disconnected
   * @param {Function} onError - Callback when error occurs
   */
  connect(userData, onConnect, onDisconnect, onError) {
    // Don't connect if already connecting or connected
    if (this.isConnecting || (this.socket && this.socket.connected)) {
      return;
    }

    // Get authentication token
    const token = Cookies.get('token');
    
    if (!token) {
      console.warn('Socket.IO: No token found, cannot connect');
      if (onError) onError('No authentication token found');
      return;
    }

    if (!userData || !userData.restaurantId) {
      console.warn('Socket.IO: Missing user data, cannot connect');
      if (onError) onError('Missing user data');
      return;
    }

    this.isConnecting = true;
    const socketURL = this.getSocketURL();

    try {
      // Initialize Socket.IO connection with authentication
      this.socket = io(socketURL, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      // Connection event handlers
      this.socket.on('connect', () => {
        console.log('Socket.IO: Connected', this.socket.id);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Join rooms based on user data
        if (userData.restaurantId) {
          this.socket.emit('join_restaurant', { restaurantId: userData.restaurantId });
        }
        if (userData.branchId) {
          this.socket.emit('join_branch', { branchId: userData.branchId });
        }
        if (userData.role) {
          this.socket.emit('join_role', { role: userData.role });
        }

        if (onConnect) onConnect();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket.IO: Disconnected', reason);
        this.isConnecting = false;
        if (onDisconnect) onDisconnect(reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO: Connection error', error);
        this.isConnecting = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Socket.IO: Max reconnection attempts reached');
          this.disconnect();
        }
        
        if (onError) onError(error.message || 'Connection failed');
      });

      this.socket.on('error', (error) => {
        console.error('Socket.IO: Error', error);
        if (onError) onError(error.message || 'Socket error');
      });

    } catch (error) {
      console.error('Socket.IO: Failed to initialize', error);
      this.isConnecting = false;
      if (onError) onError(error.message || 'Failed to initialize connection');
    }
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      console.log('Socket.IO: Disconnected');
    }
  }

  /**
   * Subscribe to a notification event
   * @param {string} eventName - Event name (e.g., 'kot:created', 'kot:status_updated')
   * @param {Function} callback - Callback function to handle the event
   */
  on(eventName, callback) {
    if (this.socket && this.socket.connected) {
      this.socket.on(eventName, callback);
    } else {
      console.warn(`Socket.IO: Cannot subscribe to ${eventName}, socket not connected`);
    }
  }

  /**
   * Unsubscribe from a notification event
   * @param {string} eventName - Event name
   * @param {Function} callback - Optional callback to remove specific listener
   */
  off(eventName, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(eventName, callback);
      } else {
        this.socket.off(eventName);
      }
    }
  }

  /**
   * Emit an event to the server
   * @param {string} eventName - Event name
   * @param {any} data - Data to send
   */
  emit(eventName, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(eventName, data);
    } else {
      console.warn(`Socket.IO: Cannot emit ${eventName}, socket not connected`);
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected() {
    return this.socket && this.socket.connected;
  }

  /**
   * Get socket instance (for advanced usage)
   */
  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
