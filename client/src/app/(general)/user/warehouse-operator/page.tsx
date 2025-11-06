'use client';

import { WarehouseOperatorRoute } from '@/routes/WarehouseOperatorRoute/WarehouseOperatorRoute';
import WarehouseOperatorDashboard from '@/pages/private/WarehouseOperator/Dashboard';

export default function WarehouseOperator() {
  return (
    <WarehouseOperatorRoute>
      <WarehouseOperatorDashboard />
    </WarehouseOperatorRoute>
  );
}
