import { toast } from 'react-toastify';
import { sourceText } from './sourceText.js';

const STORAGE_KEYS = ['medinson.desktop.language', 'medinson:language', 'language'];
const TOAST_METHODS = ['success', 'error', 'info', 'warning', 'warn'];

const currentLanguage = () => {
  if (typeof window === 'undefined') return 'uz';
  for (const key of STORAGE_KEYS) {
    const value = window.localStorage?.getItem(key);
    if (value && ['uz', 'ru', 'en', 'tg'].includes(value)) return value;
  }
  const htmlLanguage = document?.documentElement?.lang;
  if (htmlLanguage && htmlLanguage.toLowerCase().startsWith('ru')) return 'ru';
  if (htmlLanguage && htmlLanguage.toLowerCase().startsWith('en')) return 'en';
  return 'uz';
};

const translateToastMessage = (message) => {
  /* MEDINSON_1136_RICH_TOAST_TRANSLATOR */
  const lang = currentLanguage();
  if (message == null) return message;
  if (typeof message === 'string' || typeof message === 'number') {
    return sourceText(String(message), lang);
  }
  if (message instanceof Error) {
    return sourceText(message.message || String(message), lang);
  }
  if (typeof message === 'object' && typeof message.message === 'string') {
    return sourceText(message.message, lang);
  }
  return message;
};

for (const method of TOAST_METHODS) {
  const original = toast?.[method];
  if (typeof original !== 'function' || original.__medinsonI18nWrapped) continue;
  const wrapped = function medinsonToastI18n(message, ...args) {
    return original.call(this, translateToastMessage(message), ...args);
  };
  Object.defineProperty(wrapped, '__medinsonI18nWrapped', { value: true });
  toast[method] = wrapped;
}

export { translateToastMessage };
