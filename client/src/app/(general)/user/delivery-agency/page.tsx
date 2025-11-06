'use client';

import { DeliveryAgencyRoute } from '@/routes/DeliveryAgencyRoute/DeliveryAgencyRoute';
import DeliveryAgencyDashboard from '@/pages/private/DeliveryAgency/Dashboard';

export default function DeliveryAgency() {
  return (
    <DeliveryAgencyRoute>
      <DeliveryAgencyDashboard />
    </DeliveryAgencyRoute>
  );
}
