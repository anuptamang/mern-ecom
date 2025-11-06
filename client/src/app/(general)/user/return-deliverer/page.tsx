'use client';

import { ReturnDelivererRoute } from '@/routes/ReturnDelivererRoute/ReturnDelivererRoute';
import ReturnDelivererDashboard from '@/pages/private/ReturnDeliverer/Dashboard';

export default function ReturnDeliverer() {
  return (
    <ReturnDelivererRoute>
      <ReturnDelivererDashboard />
    </ReturnDelivererRoute>
  );
}
