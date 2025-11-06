'use client';

import { AdminRoute } from '@/routes/AdminRoute/AdminRoute';
import AdminSettings from '@/pages/private/Admin/Settings';

export default function AdminSettingsPage() {
  return (
    <AdminRoute>
      <AdminSettings />
    </AdminRoute>
  );
}
