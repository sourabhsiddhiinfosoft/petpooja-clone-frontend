'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { NotificationProvider } from '../contexts/NotificationContext';
import { NotificationToast, NotificationConnectionStatus } from '../components/NotificationToast';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <NotificationProvider>
        {children}
        <NotificationToast />
        <NotificationConnectionStatus />
      </NotificationProvider>
    </Provider>
  );
}


