'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Megaphone } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
}

export default function NotificationsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/announcements')
      .then((res) => (res.ok ? res.json() : { announcements: [] }))
      .then((data) => setAnnouncements(Array.isArray(data.announcements) ? data.announcements : []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto min-w-0 max-w-2xl px-4 py-5 sm:px-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tighter text-theo-black sm:text-2xl">Notifications</h1>
        <p className="mt-1 text-sm text-gray-600">
          Announcements and updates from your programs
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-gray-500">Loading…</CardContent>
        </Card>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Bell className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <h3 className="mb-1 text-base font-medium text-gray-900">No notifications</h3>
            <p className="text-sm text-gray-600">
              You&apos;re all caught up. Announcements from your school or TheoLingua will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex gap-3 p-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-theo-yellow/20">
                  <Megaphone className="h-4 w-4 text-theo-black" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-theo-black">{item.title}</h3>
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {item.type}
                    </Badge>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-gray-600">{item.content}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
