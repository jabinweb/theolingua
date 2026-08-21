'use client';

/**
 * Auth is already gated by app/dashboard/layout.tsx.
 * Keep this layout as a pass-through to avoid a second authenticating spinner.
 */
export default function ProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
