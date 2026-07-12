const WHATSAPP_NUMBER = '972508275505'; // CleanFixHarish WhatsApp number

export function getWhatsAppLink(message?: string): string {
  const baseUrl = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}

export function getWhatsAppQuoteMessage(service?: string, lang: 'en' | 'he' = 'en'): string {
  if (lang === 'he') {
    return service
      ? `שלום, אני מעוניין/ת בהצעת מחיר עבור ${service} בחריש.`
      : 'שלום, אני מעוניין/ת בהצעת מחיר לשירותי בית בחריש.';
  }
  return service
    ? `Hi, I'd like a quote for ${service} in Harish.`
    : "Hi, I'd like a quote for home services in Harish.";
}

export function getWhatsAppServiceLink(serviceName: string, lang: 'en' | 'he' = 'en'): string {
  return getWhatsAppLink(getWhatsAppQuoteMessage(serviceName, lang));
}