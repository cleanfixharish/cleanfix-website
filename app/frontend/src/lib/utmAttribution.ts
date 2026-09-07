const UTM_LIMITS = {
  utm_source: 100,
  utm_medium: 100,
  utm_campaign: 200,
} as const;

const SAFE_UTM_TOKEN = /^[A-Za-z0-9][A-Za-z0-9._~-]*$/;

export type UtmAttribution = Partial<Record<keyof typeof UTM_LIMITS, string>>;

export function readUtmAttribution(search: string): UtmAttribution {
  const params = new URLSearchParams(search);
  const attribution: UtmAttribution = {};

  (Object.keys(UTM_LIMITS) as Array<keyof typeof UTM_LIMITS>).forEach((key) => {
    const value = params.get(key)?.trim();
    if (value && value.length <= UTM_LIMITS[key] && SAFE_UTM_TOKEN.test(value)) {
      attribution[key] = key === 'utm_campaign' ? value : value.toLowerCase();
    }
  });

  return attribution;
}
