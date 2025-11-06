'use client';

import { PrivateRoute } from '@/routes/PrivateRoute';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PrivateRoute redirect="/login">{children}</PrivateRoute>;
}
