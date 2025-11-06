'use client';

import { BuyerOnlyRoute } from '@/routes/BuyerOnlyRoute/BuyerOnlyRoute';
import ChatsDashboard from '@/pages/private/Chats/Dashboard';

export default function UserChats() {
  return (
    <BuyerOnlyRoute>
      <ChatsDashboard />
    </BuyerOnlyRoute>
  );
}
