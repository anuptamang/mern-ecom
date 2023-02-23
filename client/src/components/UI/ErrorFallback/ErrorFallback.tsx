import { ReactNode } from 'react';
import { GenericObject } from 'types';

interface IErrorFallback {
  error: GenericObject<ReactNode>;
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
