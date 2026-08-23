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
    cleanfixApi.getSiteSettings().then((settings) => {
      applyThemeVariables(settings);
      document.documentElement.dataset.effects = settings.effects_mode || 'reduced';
    }).catch(() => {
      document.documentElement.dataset.effects = 'reduced';
    });

    return () => {
      delete document.documentElement.dataset.effects;
    };
  }, []);

  return (
    <div className={cn('public-site flex min-h-screen w-full min-w-0 max-w-full flex-col overflow-x-clip', className)}>
      {children}
    </div>
  );
}
