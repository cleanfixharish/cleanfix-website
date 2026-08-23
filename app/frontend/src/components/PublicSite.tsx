import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { cleanfixApi } from '@/lib/cleanfixApi';
import { applyThemeVariables } from '@/lib/themeStudio';

type PublicSiteProps = {
  children: ReactNode;
  className?: string;
};

export default function PublicSite({ children, className }: PublicSiteProps) {
  useEffect(() => {
    cleanfixApi.getSiteSettings().then(applyThemeVariables).catch(() => undefined);
  }, []);

  return (
    <div className={cn('public-site flex min-h-screen w-full min-w-0 max-w-full flex-col overflow-x-clip', className)}>
      {children}
    </div>
  );
}
