import { TError } from "redux/action/auth";

export interface IStatus {
  loading: boolean;
  success: boolean;
  error: TError;
}