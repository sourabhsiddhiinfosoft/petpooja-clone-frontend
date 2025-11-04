# Socket.IO Frontend Implementation - Real-time KOT Notifications

## Overview
This document describes the frontend implementation of real-time notifications for KOT (Kitchen Order Ticket) management using Socket.IO. The implementation enables seamless communication between Waiter → Chef → Owner.

## Implementation Summary

### ✅ Files Created

1. **`lib/socketService.js`**
   - Socket.IO client service singleton
   - Handles connection, authentication (JWT), and room management
   - Provides methods for subscribing to events (`on`), unsubscribing (`off`), and emitting events

2. **`contexts/NotificationContext.jsx`**
   - React Context for managing Socket.IO connections
   - Provides `NotificationProvider` component and `useNotifications` hook
   - Handles KOT created and KOT status updated notifications
   - Manages notification state and handler registration

3. **`components/NotificationToast.jsx`**
   - Toast notification UI component
   - Automatically displays toast notifications for Socket.IO events
   - Includes connection status indicator (development mode only)

### ✅ Files Modified

1. **`store/Providers.jsx`**
   - Added `NotificationProvider` wrapper
   - Integrated `NotificationToast` and `NotificationConnectionStatus` components

2. **`app/chef/runningKOTs/page.jsx`**
   - Integrated real-time notifications
   - Auto-refreshes KOT list when new KOTs are created
   - Uses `useNotifications` hook

3. **`app/waiter/runningKOTs/page.jsx`**
   - Integrated real-time notifications
   - Auto-refreshes KOT list when KOT status changes
   - Uses `useNotifications` hook

4. **`app/owner/orders/page.jsx`**
   - Integrated real-time notifications
   - Auto-refreshes orders list when KOT status changes or new KOTs are created
   - Uses `useNotifications` hook

### ✅ Dependencies Added

- `socket.io-client` (installed via npm)

## How It Works

### 1. Connection Flow

1. When a user logs in, the `NotificationProvider` component mounts
2. It reads the JWT token from cookies and user data from Redux store
3. Socket.IO connection is established with JWT authentication
4. Client joins rooms based on:
   - `restaurant:{restaurantId}`
   - `branch:{branchId}` (if available)
   - `role:{role}` (chef, waiter, owner)

### 2. Notification Events

#### KOT Created (`kot:created`)
- **Sent To**: All chefs in the restaurant/branch
- **Action**: Toast notification appears, KOT list auto-refreshes

#### KOT Status Updated (`kot:status_updated`)
- **Sent To**: All waiters and owners in the restaurant/branch
- **Action**: Toast notification appears, KOT/orders list auto-refreshes

### 3. Toast Notifications

- **KOT Created**: Blue-themed toast with warning icon
- **KOT Status Updated**:
  - **Ready**: Green-themed toast with checkmark icon (6 seconds)
  - **Preparing**: Yellow-themed toast with clock icon (4 seconds)
  - **Pending**: Gray-themed toast (3 seconds)

## Usage Examples

### Using the Notification Hook in Components

```jsx
import { useNotifications } from '../../../contexts/NotificationContext';

function MyComponent() {
  const { addNotificationHandler, isConnected } = useNotifications();
  const { refetch } = useGetKOTListQuery();

  useEffect(() => {
    const unsubscribe = addNotificationHandler((notification) => {
      if (notification.type === 'kot_created') {
        refetch(); // Auto-refresh data
      }
    });

    return unsubscribe; // Cleanup
  }, [addNotificationHandler, refetch]);

  return (
    <div>
      {isConnected ? 'Connected' : 'Disconnected'}
      {/* Your component JSX */}
    </div>
  );
}
```

## Configuration

### Environment Variables

The Socket.IO server URL is automatically derived from:
```javascript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://petpooja-clone-backend.vercel.app/api';
const socketUrl = apiUrl.replace('/api', ''); // Removes /api suffix
```

### Authentication

- JWT token is read from cookies (set during login)
- Token is sent in Socket.IO connection auth object
- Backend validates token and authenticates connection

## Testing

1. **Login as Chef**:
   - Navigate to `/chef/runningKOTs`
   - Create a new order (as waiter/owner) → Chef should receive toast notification

2. **Login as Waiter**:
   - Navigate to `/waiter/runningKOTs`
   - Chef updates KOT status → Waiter should receive toast notification

3. **Login as Owner**:
   - Navigate to `/owner/orders`
   - KOT status changes → Owner should receive toast notification

## Troubleshooting

### Connection Issues

1. **Check browser console** for Socket.IO connection errors
2. **Verify JWT token** is set in cookies
3. **Check backend Socket.IO server** is running and accessible
4. **Verify CORS settings** on backend allow WebSocket connections

### Notifications Not Appearing

1. **Check user role** - Notifications are role-based
2. **Verify restaurant/branch IDs** match between frontend and backend
3. **Check notification handler** is registered in component
4. **Verify Socket.IO connection status** (green indicator in dev mode)

## Architecture

```
App Layout
  └── Providers (Redux)
       └── NotificationProvider
            ├── Socket.IO Connection
            │   └── JWT Authentication
            │        └── Room Management
            │             ├── restaurant:{id}
            │             ├── branch:{id}
            │             └── role:{role}
            ├── NotificationToast (UI)
            └── Component Pages
                 ├── Chef KOT Page
                 ├── Waiter KOT Page
                 └── Owner Orders Page
```

## Features

✅ Real-time KOT creation notifications to chefs  
✅ Real-time KOT status update notifications to waiters and owners  
✅ Role-based notification targeting  
✅ Restaurant/branch scoped notifications  
✅ JWT-based authentication  
✅ Auto-refresh of data when notifications arrive  
✅ Beautiful toast UI with appropriate icons and colors  
✅ Connection status indicator (dev mode)  
✅ Automatic reconnection handling  
✅ Proper cleanup on component unmount  

## Next Steps (Optional Enhancements)

- [ ] Notification sound alerts
- [ ] Notification history panel
- [ ] Browser push notifications
- [ ] Notification preferences/settings
- [ ] Real-time order updates (not just KOTs)
- [ ] Multiple notification types (order status, payments, etc.)

