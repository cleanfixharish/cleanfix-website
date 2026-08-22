import { documentaryAssets, documentaryFallback, documentarySrcSet, type DocumentaryId } from '@/lib/documentaryMedia';
import { cn } from '@/lib/utils';

type DocumentaryImageProps = {
  id: DocumentaryId;
  lang?: 'en' | 'he';
  alt?: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
};

export default function DocumentaryImage({
  id,
  lang = 'en',
  alt,
  priority = false,
  className,
  sizes = '(max-width: 640px) 100vw, (max-width: 1100px) 90vw, 720px',
}: DocumentaryImageProps) {
  const asset = documentaryAssets[id];
  const resolvedAlt = alt ?? (lang === 'he' ? asset.altHe : asset.altEn);

  return (
    <picture>
      <source type="image/webp" srcSet={documentarySrcSet(id, 'webp')} sizes={sizes} />
      <source type="image/jpeg" srcSet={documentarySrcSet(id, 'jpg')} sizes={sizes} />
      <img
        src={documentaryFallback(id)}
        alt={resolvedAlt}
        width={asset.width}
        height={asset.height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className={cn('h-full w-full object-cover', className)}
      />
    </picture>
  );
}
