'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="container mx-auto min-w-0 max-w-2xl px-4 py-5 sm:px-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tighter text-theo-black sm:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Customize your learning experience and account preferences</p>
      </div>

      <div className="space-y-4">
        <Card className="py-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              Notification preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              [
                { id: 'email-notifications', title: 'Email notifications', desc: 'Receive updates about your progress via email', checked: true },
                { id: 'push-notifications', title: 'Push notifications', desc: 'Get notified about new content and reminders', checked: true },
                { id: 'marketing-emails', title: 'Marketing emails', desc: 'Receive information about new features and offers', checked: false },
              ] as const
            ).map(({ id, title, desc, checked }) => (
              <div key={id} className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Label htmlFor={id}>{title}</Label>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
                <Switch id={id} defaultChecked={checked} className="shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              Privacy & security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              [
                { id: 'profile-visibility', title: 'Public profile', desc: 'Allow others to view your learning progress', checked: false },
                { id: 'analytics', title: 'Usage analytics', desc: 'Help us improve by sharing anonymous usage data', checked: true },
              ] as const
            ).map(({ id, title, desc, checked }) => (
              <div key={id} className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Label htmlFor={id}>{title}</Label>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
                <Switch id={id} defaultChecked={checked} className="shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4" />
              Learning preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              [
                { id: 'dark-mode', title: 'Dark mode', desc: 'Switch to dark theme for better viewing', checked: false },
                { id: 'auto-play', title: 'Auto-play videos', desc: 'Automatically play video content', checked: true },
                { id: 'sound-effects', title: 'Sound effects', desc: 'Play sounds for interactions and achievements', checked: true },
              ] as const
            ).map(({ id, title, desc, checked }) => (
              <div key={id} className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Label htmlFor={id}>{title}</Label>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
                <Switch id={id} defaultChecked={checked} className="shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4" />
              Account actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full" size="sm">
              Download my data
            </Button>
            <Button variant="outline" className="w-full" size="sm">
              Reset password
            </Button>
            <Button variant="destructive" className="w-full" size="sm">
              Delete account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
