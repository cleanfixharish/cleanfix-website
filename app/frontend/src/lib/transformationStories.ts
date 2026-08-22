export type TransformationStory = {
  id: string;
  category: 'gardening' | 'cleaning' | 'handyman' | 'windows' | 'ac' | 'moving';
  image: string;
  titleEn: string;
  titleHe: string;
  summaryEn: string;
  summaryHe: string;
  scale: 'small' | 'medium' | 'large';
  water?: boolean;
};

const image = (slug: string) => `/assets/images/transformations/${slug}-1536.webp`;

export const gardeningStories: TransformationStory[] = [
  { id: 'garden-balcony', category: 'gardening', image: image('garden-balcony'), titleEn: 'A balcony that finally feels alive', titleHe: 'מרפסת שסוף סוף מרגישה חיה', summaryEn: 'A compact planting plan, useful seating, herbs, irrigation and quiet evening light.', summaryHe: 'תכנון צמחייה קומפקטי, ישיבה שימושית, תבלינים, השקיה ותאורת ערב שקטה.', scale: 'small' },
  { id: 'garden-entrance', category: 'gardening', image: image('garden-entrance'), titleEn: 'A welcoming entrance garden', titleHe: 'גינת כניסה שמקבלת את פניכם', summaryEn: 'A practical path with Mediterranean planting, an olive tree and low-voltage lighting.', summaryHe: 'שביל שימושי עם צמחייה ים-תיכונית, עץ זית ותאורה במתח נמוך.', scale: 'small' },
  { id: 'garden-courtyard-waterfall', category: 'gardening', image: image('garden-courtyard-waterfall'), titleEn: 'A private courtyard waterfall', titleHe: 'מפל קטן בחצר פרטית', summaryEn: 'A buildable recirculating stone cascade designed for a very small shaded courtyard.', summaryHe: 'מפל אבן מחזורי ובר-ביצוע, שתוכנן לחצר מוצלת וקטנה מאוד.', scale: 'small', water: true },
  { id: 'garden-family', category: 'gardening', image: image('garden-family'), titleEn: 'A garden made for family life', titleHe: 'גינה שנבנתה לחיי המשפחה', summaryEn: 'Safe lawn, shade, citrus, drainage, irrigation and planting with room to grow.', summaryHe: 'מדשאה בטוחה, צל, הדרים, ניקוז, השקיה וצמחייה עם מקום להתפתח.', scale: 'medium' },
  { id: 'garden-sensory-stream', category: 'gardening', image: image('garden-sensory-stream'), titleEn: 'A sensory path and gentle stream', titleHe: 'שביל חושים ופלג מים עדין', summaryEn: 'Aromatic plants, raised herbs, a shaded swing and a realistic bubbling water rill.', summaryHe: 'צמחי תבלין וריח, ערוגות מוגבהות, נדנדה מוצלת ופלג מים מבעבע.', scale: 'medium', water: true },
  { id: 'garden-rooftop-water', category: 'gardening', image: image('garden-rooftop-water'), titleEn: 'A rooftop retreat above the city', titleHe: 'מפלט ירוק על הגג', summaryEn: 'Wind-aware planting, shade, drainage access and a compact recirculating water feature.', summaryHe: 'צמחייה מותאמת לרוח, הצללה, גישה לניקוז ומים מחזוריים קומפקטיים.', scale: 'medium', water: true },
  { id: 'garden-estate', category: 'gardening', image: image('garden-estate'), titleEn: 'A complete Mediterranean landscape', titleHe: 'נוף ים-תיכוני שלם', summaryEn: 'Terraces, native planting, dining, water and carefully layered architectural light.', summaryHe: 'טרסות, צמחייה מקומית, אזור אירוח, מים ותאורה אדריכלית בשכבות.', scale: 'large', water: true },
  { id: 'garden-hillside-cascade', category: 'gardening', image: image('garden-hillside-cascade'), titleEn: 'A hillside garden with a natural cascade', titleHe: 'גינת מדרון עם מפל טבעי', summaryEn: 'A premium but technically grounded plan for stone, water, gathering and year-round texture.', summaryHe: 'תכנון יוקרתי אך מעשי של אבן, מים, אירוח ומרקם לכל עונות השנה.', scale: 'large', water: true },
];

export const serviceStories: TransformationStory[] = [
  { id: 'deep-cleaning-kitchen', category: 'cleaning', image: image('deep-cleaning-kitchen'), titleEn: 'Deep home cleaning', titleHe: 'ניקיון בית יסודי', summaryEn: 'The same room, reset carefully without pretending that cleaning is renovation.', summaryHe: 'אותו חדר, מאופס בקפידה בלי להציג ניקיון כאילו היה שיפוץ.', scale: 'medium' },
  { id: 'post-renovation-living', category: 'cleaning', image: image('post-renovation-living'), titleEn: 'Post-renovation handover', titleHe: 'מסירה אחרי שיפוץ', summaryEn: 'Construction dust and protection removed so the finished home is genuinely ready.', summaryHe: 'הסרת אבק בנייה והגנות כדי שהבית המשופץ יהיה מוכן באמת.', scale: 'large' },
  { id: 'handyman-wall', category: 'handyman', image: image('handyman-wall'), titleEn: 'One precise handyman visit', titleHe: 'ביקור הנדימן אחד ומדויק', summaryEn: 'Mounting, alignment, cable management and wall repair under one written scope.', summaryHe: 'תלייה, יישור, הסתרת כבלים ותיקוני קיר במסגרת עבודה כתובה אחת.', scale: 'small' },
  { id: 'window-cleaning', category: 'windows', image: image('window-cleaning'), titleEn: 'The view returns', titleHe: 'הנוף חוזר', summaryEn: 'Glass, frames and construction residue handled as a documented cleaning scope.', summaryHe: 'זכוכית, מסגרות ושאריות בנייה במסגרת ניקיון מתועדת.', scale: 'medium' },
  { id: 'ac-cleaning', category: 'ac', image: image('ac-cleaning'), titleEn: 'Documented AC cleaning', titleHe: 'ניקוי מזגן מתועד', summaryEn: 'A clear before condition, careful service and evidence of the completed scope.', summaryHe: 'מצב התחלתי ברור, טיפול זהיר ותיעוד של העבודה שהושלמה.', scale: 'small' },
  { id: 'move-in-setup', category: 'moving', image: image('move-in-setup'), titleEn: 'From boxes to home', titleHe: 'מארגזים לבית', summaryEn: 'A coordinated move-in setup with one scope, one contact and a calm finish.', summaryHe: 'הקמת בית מתואמת עם היקף אחד, איש קשר אחד וסיום רגוע.', scale: 'medium' },
];

export const serviceThumbnailMap: Record<string, string> = {
  handyman: image('handyman-wall'),
  'post-renovation': image('post-renovation-living'),
  'post-renovation-cleaning': image('post-renovation-living'),
  move: image('move-in-setup'),
  'move-in': image('move-in-setup'),
  'move-in-cleaning': image('move-in-setup'),
  ac: image('ac-cleaning'),
  'ac-cleaning': image('ac-cleaning'),
  windows: image('window-cleaning'),
  'window-cleaning': image('window-cleaning'),
  cleaning: image('deep-cleaning-kitchen'),
  gardening: image('garden-sensory-stream'),
  garden: image('garden-sensory-stream'),
  landscaping: image('garden-hillside-cascade'),
};
