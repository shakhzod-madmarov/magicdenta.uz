import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import uz from './dictionaries/uz.js';
import ru from './dictionaries/ru.js';
import en from './dictionaries/en.js';
import tg from './dictionaries/tg.js';

export const DEFAULT_LANGUAGE = 'uz';
export const LANGUAGE_STORAGE_KEY = 'medinson.desktop.language';

export const supportedLanguages = [
  { code: 'uz', label: 'O‘zbek' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
  { code: 'tg', label: 'Тоҷикӣ' },
];

const dictionaries = { uz, ru, en, tg };

const medinson1126LicenseActivationCopy = {
  uz: {
    license: {
      activation: {
        title: 'Litsenziyani faollashtirish',
        description: 'Ushbu kompyuterni klinika hisobiga ulang. Litsenziya kaliti, login va parol aktivatsiya varaqasida beriladi.',
        licenseKey: 'Litsenziya kaliti',
        phone: 'Telefon',
        email: 'Elektron pochta',
        login: 'Login (telefon yoki email)',
        password: 'Parol',
        dentist: 'Shifokor',
        clinic: 'Klinika',
        activate: 'Faollashtirish',
        forgot: 'Parol esdan chiqdimi?',
        passwordHelp: 'Parol aktivatsiya varaqasida bir marta beriladi. Agar parol topilmasa, admin panelda parolni tiklang yoki litsenziya kalitini almashtiring.',
        lockedTitle: 'Litsenziyani qayta tekshirish kerak.',
        lockedDefault: 'Litsenziyani qayta faollashtiring.',
        lockedDataSafe: 'Bemorlar, rentgen rasmlar va klinika ma’lumotlari o‘chirilmaydi. Admin panelda obuna/to‘lov uzaytirilgan bo‘lsa, shu forma orqali qayta bog‘lang.',
        offlineNotice: 'Dastur kamida oyiga bir marta internetga ulanib litsenziyani yangilashi kerak.',
        forgotTitle: 'Parolni tiklash',
        forgotDescription: 'Tasdiqlash kodi ro‘yxatdan o‘tgan elektron pochtaga yuboriladi.',
        sendCode: 'Kod yuborish',
        testCodeLabel: 'Test kodi',
        codeLabel: 'Tasdiqlash kodi',
        newPassword: 'Yangi parol',
        confirmNewPassword: 'Yangi parolni takrorlang',
        changePassword: 'Parolni yangilash'
      }
    }
  },
  ru: {
    license: {
      activation: {
        title: 'Активация лицензии',
        description: 'Подключите этот компьютер к аккаунту клиники. Ключ лицензии, логин и пароль указаны в листе активации.',
        licenseKey: 'Лицензионный ключ',
        phone: 'Телефон',
        email: 'Электронная почта',
        login: 'Логин (телефон или email)',
        password: 'Пароль',
        dentist: 'Врач',
        clinic: 'Клиника',
        activate: 'Активировать',
        forgot: 'Забыли пароль?',
        passwordHelp: 'Пароль выдаётся один раз в листе активации. Если пароль неизвестен, восстановите его или замените ключ в панели администратора.',
        lockedTitle: 'Нужно повторно проверить лицензию.',
        lockedDefault: 'Повторно активируйте лицензию.',
        lockedDataSafe: 'Пациенты, рентген-снимки и данные клиники не удаляются. Если подписка/оплата продлена в панели администратора, подключите лицензию через эту форму.',
        offlineNotice: 'Приложение должно подключаться к интернету не реже одного раза в месяц для обновления лицензии.',
        forgotTitle: 'Восстановление пароля',
        forgotDescription: 'Код подтверждения будет отправлен на зарегистрированную электронную почту.',
        sendCode: 'Отправить код',
        testCodeLabel: 'Тестовый код',
        codeLabel: 'Код подтверждения',
        newPassword: 'Новый пароль',
        confirmNewPassword: 'Повторите новый пароль',
        changePassword: 'Обновить пароль'
      }
    }
  },
  en: {
    license: {
      activation: {
        title: 'Activate license',
        description: 'Connect this computer to the clinic account. The license key, login, and password are provided on the activation sheet.',
        licenseKey: 'License key',
        phone: 'Phone',
        email: 'Email',
        login: 'Login (phone or email)',
        password: 'Password',
        dentist: 'Doctor',
        clinic: 'Clinic',
        activate: 'Activate',
        forgot: 'Forgot password?',
        passwordHelp: 'The password is provided once on the activation sheet. If it is missing, reset the password or replace the license key in the admin panel.',
        lockedTitle: 'License must be checked again.',
        lockedDefault: 'Reactivate the license.',
        lockedDataSafe: 'Patients, X-rays, and clinic data are not deleted. If the subscription/payment was extended in the admin panel, connect it again through this form.',
        offlineNotice: 'The app must connect to the internet at least once a month to refresh the license.',
        forgotTitle: 'Reset password',
        forgotDescription: 'A confirmation code will be sent to the registered email address.',
        sendCode: 'Send code',
        testCodeLabel: 'Test code',
        codeLabel: 'Confirmation code',
        newPassword: 'New password',
        confirmNewPassword: 'Confirm new password',
        changePassword: 'Update password'
      }
    }
  },
  tg: {
    license: {
      activation: {
        title: 'Фаъолсозии литсензия',
        description: 'Компютерро ба ҳисоби клиника пайваст кунед. Калиди литсензия, логин ва парол дар варақаи фаъолсозӣ оварда шудаанд.',
        licenseKey: 'Калиди литсензия',
        phone: 'Телефон',
        email: 'Почтаи электронӣ',
        login: 'Логин (телефон ё почта)',
        password: 'Парол',
        dentist: 'Духтур',
        clinic: 'Клиника',
        activate: 'Фаъол кардан',
        forgot: 'Паролро фаромӯш кардед?',
        passwordHelp: 'Парол дар варақаи фаъолсозӣ як маротиба дода мешавад. Агар парол ёфт нашавад, паролро дар панели админ барқарор кунед ё калиди литсензияро иваз кунед.',
        lockedTitle: 'Литсензияро дубора санҷидан лозим аст.',
        lockedDefault: 'Литсензияро дубора фаъол кунед.',
        lockedDataSafe: 'Маълумоти беморон, аксҳои рентгенӣ ва маълумоти клиника нест карда намешаванд. Агар обуна/пардохт дар панели админ тамдид шуда бошад, тавассути ин шакл дубора пайваст шавед.',
        offlineNotice: 'Барнома бояд на камтар аз як маротиба дар як моҳ ба интернет пайваст шавад, то литсензияро навсозӣ кунад.',
        forgotTitle: 'Барқарорсозии парол',
        forgotDescription: 'Рамзи тасдиқ ба почтаи электронии бақайдгирифташуда фиристода мешавад.',
        sendCode: 'Фиристодани рамз',
        testCodeLabel: 'Рамзи санҷишӣ',
        codeLabel: 'Рамзи тасдиқ',
        newPassword: 'Пароли нав',
        confirmNewPassword: 'Пароли навро такрор кунед',
        changePassword: 'Навсозии парол'
      }
    }
  }
};
const medinson1126Merge = (target, source) => {
  for (const [key, value] of Object.entries(source || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== 'object') target[key] = {};
      medinson1126Merge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
};
for (const [lang, patch] of Object.entries(medinson1126LicenseActivationCopy)) {
  if (dictionaries[lang]) medinson1126Merge(dictionaries[lang], patch);
}


const readStoredLanguage = () => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const value = window.localStorage?.getItem(LANGUAGE_STORAGE_KEY);
  return dictionaries[value] ? value : DEFAULT_LANGUAGE;
};

const getByPath = (object, key) => String(key || '').split('.').reduce((acc, part) => acc?.[part], object);
const interpolate = (text, params = {}) => String(text ?? '').replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ''));

export const getCurrentLanguage = () => readStoredLanguage();

export const translate = (key, params = {}, language = readStoredLanguage()) => {
  const lang = dictionaries[language] ? language : DEFAULT_LANGUAGE;
  const value = getByPath(dictionaries[lang], key) ?? getByPath(dictionaries[DEFAULT_LANGUAGE], key) ?? key;
  return interpolate(value, params);
};

const I18nContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: translate,
});

export const I18nProvider = ({ children }) => {
  const [language, setLanguageState] = useState(readStoredLanguage);

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const handleLangChange = (e) => {
      if (e.detail?.language && dictionaries[e.detail.language]) {
        const lang = e.detail.language;
        setLanguageState(lang);
        // Keep all language storage keys in sync so Telegram messages use correct language
        // (This event may fire from loadDesktopStatus or syncEngine — not just setLanguage)
        if (typeof window !== 'undefined') {
          window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, lang);
          window.localStorage?.setItem('medinson_standalone_appLanguage', lang);
          window.localStorage?.setItem('medinson_standalone_telegramLanguage', lang);
          window.localStorage?.setItem('medinson:language', lang);
          window.localStorage?.setItem('language', lang);
        }
        if (typeof document !== 'undefined') document.documentElement.lang = lang;
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('medinson-language-changed', handleLangChange);
      return () => window.removeEventListener('medinson-language-changed', handleLangChange);
    }
    return undefined;
  }, []);

  const setLanguage = useCallback((nextLanguage) => {
    const safeLanguage = dictionaries[nextLanguage] ? nextLanguage : DEFAULT_LANGUAGE;
    setLanguageState(safeLanguage);
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem(LANGUAGE_STORAGE_KEY, safeLanguage);
      window.localStorage?.setItem('medinson_standalone_appLanguage', safeLanguage);
      window.localStorage?.setItem('medinson_standalone_telegramLanguage', safeLanguage);
      window.localStorage?.setItem('medinson_standalone_settings_updated_at', new Date().toISOString());
      window.dispatchEvent(new CustomEvent('medinson-language-changed', { detail: { language: safeLanguage } }));
    }
    if (typeof document !== 'undefined') document.documentElement.lang = safeLanguage;
  }, []);

  const t = useCallback((key, params = {}) => translate(key, params, language), [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);
