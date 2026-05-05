import { create } from 'zustand';

interface IConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface IConfirmState {
  isOpen: boolean;
  options: IConfirmOptions;
  resolve: ((value: boolean) => void) | null;
  confirm: (options: IConfirmOptions) => Promise<boolean>;
  onConfirm: () => void;
  onCancel: () => void;
}

export const useConfirmStore = create<IConfirmState>((set, get) => ({
  isOpen: false,
  options: {
    title: 'Konfirmasi',
    message: 'Apakah Anda yakin?',
    confirmText: 'Ya',
    cancelText: 'Batal',
    variant: 'info'
  },
  resolve: null,
  confirm: (options) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        options: {
          confirmText: 'Ya',
          cancelText: 'Batal',
          variant: 'info',
          ...options
        },
        resolve
      });
    });
  },
  onConfirm: () => {
    const { resolve } = get();
    if (resolve) resolve(true);
    set({ isOpen: false, resolve: null });
  },
  onCancel: () => {
    const { resolve } = get();
    if (resolve) resolve(false);
    set({ isOpen: false, resolve: null });
  }
}));
