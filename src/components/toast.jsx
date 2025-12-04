import { toast } from 'react-toastify';
import i18next from 'i18next';


export const showToast = ({
  type = 'info',
  message = '',
  position = 'bottom-right',
  autoClose = 3000,
  hideProgressBar = false,
  closeOnClick = true,
  pauseOnHover = false,
  draggable = true,
  theme = 'colored',
})=> {
  toast(i18next.t(message), {
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