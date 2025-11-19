'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { NotificationProvider } from '../contexts/NotificationContext';
import { NotificationToast, NotificationConnectionStatus } from '../components/NotificationToast';
import { ThemeProvider } from 'next-themes';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
      <NotificationProvider>
        {children}
        <NotificationToast />
        <NotificationConnectionStatus />
      </NotificationProvider>
      {/* </ThemeProvider> */}
    </Provider>
  );
}


