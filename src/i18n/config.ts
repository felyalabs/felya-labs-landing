export const locales = ['en', 'de', 'ru', 'pt', 'fr', 'es', 'it', 'ky', 'id', 'ko', 'ja', 'zh-cn', 'zh-tw'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';
export const languageStorageKey = 'felya-labs-language';

export const browserLocaleAliases: Record<string, Locale> = {
  zh: 'zh-cn',
  'zh-cn': 'zh-cn',
  'zh-hans': 'zh-cn',
  'zh-sg': 'zh-cn',
  'zh-tw': 'zh-tw',
  'zh-hant': 'zh-tw',
  'zh-hk': 'zh-tw',
  'zh-mo': 'zh-tw'
};

export const localeDetails: Record<Locale, {
  nativeName: string;
  shortLabel: string;
  htmlLang: string;
  ogLocale: string;
}> = {
  en: { nativeName: 'English', shortLabel: 'EN', htmlLang: 'en', ogLocale: 'en_US' },
  de: { nativeName: 'Deutsch', shortLabel: 'DE', htmlLang: 'de', ogLocale: 'de_DE' },
  ru: { nativeName: 'Русский', shortLabel: 'RU', htmlLang: 'ru', ogLocale: 'ru_RU' },
  pt: { nativeName: 'Português', shortLabel: 'PT', htmlLang: 'pt', ogLocale: 'pt_PT' },
  fr: { nativeName: 'Français', shortLabel: 'FR', htmlLang: 'fr', ogLocale: 'fr_FR' },
  es: { nativeName: 'Español', shortLabel: 'ES', htmlLang: 'es', ogLocale: 'es_ES' },
  it: { nativeName: 'Italiano', shortLabel: 'IT', htmlLang: 'it', ogLocale: 'it_IT' },
  ky: { nativeName: 'Кыргызча', shortLabel: 'KY', htmlLang: 'ky', ogLocale: 'ky_KG' },
  id: { nativeName: 'Bahasa Indonesia', shortLabel: 'ID', htmlLang: 'id', ogLocale: 'id_ID' },
  ko: { nativeName: '한국어', shortLabel: 'KO', htmlLang: 'ko', ogLocale: 'ko_KR' },
  ja: { nativeName: '日本語', shortLabel: 'JA', htmlLang: 'ja', ogLocale: 'ja_JP' },
  'zh-cn': { nativeName: '简体中文', shortLabel: '简中', htmlLang: 'zh-CN', ogLocale: 'zh_CN' },
  'zh-tw': { nativeName: '繁體中文', shortLabel: '繁中', htmlLang: 'zh-TW', ogLocale: 'zh_TW' }
};

export const localePath = (locale: Locale) => `/${locale}/`;

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}

export function resolveLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}
