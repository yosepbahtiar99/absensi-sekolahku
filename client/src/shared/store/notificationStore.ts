import { create } from 'zustand';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface INotificationState {
  isOpen: boolean;
  message: string;
  type: NotificationType;
  showNotification: (message: string, type?: NotificationType) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<INotificationState>((set) => ({
  isOpen: false,
  message: '',
  type: 'info',
  showNotification: (message, type = 'info') => {
    set({ isOpen: true, message, type });
    
    // Auto hide after 5 seconds if not an error (errors stay longer or need manual close)
    if (type !== 'error') {
      setTimeout(() => {
        set({ isOpen: false });
      }, 5000);
    }
  },
  hideNotification: () => set({ isOpen: false }),
}));
