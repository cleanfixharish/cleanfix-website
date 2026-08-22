export const DOCUMENTARY_WIDTHS = [480, 768, 1200] as const;

export type DocumentaryId =
  | 'hero-managed-service'
  | 'handyman-shelf'
  | 'post-renovation-cleaning'
  | 'move-in-window-cleaning'
  | 'ac-maintenance';

type DocumentaryAsset = {
  id: DocumentaryId;
  folder: 'cleanfix-mobile-v3' | 'cleanfix-documentary';
  width: number;
  height: number;
  altEn: string;
  altHe: string;
};

export const documentaryAssets: Record<DocumentaryId, DocumentaryAsset> = {
  'hero-managed-service': {
    id: 'hero-managed-service',
    folder: 'cleanfix-documentary',
    width: 1672,
    height: 941,
    altEn: 'Local coordinator reviewing a home-service request with a Harish homeowner',
    altHe: 'מתאם מקומי עובר עם בעל בית בחריש על בקשת שירות',
  },
  'handyman-shelf': {
    id: 'handyman-shelf',
    folder: 'cleanfix-mobile-v3',
    width: 1536,
    height: 1024,
    altEn: 'Handyman mounting a wooden shelf in a lived-in apartment while the homeowner looks on',
    altHe: 'הנדימן מתקין מדף עץ בדירה מגוורת ובעלת הבית משגיחה',
  },
  'post-renovation-cleaning': {
    id: 'post-renovation-cleaning',
    folder: 'cleanfix-mobile-v3',
    width: 1536,
    height: 1024,
    altEn: 'Cleaner wiping a kitchen counter after renovation dust has been removed from the apartment',
    altHe: 'מנקה מנגבת משטח מטבח אחרי פינוי אבק שיפוץ מהדירה',
  },
  'move-in-window-cleaning': {
    id: 'move-in-window-cleaning',
    folder: 'cleanfix-mobile-v3',
    width: 1536,
    height: 1024,
    altEn: 'Two cleaners preparing a bright apartment, including window glass and supplies for a move-in reset',
    altHe: 'שני מנקים מכינים דירה מוארת, כולל ניקוי חלון וציוד לאיפוס כניסה',
  },
  'ac-maintenance': {
    id: 'ac-maintenance',
    folder: 'cleanfix-mobile-v3',
    width: 1536,
    height: 1024,
    altEn: 'Technician cleaning a wall-mounted air conditioner in a living room while the homeowner stands nearby',
    altHe: 'טכנאי מנקה מזגן עילי בסלון ובעלת הבית עומדת בקרבת מקום',
  },
};

export const serviceDocumentaryMap: Record<string, DocumentaryId> = {
  handyman: 'handyman-shelf',
  'post-renovation': 'post-renovation-cleaning',
  move: 'move-in-window-cleaning',
  ac: 'ac-maintenance',
  windows: 'move-in-window-cleaning',
};

export function documentarySrc(id: DocumentaryId, width: number, ext: 'webp' | 'jpg') {
  const asset = documentaryAssets[id];
  return `/assets/images/${asset.folder}/web/${id}-${width}.${ext}`;
}

export function documentarySrcSet(id: DocumentaryId, ext: 'webp' | 'jpg') {
  return DOCUMENTARY_WIDTHS.map((width) => `${documentarySrc(id, width, ext)} ${width}w`).join(', ');
}

export function documentaryFallback(id: DocumentaryId) {
  return documentarySrc(id, 1200, 'jpg');
}
