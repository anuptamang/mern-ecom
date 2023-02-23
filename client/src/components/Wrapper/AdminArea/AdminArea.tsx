import { ChildrenProps } from 'types';

export const AdminArea = ({ children }: ChildrenProps) => {
  return (
    <div>
      <div>{children}</div>
    </div>
  );
};
