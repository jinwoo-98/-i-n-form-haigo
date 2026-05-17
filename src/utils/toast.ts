import { toast } from "sonner";

export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    duration: 5000, // Tăng lên 5 giây để người dùng kịp đọc
    style: {
      fontWeight: '700',
      fontSize: '16px',
    },
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};