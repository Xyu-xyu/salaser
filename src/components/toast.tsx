import { toast } from 'react-toastify';
//import i18next from 'i18next';

type ToastType = 'info' | 'success' | 'warning' | 'error' | 'default';
type ToastPosition = 
  | 'top-right'
  | 'top-center'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-center'
  | 'bottom-left';

interface ShowToastOptions {
  type?: ToastType;
  message?: string;
  position?: ToastPosition;
  autoClose?: number | false;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  theme?: 'light' | 'dark' | 'colored';
}

export const showToast = ({
  type = 'info',
  message = '',
  position = 'bottom-right',
  autoClose = 3000,
  hideProgressBar = false,
  closeOnClick = true,
  pauseOnHover = false,
  draggable = true,
  theme = 'light',
}: ShowToastOptions): void => {
  toast(message, {
    type,
    position,
    autoClose,
    hideProgressBar,
    closeOnClick,
    pauseOnHover,  // Fixed typo from your original code (was pauseOnHover)
    draggable,
    theme,
  });
};