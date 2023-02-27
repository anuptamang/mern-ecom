import { ReactNode } from 'react';

export interface IGenericObject<T = unknown> { [key: string]: T };
export interface IChildren {
  children: ReactNode;
}