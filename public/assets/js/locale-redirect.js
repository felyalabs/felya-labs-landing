const config = document.querySelector('[data-locale-entry]');
const parseData = (value, fallback) => {
  try { return JSON.parse(value); } catch { return fallback; }
};
const locales = parseData(config?.dataset.locales, ['en']);
const aliases = parseData(config?.dataset.localeAliases, {});
const storageKey = config?.dataset.storageKey || 'felya-labs-language';

const normalize = (value = '') => {
  const candidate = value.toLowerCase();
  if (aliases[candidate]) return aliases[candidate];
  const exact = locales.find((locale) => candidate === locale);
  if (exact) return exact;
  const base = candidate.split('-')[0];
  return aliases[base] || locales.find((locale) => base === locale) || null;
};

let locale = null;
try { locale = normalize(window.localStorage.getItem(storageKey)); } catch {}
locale ||= navigator.languages?.map(normalize).find(Boolean) || normalize(navigator.language) || 'en';
window.location.replace(`/${locale}/`);
