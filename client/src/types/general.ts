import { ChangeEvent, ReactNode } from 'react';

export type GenericObject<T = unknown> = { [key: string]: T };
export type Nullable<T> = T | null;
export interface GenericList<T> {
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
  data: T[];
}

export type FunctionWithParam<T> = (p: T) => void;
export type FunctionWithNoParam = () => void;
export type FunctionWithNoParamButReturn<R> = () => R;
export type FunctionWithParamAndReturn<P, R> = (p: P) => R;

export interface ApiResponseType<T> {
  message: string;
  success: boolean;
  status: boolean;
  data: T;
}

export interface ApiReturn<T> extends Promise<ApiResponseType<Nullable<T>>> { }

export interface ErrorObject {
  error: string;
}

export interface ChildrenProps {
  children: ReactNode;
}
export type eProps = ChangeEvent<HTMLInputElement>;

export type SetDataProps = (prev: [] | {} | string | number) => void;
export type SetLoadingProps = (p: boolean | number) => void;

export interface IDispatch {
  type: string;
  payload?: string[] | [] | {}[] | boolean | number | unknown;
}