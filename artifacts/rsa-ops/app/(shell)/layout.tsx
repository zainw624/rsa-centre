import LayoutShell from '@/components/LayoutShell';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return <LayoutShell>{children}</LayoutShell>;
}
