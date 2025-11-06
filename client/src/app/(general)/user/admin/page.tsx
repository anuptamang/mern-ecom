'use client';

import { AdminRoute } from '@/routes/AdminRoute/AdminRoute';
import AdminDashboard from '@/pages/private/Admin/Dashboard';

export default function Admin() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}
