const TELEGRAM_MESSAGES = {
  uz: {
    TELEGRAM_LICENSE_DISABLED: "Telegram xizmati litsenziyangizda yoqilmagan. Telegram moduli yoki to‘liq tarifni faollashtiring.",
    TELEGRAM_DISABLED: "Telegram xabarlari sozlamalarda o‘chirilgan.",
    TELEGRAM_TOKEN_MISSING: "Telegram bot tokenini kiriting.",
    TELEGRAM_TOKEN_INVALID: "Telegram bot tokeni noto‘g‘ri. BotFather bergan tokenni to‘liq nusxalab kiriting.",
    TELEGRAM_CHAT_MISSING: "Test xabar uchun klinika/admin Telegram chati ulanmagan. Botga /clinic kodini yuboring yoki QR orqali ulang.",
    TELEGRAM_CHAT_INVALID: "Klinika/admin Telegram chati noto‘g‘ri. Avtomatik ulash tavsiya qilinadi: botga /clinic kodini yuboring.",
    TELEGRAM_CHAT_IS_BOT_USERNAME: "Bot username chat ID emas. Klinika/admin chatini ulash uchun botga /clinic kodini yuboring yoki QR orqali Start bosing.",
    TELEGRAM_STATUS_OK: "Telegram bot va klinika/admin chati ishlayapti.",
    TELEGRAM_STATUS_OK_CHAT_REQUIRED: "Telegram bot ishlayapti. Test xabar uchun klinika/admin chatini /clinic kodi yoki QR orqali ulang.",
    TELEGRAM_TEST_SENT: "Test xabar Telegramga yuborildi.",
    TELEGRAM_STATUS_FAILED: "Telegram holatini tekshirib bo‘lmadi.",
    TELEGRAM_TEST_FAILED: "Test xabar yuborilmadi.",
    TELEGRAM_BOT_UNAUTHORIZED: "Telegram bot tokeni noto‘g‘ri yoki bot o‘chirilgan. BotFather tokenini qayta tekshiring.",
    TELEGRAM_CHAT_NOT_FOUND: "Klinika/admin Telegram chati topilmadi. Botga /clinic kodini yuboring yoki guruh/kanalga botni admin qilib qo‘shing.",
    TELEGRAM_BLOCKED: "Telegram foydalanuvchisi botni bloklagan.",
    TELEGRAM_NETWORK: "Internet aloqasi yoki Telegram xizmatiga ulanish vaqtincha ishlamadi.",
    TELEGRAM_RATE_LIMIT: "Telegram vaqtincha chekladi. Keyinroq qayta urinib ko‘ring.",
    TELEGRAM_SETTINGS_SAVED: "Sozlamalar saqlandi.",
    TELEGRAM_SETTINGS_FAILED: "Sozlamalar saqlanmadi.",
  },
  ru: {
    TELEGRAM_LICENSE_DISABLED: "Сервис Telegram не включён в вашей лицензии. Активируйте модуль Telegram или полный тариф.",
    TELEGRAM_DISABLED: "Telegram-сообщения выключены в настройках.",
    TELEGRAM_TOKEN_MISSING: "Введите token Telegram-бота.",
    TELEGRAM_TOKEN_INVALID: "Неверный token Telegram-бота. Скопируйте полный token из BotFather.",
    TELEGRAM_CHAT_MISSING: "Для тестового сообщения не подключён Telegram-чат клиники/администратора. Отправьте боту код /clinic или подключите через QR.",
    TELEGRAM_CHAT_INVALID: "Telegram-чат клиники/администратора указан неверно. Рекомендуется автоподключение: отправьте боту код /clinic.",
    TELEGRAM_CHAT_IS_BOT_USERNAME: "Username бота не является chat ID. Подключите чат клиники/администратора через код /clinic или QR и нажмите Start.",
    TELEGRAM_STATUS_OK: "Telegram-бот и чат клиники/администратора работают.",
    TELEGRAM_STATUS_OK_CHAT_REQUIRED: "Telegram-бот работает. Для тестового сообщения подключите чат клиники/администратора через /clinic или QR.",
    TELEGRAM_TEST_SENT: "Тестовое сообщение отправлено в Telegram.",
    TELEGRAM_STATUS_FAILED: "Не удалось проверить статус Telegram.",
    TELEGRAM_TEST_FAILED: "Не удалось отправить тестовое сообщение.",
    TELEGRAM_BOT_UNAUTHORIZED: "Неверный token Telegram-бота или бот отключён. Проверьте token из BotFather.",
    TELEGRAM_CHAT_NOT_FOUND: "Telegram-чат клиники/администратора не найден. Отправьте боту код /clinic или добавьте бота администратором в группу/канал.",
    TELEGRAM_BLOCKED: "Пользователь заблокировал Telegram-бота.",
    TELEGRAM_NETWORK: "Интернет-соединение или подключение к Telegram временно недоступно.",
    TELEGRAM_RATE_LIMIT: "Telegram временно ограничил запросы. Попробуйте позже.",
    TELEGRAM_SETTINGS_SAVED: "Настройки сохранены.",
    TELEGRAM_SETTINGS_FAILED: "Не удалось сохранить настройки.",
  },
  en: {
    TELEGRAM_LICENSE_DISABLED: "Telegram is not enabled in this license. Activate the Telegram module or the full plan.",
    TELEGRAM_DISABLED: "Telegram messages are disabled in settings.",
    TELEGRAM_TOKEN_MISSING: "Enter the Telegram bot token.",
    TELEGRAM_TOKEN_INVALID: "Telegram bot token format is invalid.",
    TELEGRAM_CHAT_MISSING: "The clinic/admin Telegram chat is not connected. Send the /clinic code to the bot or connect with the QR/deep link.",
    TELEGRAM_CHAT_INVALID: "The clinic/admin Telegram chat is invalid. Automatic connection is recommended: send the /clinic code to the bot.",
    TELEGRAM_CHAT_IS_BOT_USERNAME: "The bot username is not a chat ID. Connect the clinic/admin chat with the /clinic code or QR and press Start.",
    TELEGRAM_STATUS_OK: "Telegram bot and clinic/admin chat are working.",
    TELEGRAM_STATUS_OK_CHAT_REQUIRED: "Telegram bot is working. Connect the clinic/admin chat with the /clinic code or QR before sending a test message.",
    TELEGRAM_TEST_SENT: "Test message was sent to Telegram.",
    TELEGRAM_STATUS_FAILED: "Could not check Telegram status.",
    TELEGRAM_TEST_FAILED: "Could not send the test message.",
    TELEGRAM_BOT_UNAUTHORIZED: "Telegram bot token is invalid or the bot is disabled.",
    TELEGRAM_CHAT_NOT_FOUND: "The clinic/admin Telegram chat was not found. Send the /clinic code to the bot or add the bot as admin in the group/channel.",
    TELEGRAM_BLOCKED: "The Telegram user blocked the bot.",
    TELEGRAM_NETWORK: "Internet connection or Telegram service connection is temporarily unavailable.",
    TELEGRAM_RATE_LIMIT: "Telegram temporarily limited requests. Try again later.",
    TELEGRAM_SETTINGS_SAVED: "Settings saved.",
    TELEGRAM_SETTINGS_FAILED: "Settings were not saved.",
  },
  tg: {
    TELEGRAM_LICENSE_DISABLED: "Хизмати Telegram дар литсензияи шумо фаъол нест. Модули Telegram ё тарифи пурраро фаъол кунед.",
    TELEGRAM_DISABLED: "Паёмҳои Telegram дар танзимот хомӯш карда шудаанд.",
    TELEGRAM_TOKEN_MISSING: "Токени Telegram-ботро ворид кунед.",
    TELEGRAM_TOKEN_INVALID: "Токени Telegram-бот нодуруст аст. Токени пурраро аз BotFather нусхабардорӣ ва ворид кунед.",
    TELEGRAM_CHAT_MISSING: "Барои паёми санҷишӣ чати Telegram-и клиника/администратор пайваст нашудааст. Ба бот рамзи /clinic фиристед ё тавассути QR пайваст кунед.",
    TELEGRAM_CHAT_INVALID: "Чати Telegram-и клиника/администратор нодуруст аст. Пайвастшавии худкор тавсия дода мешавад: ба бот рамзи /clinic фиристед.",
    TELEGRAM_CHAT_IS_BOT_USERNAME: "Номи корбарии бот ID-и чат нест. Чати клиника/администраторро тавассути рамзи /clinic ё QR пайваст кунед ва Start-ро пахш кунед.",
    TELEGRAM_STATUS_OK: "Боти Telegram ва чати клиника/администратор кор мекунанд.",
    TELEGRAM_STATUS_OK_CHAT_REQUIRED: "Боти Telegram кор мекунад. Барои паёми санҷишӣ чати клиника/администраторро тавассути /clinic ё QR пайваст кунед.",
    TELEGRAM_TEST_SENT: "Паёми санҷишӣ ба Telegram фиристода шуд.",
    TELEGRAM_STATUS_FAILED: "Ҳолати Telegram-ро санҷидан муяссар нашуд.",
    TELEGRAM_TEST_FAILED: "Паёми санҷишӣ фиристода нашуд.",
    TELEGRAM_BOT_UNAUTHORIZED: "Токени Telegram-бот нодуруст аст ё бот хомӯш карда шудааст. Токенро аз BotFather дубора санҷед.",
    TELEGRAM_CHAT_NOT_FOUND: "Чати Telegram-и клиника/администратор ёфт нашуд. Ба бот рамзи /clinic фиристед ё ботро ба гурӯҳ/канал администратор таъин кунед.",
    TELEGRAM_BLOCKED: "Корбар боти Telegram-ро блок кардааст.",
    TELEGRAM_NETWORK: "Пайвастшавӣ ба интернет ё Telegram муваққатан дастнорас аст.",
    TELEGRAM_RATE_LIMIT: "Telegram дархостҳоро муваққатан маҳдуд кард. Баъдтар кӯшиш кунед.",
    TELEGRAM_SETTINGS_SAVED: "Танзимот захира карда шуданд.",
    TELEGRAM_SETTINGS_FAILED: "Танзимот захира карда нашуданд.",
  },
};

const RAW_TO_CODE = new Map([
  ["Telegram bot kaliti kiritilmagan.", "TELEGRAM_TOKEN_MISSING"],
  ["Telegram bot kaliti formati noto‘g‘ri.", "TELEGRAM_TOKEN_INVALID"],
  ["Telegram chat ID formati noto‘g‘ri.", "TELEGRAM_CHAT_INVALID"],
  ["Telegram chat ID formati noto‘g‘ri. Masalan: -1001234567890 yoki @kanal_nomi", "TELEGRAM_CHAT_INVALID"],
  ["Bot username chat ID emas. Botga /clinic kodini yuboring yoki klinika guruhi/kanalining chat ID sini kiriting.", "TELEGRAM_CHAT_IS_BOT_USERNAME"],
  ["Telegram bot va chat ID ishlayapti.", "TELEGRAM_STATUS_OK"],
  ["Telegram bot ishlayapti. Test xabar uchun chat ID kiriting.", "TELEGRAM_STATUS_OK_CHAT_REQUIRED"],
  ["Telegram bot ishlayapti. Test xabar uchun klinika/admin chatini /clinic kodi orqali ulang.", "TELEGRAM_STATUS_OK_CHAT_REQUIRED"],
  ["Test xabar yuborish uchun Telegram chat ID kiriting.", "TELEGRAM_CHAT_MISSING"],
  ["Test xabar yuborish uchun klinika/admin Telegram chatini /clinic kodi orqali ulang.", "TELEGRAM_CHAT_MISSING"],
  ["Test xabar Telegramga yuborildi", "TELEGRAM_TEST_SENT"],
  ["Telegram xabarlari sozlamalarda o‘chirilgan.", "TELEGRAM_DISABLED"],
  ["Telegram obunasi faol emas.", "TELEGRAM_LICENSE_DISABLED"],
  ["Telegram bot kaliti noto‘g‘ri yoki bot o‘chirilgan.", "TELEGRAM_BOT_UNAUTHORIZED"],
  ["Telegram chat ID topilmadi. Botga /start yuborilganini va chat ID to‘g‘riligini tekshiring.", "TELEGRAM_CHAT_NOT_FOUND"],
  ["Telegram foydalanuvchisi botni bloklagan.", "TELEGRAM_BLOCKED"],
  ["Internet aloqasi yoki Telegram xizmatiga ulanish vaqtincha ishlamadi.", "TELEGRAM_NETWORK"],
  ["Telegram juda ko‘p so‘rov tufayli vaqtincha chekladi. Keyinroq avtomatik qayta uriniladi.", "TELEGRAM_RATE_LIMIT"],
]);

export const telegramToastText = (payload = {}, language = "uz", fallbackCode = "") => {
  const lang = TELEGRAM_MESSAGES[language] ? language : "uz";
  const message = typeof payload === "string" ? payload : String(payload?.message || "").trim();
  const rawCode = RAW_TO_CODE.get(message);
  const responseCode = typeof payload === "object" ? payload?.code : "";
  const code = String(rawCode || responseCode || fallbackCode || "").trim();
  return TELEGRAM_MESSAGES[lang]?.[code] || message || TELEGRAM_MESSAGES[lang]?.[fallbackCode] || TELEGRAM_MESSAGES[lang]?.TELEGRAM_TEST_FAILED || "Telegram xabari bajarilmadi.";
};

export const friendlyAiPackMessage = (value = "", language = "uz") => {
  const raw = String(value || "").trim();
  if (!raw) return raw;
  const lower = raw.toLowerCase();
  const isLocalAiPermission = (lower.includes("eperm") || lower.includes("permission denied") || lower.includes("operation not permitted")) && lower.includes("local-ai");
  if (!isLocalAiPermission) return raw;
  if (language === "ru") {
    return "Нет доступа к папке AI Pack. Закройте файлы AI Pack, перезапустите MedInson или запустите приложение от имени администратора, затем попробуйте снова.";
  }
  if (language === "en") {
    return "AI Pack folder access was denied. Close AI Pack files, restart MedInson, or run the app as administrator, then try again.";
  }
  if (language === "tg") {
    return "Дастрасӣ ба папкаи AI Pack рад карда шуд. Файлҳои AI Pack-ро пӯшед, MedInson-ро аз нав оғоз кунед ё барномаро аз номи администратор кушоед, сипас дубора кӯшиш кунед.";
  }
  return "AI Pack papkasiga ruxsat berilmadi. AI Pack fayllarini yoping, MedInsonni qayta ishga tushiring yoki ilovani administrator sifatida ochib qayta urinib ko‘ring.";
};
