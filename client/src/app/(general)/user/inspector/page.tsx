'use client';

import { InspectorRoute } from '@/routes/InspectorRoute/InspectorRoute';
import InspectorDashboard from '@/pages/private/Inspector/Dashboard';

export default function Inspector() {
  return (
    <InspectorRoute>
      <InspectorDashboard />
    </InspectorRoute>
  );
}
