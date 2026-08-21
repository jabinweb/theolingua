'use client';

import { useCallback, useState } from 'react';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

type ConfirmOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

export function useConfirmDialog() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts);
      setResolver(() => resolve);
    });
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resolver?.(false);
      setResolver(null);
      setOptions(null);
    }
  };

  const handleConfirm = () => {
    resolver?.(true);
    setResolver(null);
    setOptions(null);
  };

  const dialog = (
    <ConfirmDialog
      open={!!options}
      onOpenChange={handleOpenChange}
      title={options?.title || ''}
      description={options?.description || ''}
      confirmLabel={options?.confirmLabel}
      cancelLabel={options?.cancelLabel}
      destructive={options?.destructive ?? true}
      onConfirm={handleConfirm}
    />
  );

  return { confirm, dialog };
}
