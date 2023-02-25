import { AdminArea, AdminContent, AdminSidebar } from 'components';
import { ReactElement } from 'react';
import { Outlet } from 'react-router';

type Iprops = {
  children?: ReactElement;
};

const Admin = ({ children }: Iprops) => {
  return (
    <>
      <AdminArea>
        <AdminSidebar />
        <AdminContent>{children ? children : <Outlet />}</AdminContent>
      </AdminArea>
    </>
  );
};

export { Admin };
