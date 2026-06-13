'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto min-w-0 max-w-2xl px-4 py-5 sm:px-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tighter text-theo-black sm:text-2xl">Notifications</h1>
        <p className="mt-1 text-sm text-gray-600">Stay updated with your learning progress and announcements</p>
      </div>

      <Card className="py-0">
        <CardContent className="py-10 text-center">
          <Bell className="mx-auto mb-3 h-10 w-10 text-gray-400" />
          <h3 className="mb-1 text-base font-medium text-gray-900">No notifications</h3>
          <p className="text-sm text-gray-600">
            You&apos;re all caught up. Notifications about your classes and progress will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
