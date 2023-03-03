import { ReactNode } from 'react';
import { IGenericObject } from 'types';

interface IErrorFallback {
  error: IGenericObject<ReactNode>;
  resetErrorBoundary?: () => void;
}

/**
 * Component - Error Boundary Fallback
 * @props {error} IErrorFallback
 * @returns {JSX.Element}   Error Boundary Fallback Component
 */

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
