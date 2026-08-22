import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PublicSiteProps = {
  children: ReactNode;
  className?: string;
};

export default function PublicSite({ children, className }: PublicSiteProps) {
  return (
    <div className={cn('public-site flex min-h-screen w-full min-w-0 max-w-full flex-col overflow-x-clip', className)}>
      {children}
    </div>
  );
}
