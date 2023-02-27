import { ReactNode } from 'react';
import { IGenericObject } from 'types';

interface IErrorFallback {
  error: IGenericObject<ReactNode>;
  resetErrorBoundary?: () => void;
}

export const ErrorFallback = ({ error }: IErrorFallback) => {
  return (
    <div>
      <div>
        <div>Something went wrong:</div>
        <div>{error.message}</div>
      </div>
    </div>
  );
};
