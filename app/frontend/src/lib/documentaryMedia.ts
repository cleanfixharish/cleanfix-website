export const DOCUMENTARY_WIDTHS = [480, 768, 1200] as const;

export type DocumentaryId =
  | 'hero-managed-service'
  | 'handyman-shelf'
  | 'post-renovation-cleaning'
  | 'move-in-window-cleaning'
  | 'ac-maintenance'
  | 'quality-handover'
  | 'service-journey';

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
  'quality-handover': {
    id: 'quality-handover',
    folder: 'cleanfix-documentary',
    width: 1536,
    height: 1024,
    altEn: 'A homeowner and service coordinator reviewing the final quality check while the professional completes the last adjustment',
    altHe: 'בעלת בית ומתאם שירות עוברים על בדיקת האיכות הסופית בזמן שבעל המקצוע משלים התאמה אחרונה',
  },
  'service-journey': {
    id: 'service-journey',
    folder: 'cleanfix-documentary',
    width: 1536,
    height: 1024,
    altEn: 'A homeowner, local coordinator and professional reviewing a clear written service scope together',
    altHe: 'בעלת בית, מתאם מקומי ובעל מקצוע עוברים יחד על היקף שירות כתוב וברור',
  },
};

export const serviceDocumentaryMap: Record<string, DocumentaryId> = {
  cleaning: 'post-renovation-cleaning',
  handyman: 'handyman-shelf',
  'post-renovation': 'post-renovation-cleaning',
  move: 'move-in-window-cleaning',
  ac: 'ac-maintenance',
  windows: 'move-in-window-cleaning',
};

export type ServiceVisualKey = 'cleaning' | 'handyman' | 'post-renovation' | 'move' | 'ac' | 'windows' | 'gardening';

const serviceVisualKeywords: Array<[ServiceVisualKey, string[]]> = [
  ['post-renovation', ['post-renovation', 'renovation', 'construction dust', 'שיפוץ', 'אבק בנייה']],
  ['windows', ['window', 'glass', 'חלון', 'זכוכית']],
  ['ac', ['air condition', 'air-condition', 'ac cleaning', 'מזגן', 'מיזוג']],
  ['gardening', ['garden', 'gardening', 'landscape', 'balcony planting', 'גינה', 'גינון', 'עיצוב נוף']],
  ['handyman', ['handyman', 'mounting', 'small repair', 'installation', 'הנדימן', 'תלייה', 'תיקון קטן']],
  ['move', ['move-in', 'move out', 'move-out', 'moving', 'כניסה', 'יציאה', 'מעבר דירה']],
  ['cleaning', ['home cleaning', 'house cleaning', 'deep cleaning', 'cleaner', 'ניקיון בית', 'ניקיון יסודי']],
];

export function resolveServiceVisualKey(service: Record<string, unknown>): ServiceVisualKey | undefined {
  const text = [
    service.slug,
    service.category,
    service.name_en,
    service.name_he,
    service.description_en,
    service.description_he,
  ]
    .filter((value): value is string => typeof value === 'string')
    .join(' ')
    .toLocaleLowerCase();

  return serviceVisualKeywords.find(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))?.[0];
}

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
