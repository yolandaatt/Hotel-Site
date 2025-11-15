import toast from "react-hot-toast";

const baseOptions = {
  duration: 3000,
  position: "top-center" as const,
};

export const notifySuccess = (message: string) =>
  toast.success(message, baseOptions);

export const notifyError = (message: string) =>
  toast.error(message, baseOptions);

export const notifyInfo = (message: string) =>
  toast(message, baseOptions);

export const notifyLoading = (message: string) =>
  toast.loading(message, { ...baseOptions, duration: 1500 });
