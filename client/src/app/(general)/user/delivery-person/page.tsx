'use client';

import { DeliveryPersonRoute } from '@/routes/DeliveryPersonRoute/DeliveryPersonRoute';
import DeliveryPersonDashboard from '@/pages/private/DeliveryPerson/Dashboard';

export default function DeliveryPerson() {
  return (
    <DeliveryPersonRoute>
      <DeliveryPersonDashboard />
    </DeliveryPersonRoute>
  );
}
