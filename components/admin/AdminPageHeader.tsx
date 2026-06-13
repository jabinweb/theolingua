'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  badge,
  onBack,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="min-w-0">
            <h1 className="break-words text-xl font-bold tracking-tighter text-theo-black sm:text-2xl">
              {title}
            </h1>
            {(badge || description) && (
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                {badge && (
                  <Badge variant="secondary" className="w-fit shrink-0 text-[10px] font-semibold uppercase">
                    {badge}
                  </Badge>
                )}
                {description && <p className="text-sm text-gray-600">{description}</p>}
              </div>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
