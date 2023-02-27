export interface IStatus {
  loading: boolean;
  success: boolean;
  error: {
    message: string | undefined
  };
}