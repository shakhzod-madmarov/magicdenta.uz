import runtimeTerms, { MEDINSON_1038_TRANSLATION_PATCH } from "./runtimeTranslations.js";

// Helper to get active language
const getActiveLang = () => {
  if (typeof localStorage === 'undefined') return 'uz';
  const val = localStorage.getItem('language') || 
              localStorage.getItem('medinson.desktop.language') || 
              localStorage.getItem('medinson:language') || 
              'uz';
  return val.slice(0, 2).toLowerCase();
};

const activeLang = getActiveLang();

if (activeLang !== 'uz') {
  const dictionary = {
    ...(runtimeTerms[activeLang] || {}),
    ...(MEDINSON_1038_TRANSLATION_PATCH[activeLang] || {})
  };

  // Add custom mappings for web specific terms
  if (activeLang === 'ru') {
    dictionary["stomatolog"] = "стоматолог";
    dictionary["Stomatolog"] = "Стоматолог";
    dictionary["Elektron pochta"] = "Электронная почта";
    dictionary["Parol"] = "Пароль";
    dictionary["Tizimga kirish"] = "Войти в систему";
    dictionary["tizimiga kirish"] = "вход в систему";
    dictionary["Admin panel"] = "Панель администратора";
    dictionary["Stomatolog panel"] = "Панель стоматолога";
    dictionary["Chiqish"] = "Выйти";
    dictionary["Mening hisobim"] = "Мой профиль";
    dictionary["Hisob-kitob"] = "Финансы";
    dictionary["Bosh sahifa"] = "Главная";
    dictionary["Biz haqimizda"] = "О нас";
    dictionary["Aloqa"] = "Контакты";
    dictionary["Uchrashuvlarim"] = "Мои приёмы";
    dictionary["Mening akkauntim"] = "Мой аккаунт";
    dictionary["Akkauntdan chiqish"] = "Выйти из аккаунта";
    dictionary["Akkauntga kirish"] = "Войти в аккаунт";

    // Modals and Alerts
    dictionary["Bemorning Telegram bog'lanishini uzmoqchimisiz?"] = "Вы уверены, что хотите отключить Telegram для этого пациента?";
    dictionary["Bemorning Telegram bog‘lanishini uzmoqchimisiz?"] = "Вы уверены, что хотите отключить Telegram для этого пациента?";
    dictionary["Bemor yangilandi"] = "Пациент обновлен";
    dictionary["Elektron pochta kiriting"] = "Введите электронную почту";
    dictionary["Parol kiriting"] = "Введите пароль";
    dictionary["Kirish muvaffaqiyatli"] = "Вход выполнен успешно";

    // Admin Dashboard / Appointments / Live Queue RU
    dictionary["panel"] = "панель";
    dictionary["Panel"] = "Панель";
    dictionary["Omborxona"] = "Склад";
    dictionary["Unikal bemorlar"] = "Уникальные пациенты";
    dictionary["Tanlangan davr bo'yicha"] = "За выбранный период";
    dictionary["Tanlangan davr bo‘yicha"] = "За выбранный период";
    dictionary["To'lov foizi"] = "Процент оплаты";
    dictionary["To‘lov foizi"] = "Процент оплаты";
    dictionary["Umumiy - to'langan"] = "Всего - оплачено";
    dictionary["Umumiy - to‘langan"] = "Всего - оплачено";
    dictionary["Hozircha ma'lumot yo'q"] = "Пока нет данных";
    dictionary["Hozircha ma’lumot yo‘q"] = "Пока нет данных";
    dictionary["Hozircha ma‘lumot yo‘q"] = "Пока нет данных";
    dictionary["Mening uchrashuvlarim"] = "Мои приёмы";
    dictionary["Rejali uchrashuv yaratish"] = "Создать запланированный приём";
    dictionary["Ko'rsatilmoqda"] = "Показано";
    dictionary["Ko‘rsatilmoqda"] = "Показано";
    dictionary["Umumiy qarz"] = "Общий долг";
    dictionary["Live holat"] = "Живой статус";
    dictionary["Sahifa"] = "Страница";
    dictionary["Oldingi"] = "Назад";
    dictionary["Keyingi"] = "Вперед";
    dictionary["Admin yozgan"] = "Записан админом";
    dictionary["Ishni boshladim"] = "Начать приём";
    dictionary["Telefonni nusxa olish"] = "Копировать телефон";
    dictionary["Stomatolog yozgan"] = "Записал стоматолог";
    dictionary["Yakunlangan (qarz bor)"] = "Завершено (есть долг)";
    dictionary["Jonli Yuborish"] = "Отправить в живую очередь";
    dictionary["Bemor ID (B-1)"] = "ID Пациента (B-1)";
    dictionary["Ism sharif"] = "Имя и фамилия";
    dictionary["Bemor topilmadimi?"] = "Пациент не найден?";
    dictionary["Shu joyning o'zida yangi bemor yaratib jonli yuboring."] = "Создайте нового пациента прямо здесь и отправьте в живую очередь.";
    dictionary["Shu joyning o‘zida yangi bemor yaratib jonli yuboring."] = "Создайте нового пациента прямо здесь и отправьте в живую очередь.";
    dictionary["Formani yopish"] = "Закрыть форму";
    dictionary["Allergiya (ixtiyoriy)"] = "Аллергия (необязательно)";
    dictionary["Tibbiy ogohlantirish (ixtiyoriy)"] = "Медицинские предупреждения (необязательно)";
    dictionary["Izoh (ixtiyoriy)"] = "Примечание (необязательно)";
    dictionary["Maxfiy infeksion belgi (ixtiyoriy)"] = "Скрытый инфекционный статус (необязательно)";
    dictionary["Faqat admin va stomatolog ko'radi. Bemor va navbat ekranda ko'rinmaydi."] = "Видят только админ и стоматолог. Не отображается для пациентов и в очереди.";
    dictionary["Faqat admin va stomatolog ko‘radi. Bemor va navbat ekranda ko‘rinmaydi."] = "Видят только админ и стоматолог. Не отображается для пациентов и в очереди.";
    dictionary["Faqat admin va stomatolog ko'radi. Bemor va navbat ekranida ko'rinmaydi."] = "Видят только админ и стоматолог. Не отображается для пациентов и на экране очереди.";
    dictionary["Faqat admin va stomatolog ko‘radi. Bemor va navbat ekranida ko‘rinmaydi."] = "Видят только админ и стоматолог. Не отображается для пациентов и на экране очереди.";
    dictionary["treatment.procedures ichidan ajratildi"] = "выделено из процедур лечения";

    // Dentist Templates Page RU
    dictionary["Stomatolog shablonlari"] = "Шаблоны стоматолога";
    dictionary["Tez-tez ishlatiladigan davolash yozuvlarini saqlang va qabulni yakunlashda bir bosishda qo'llang."] = "Сохраняйте часто используемые записи лечения и применяйте их одним кликом при завершении приема.";
    dictionary["Tez-tez ishlatiladigan davolash yozuvlarini saqlang va qabulni yakunlashda bir bosishda qo‘llang."] = "Сохраняйте часто используемые записи лечения и применяйте их одним кликом при завершении приема.";
    dictionary["Shablon nomi *"] = "Название шаблона *";
    dictionary["Masalan: Karies davolash"] = "Например: Лечение кариеса";
    dictionary["Narxi (so'm)"] = "Цена (сум)";
    dictionary["Narxi (so‘m)"] = "Цена (сум)";
    dictionary["Masalan: 150 000"] = "Например: 150 000";
    dictionary["Sevimli shablon sifatida belgilash"] = "Отметить как избранный шаблон";
    dictionary["Saqlangan shablonlar"] = "Сохраненные шаблоны";
    dictionary["Nomi yoki mazmuni bo'yicha qidirish"] = "Поиск по названию или содержимому";
    dictionary["Nomi yoki mazmuni bo‘yicha qidirish"] = "Поиск по названию или содержимому";
    dictionary["Ishlatilgan:"] = "Использовано:";
    dictionary["Oxirgi:"] = "Последний:";
    dictionary["Tishlar:"] = "Зубы:";
    dictionary["Bajarilgan ishlar:"] = "Выполненные работы:";
    dictionary["Keyingi qadam:"] = "Следующий шаг:";
    dictionary["Dorilar:"] = "Лекарства:";
    dictionary["Eslatma:"] = "Заметки:";

    // Dentist Patients Page RU
    dictionary["Stomatolog bo'yicha biriktirilgan bemorlar ro'yxati"] = "Список пациентов, закрепленных за стоматологом";
    dictionary["Stomatolog bo‘yicha biriktirilgan bemorlar ro‘yxati"] = "Список пациентов, закрепленных за стоматологом";
    dictionary["Oxirgi tashrif:"] = "Последний визит:";
    dictionary["Email (ixtiyoriy)"] = "Email (необязательно)";

    // Navigation and week pagination RU
    // Navigation and week pagination RU
    dictionary["⬅ Oldingi hafta"] = "⬅ Предыдущая неделя";
    dictionary["Keyingi hafta ➡"] = "Следующая неделя ➡";
    dictionary["⬅ Oldingi"] = "⬅ Назад";
    dictionary["Keyingi ➡"] = "Вперед ➡";

    // Dentist Appointments & Modals RU
    dictionary["Qabul qilinmoqda"] = "На приёме";
    dictionary["Qabulni tugatish"] = "Завершить приём";
    dictionary["Qabulni yakunlash"] = "Завершение приёма";
    dictionary["Shablon (ixtiyoriy)"] = "Шаблон (необязательно)";
    dictionary["Shablon tanlang"] = "Выберите шаблон";
    dictionary["Shablon tanlansa, diagnoz va klinik maydonlar avtomatik to'ladi."] = "При выборе шаблона диагноз и клинические поля заполняются автоматически.";
    dictionary["Shablon tanlansa, diagnoz va klinik maydonlar avtomatik to‘ladi."] = "При выборе шаблона диагноз и клинические поля заполняются автоматически.";
    dictionary["To'lov ma'lumotlari"] = "Информация об оплате";
    dictionary["To‘lov ma’lumotlari"] = "Информация об оплате";
    dictionary["To‘lov ma‘lumotlari"] = "Информация об оплате";
    dictionary["Umumiy narx *"] = "Общая цена *";
    dictionary["Masalan: 150000"] = "Например: 150000";
    dictionary["Umumiy narx majburiy"] = "Общая цена обязательна";
    dictionary["Hozir olingan (ixtiyoriy)"] = "Получено сейчас (необязательно)";
    dictionary["Umumiy"] = "Всего";
    dictionary["Hozir"] = "Сейчас";
    dictionary["Keyingi ko'rik uchun sana va vaqt (ixtiyoriy)"] = "Дата и время следующего визита (необязательно)";
    dictionary["Keyingi ko‘rik uchun sana va vaqt (ixtiyoriy)"] = "Дата и время следующего визита (необязательно)";
    dictionary["Taqvimdan mos kun va bo'sh vaqtni tanlang. Hozirgi band vaqtlar ko'rinadi."] = "Выберите подходящий день и свободное время из календаря. Занятое время будет показано.";
    dictionary["Taqvimdan mos kun va bo‘sh vaqtni tanlang. Hozirgi band vaqtlar ko‘rinadi."] = "Выберите подходящий день и свободное время из календаря. Занятое время будет показано.";
    dictionary["Uchrashuv vaqti tanlanmagan"] = "Время приема не выбрано";
    dictionary["HAFTANI BOSHLASH SANASI"] = "ДАТА НАЧАЛА НЕДЕЛИ";
    dictionary["Taqvim bandlik jadvali (7 kun)"] = "График занятости календаря (7 дней)";
    dictionary["XRAY / suratlar (ixtiyoriy)"] = "Рентген / снимки (необязательно)";

    // Telegram and Edit Patient details RU
    dictionary["Telegram bot ulanmagan"] = "Telegram бот не подключен";
    dictionary["QR kod orqali bog'lang"] = "Подключите через QR-код";
    dictionary["QR kod orqali bog‘lang"] = "Подключите через QR-код";
    dictionary["Telegramni ulash"] = "Подключить Telegram";
    dictionary["Bemor ma'lumotlarini tahrirlash"] = "Редактировать данные пациента";
    dictionary["Bemor ma’lumotlarini tahrirlash"] = "Редактировать данные пациента";
    dictionary["Ism, Telefon, Адрес, allergia va boshqa ma'lumotlarni shu yerda yangilang."] = "Обновите имя, телефон, адрес, аллергию и другие данные здесь.";
    dictionary["Ism, Telefon, Адрес, allergia va boshqa ma’lumotlarni shu yerda yangilang."] = "Обновите имя, телефон, адрес, аллергию и другие данные здесь.";

    // Patient History & Visit Card RU
    dictionary["Muolajalar:"] = "Процедуры:";
    dictionary["Keyingi reja:"] = "Следующий план:";
    dictionary["Keyingi qabul:"] = "Следующий прием:";
    dictionary["Qabul summasi:"] = "Сумма приема:";
    dictionary["To'langan:"] = "Оплачено:";
    dictionary["To‘langan:"] = "Оплачено:";
    dictionary["Qolgan qarz:"] = "Оставшийся долг:";
    dictionary["Qisman"] = "Частично";
    dictionary["Yaratilgan:"] = "Создано:";
    dictionary["To'lovlar:"] = "Платежи:";
    dictionary["To‘lovlar:"] = "Платежи:";
    dictionary["Summa o'zgarishlari:"] = "Изменения суммы:";
    dictionary["Summa o‘zgarishlari:"] = "Изменения суммы:";
    dictionary["Sabab: Qabul yakunida birinchi summa kiritildi"] = "Причина: Первоначальная сумма введена при завершении приема";
    dictionary["Kim o'zgartirdi:"] = "Кто изменил:";
    dictionary["Kim o‘zgartirdi:"] = "Кто изменил:";
    dictionary["Stomatolog tasdig'i:"] = "Подтверждение стоматолога:";
    dictionary["Stomatolog tasdig‘i:"] = "Подтверждение стоматолога:";

    // Dentist Profile Page RU
    dictionary["Tajriba"] = "Опыт";
    dictionary["Daraja"] = "Категория";
    dictionary["Mutaxassislik"] = "Специальность";
    dictionary["Parol xavfsizlik uchun ko'rsatilmaydi."] = "Пароль не отображается в целях безопасности.";
    dictionary["Parol xavfsizlik uchun ko‘rsatilmaydi."] = "Пароль не отображается в целях безопасности.";
    dictionary["Eski parolni kiriting va yangi parolni 2 marta tasdiqlang."] = "Введите старый пароль и подтвердите новый пароль 2 раза.";
    dictionary["Eski parol"] = "Старый пароль";
    dictionary["Kamida 6 ta belgi"] = "Минимум 6 символов";
    dictionary["Yangi parolni tasdiqlang"] = "Подтвердите новый пароль";
    dictionary["Parolni saqlash"] = "Сохранить пароль";

    // Warehouse Page & Modals RU
    dictionary["Mening Omborxonam"] = "Мой склад";
    dictionary["Shaxsiy materiallar va stomatolog zaxirasi"] = "Личные материалы и запасы стоматолога";
    dictionary["Yangi material qo'shish"] = "Добавить новый материал";
    dictionary["Yangi material qo‘shish"] = "Добавить новый материал";
    dictionary["+ Yangi material qo'shish"] = "+ Добавить новый материал";
    dictionary["+ Yangi material qo‘shish"] = "+ Добавить новый материал";
    dictionary["JAMI TURLAR"] = "ВСЕГО ВИДОВ";
    dictionary["material turi"] = "вид материала";
    dictionary["OMBOR QIYMATI"] = "СТОИМОСТЬ СКЛАДА";
    dictionary["umumiy bozor narxi"] = "общая рыночная стоимость";
    dictionary["KAM QOLDI"] = "МАЛО ОСТАЛОСЬ";
    dictionary["materialda qoldiq kam"] = "мало остатков материалов";
    dictionary["HARAKATLAR"] = "ОПЕРАЦИИ";
    dictionary["jami kirim/chiqim"] = "всего приход/расход";
    dictionary["Zaxira"] = "Запасы";
    dictionary["Harakatlar tarixi"] = "История операций";
    dictionary["Material nomi bo'yicha qidirish..."] = "Поиск по названию материала...";
    dictionary["Material nomi bo‘yicha qidirish..."] = "Поиск по названию материала...";
    dictionary["MATERIAL NOMI"] = "НАЗВАНИЕ МАТЕРИАЛА";
    dictionary["MATERIAL NOMI *"] = "НАЗВАНИЕ МАТЕРИАЛА *";
    dictionary["KATEGORIYA"] = "КАТЕГОРИЯ";
    dictionary["QOLDIQ"] = "ОСТАТОК";
    dictionary["NARXI"] = "ЦЕНА";
    dictionary["Sarflovchi material"] = "Расходный материал";
    dictionary["Sarflovchi materiallar"] = "Расходные материалы";
    dictionary["Uskuna / Jihoz"] = "Оборудование / Инструменты";
    dictionary["Dori-darmon"] = "Медикаменты";
    dictionary["Boshqa"] = "Другое";
    dictionary["Masalan: Plomba, Novocaine, Stakan..."] = "Например: Пломба, Новокаин, Стакан...";
    dictionary["O'LCHOV BIRLIGI"] = "ЕДИНИЦА ИЗМЕРЕНИЯ";
    dictionary["O‘LCHOV BIRLIGI"] = "ЕДИНИЦА ИЗМЕРЕНИЯ";
    dictionary["dona"] = "шт.";
    dictionary["DONA NARXI (SO'M)"] = "ЦЕНА ЗА ШТУКУ (СУМ)";
    dictionary["DONA NARXI (SO‘M)"] = "ЦЕНА ЗА ШТУКУ (СУМ)";
    dictionary["Masalan: 50 000"] = "Например: 50 000";
    dictionary["MIN. QOLDIQ OGOHLANTIRISH"] = "МИН. ОСТАТОК ДЛЯ ПРЕДУПРЕЖДЕНИЯ";
    dictionary["BOSHLANG'ICH QOLDIQ (IXTIYORIY)"] = "НАЧАЛЬНЫЙ ОСТАТОК (НЕОБЯЗАТЕЛЬНО)";
    dictionary["BOSHLANG‘ICH QOLDIQ (IXTIYORIY)"] = "НАЧАЛЬНЫЙ ОСТАТОК (НЕОБЯЗАТЕЛЬНО)";
    dictionary["NOTE"] = "ПРИМЕЧАНИЕ";
    dictionary["Qo'shimcha ma'lumot..."] = "Дополнительная информация...";
    dictionary["Qo‘shimcha ma’lumot..."] = "Дополнительная информация...";
    dictionary["Qo'shish"] = "Добавить";
    dictionary["Qo‘shish"] = "Добавить";

    // Warehouse units RU
    dictionary["ml"] = "мл";
    dictionary["gr"] = "гр";
    dictionary["kg"] = "кг";
    dictionary["litr"] = "л";
    dictionary["metr"] = "м";
    dictionary["quti"] = "кор.";
    dictionary["paket"] = "пакет";
    dictionary["juft"] = "пара";
    dictionary["set"] = "набор";

    // Warehouse log filters RU
    dictionary["Ko'rsatish:"] = "Показать:";
    dictionary["Ko‘rsatish:"] = "Показать:";
    dictionary["Barchasi"] = "Все";
    dictionary["🟢 Kirim"] = "🟢 Приход";
    dictionary["🔴 Chiqim"] = "🔴 Расход";
    dictionary["Yangilash"] = "Обновить";

    // Warehouse table headers RU
    dictionary["SANA"] = "ДАТА";
    dictionary["TUR"] = "ТИП";
    dictionary["SABAB"] = "ПРИЧИНА";
    dictionary["MIQDOR"] = "КОЛИЧЕСТВО";
    dictionary["↑ Kirim"] = "↑ Приход";
    dictionary["↓ Chiqim"] = "↓ Расход";

    // Warehouse reasons RU
    dictionary["Bemor muolajasi uchun"] = "Для лечения пациента";
    dictionary["Boshlang'ich qoldiq kiritildi"] = "Введен начальный остаток";
    dictionary["Boshlang‘ich qoldiq kiritildi"] = "Введен начальный остаток";

    // Modals RU
    dictionary["Formani ochish"] = "Открыть форму";

    // Finance Page RU
    dictionary["Mening hisob-kitobim"] = "Мой баланс";
    dictionary["Bugun"] = "Сегодня";
    dictionary["Hafta"] = "Неделя";
    dictionary["Oy"] = "Месяц";
    dictionary["Dan"] = "С";
    dictionary["Gacha"] = "По";
    dictionary["Dan:"] = "С:";
    dictionary["Gacha:"] = "По:";
    dictionary["TUSHGAN PULLAR (MAOSH)"] = "ПОЛУЧЕННЫЕ ДЕНЬГИ (ЗАРПЛАТА)";
    dictionary["Jami to'langan ish haqilari"] = "Всего выплачено зарплат";
    dictionary["Jami to'langan ish haqlari"] = "Всего выплачено зарплат";
    dictionary["Jami to‘langan ish haqlari"] = "Всего выплачено зарплат";
    dictionary["SARFLANGAN MATERIALLAR"] = "ИЗРАСХОДОВАННЫЕ МАТЕРИАЛЫ";
    dictionary["Olingan sarf materiallari qiymati"] = "Стоимость израсходованных материалов";
    dictionary["SOF FOYDA (BALANS)"] = "ЧИСТАЯ ПРИБЫЛЬ (БАЛАНС)";
    dictionary["Oylik minus xarajatlar qoldig'i"] = "Остаток зарплаты за вычетом расходов";
    dictionary["Oylik minus xarajatlar qoldig‘i"] = "Остаток зарплаты за вычетом расходов";
    dictionary["OLINGAN OYLIK & ISH HAQLARI"] = "ПОЛУЧЕННАЯ ЗАРПЛАТА И НАЧИСЛЕНИЯ";
    dictionary["Sana"] = "Дата";
    dictionary["Summa"] = "Сумма";
    dictionary["Izoh"] = "Примечание";
    dictionary["Oylik komissiya to'lovi"] = "Ежемесячная комиссионная выплата";
    dictionary["Oylik komissiya to‘lovi"] = "Ежемесячная комиссионная выплата";
    dictionary["Jami"] = "Итого";
    dictionary["To'lovlar tarixi topilmadi"] = "История платежей не найдена";
    dictionary["To‘lovlar tarixi topilmadi"] = "История платежей не найдена";
    dictionary["SARFLANGAN MATERIALLAR (XARAJAT)"] = "ИЗРАСХОДОВАННЫЕ МАТЕРИАЛЫ (РАСХОД)";
    dictionary["Material"] = "Материал";
    dictionary["Miqdor"] = "Количество";
    dictionary["Qiymati"] = "Стоимость";
    dictionary["Jami xarajat"] = "Всего расходов";
    dictionary["Xarajatlar tarixi topilmadi"] = "История расходов не найдена";
    dictionary["Kam qoldiq"] = "Мало остатков";
    dictionary["Sabab:"] = "Причина:";
    dictionary["Status:"] = "Статус:";
    dictionary["Qabul yakunida birinchi summa kiritildi"] = "Введена первая сумма при завершении приема";

    // Extra RU keys
    dictionary["Dushanba"] = "Понедельник";
    dictionary["Seshanba"] = "Вторник";
    dictionary["Chorshanba"] = "Среда";
    dictionary["Payshanba"] = "Четверг";
    dictionary["Juma"] = "Пятница";
    dictionary["Shanba"] = "Суббота";
    dictionary["Yakshanba"] = "Воскресенье";
    dictionary["To'lov qo'shish"] = "Добавить платеж";
    dictionary["To‘lov qo‘shish"] = "Добавить платеж";
    dictionary["Yakunlangan (to'lov kutilmoqda)"] = "Завершено (ожидается оплата)";
    dictionary["Yakunlangan (to‘lov kutilmoqda)"] = "Завершено (ожидается оплата)";
    dictionary["Yakunlangan (to'langan)"] = "Завершено (оплачено)";
    dictionary["Yakunlangan (to‘langan)"] = "Завершено (оплачено)";
    dictionary["Diagnos *"] = "Диагноз *";
    dictionary["Diagnos:"] = "Диагноз:";
    dictionary["Oxirgi:"] = "Последний:";
    dictionary["Oxirgi"] = "Последний";

    // Admin Dashboard RU
    dictionary["Admin boshqaruv paneli"] = "Панель управления администратора";
    dictionary["Bugun bo'yicha ko'rsatkichlar"] = "Показатели за сегодня";
    dictionary["Bugun bo‘yicha ko‘rsatkichlar"] = "Показатели за сегодня";
    dictionary["Barcha vaqt bo'yicha ko'rsatkichlar"] = "Показатели за всё время";
    dictionary["Barcha vaqt bo‘yicha ko‘rsatkichlar"] = "Показатели за всё время";
    dictionary["Barcha vaqt"] = "Всё время";
    dictionary["Ro'yxatni ochish"] = "Открыть список";
    dictionary["Ro‘yxatni ochish"] = "Открыть список";
    dictionary["Davr bo'yicha (muolajalar asosida)"] = "За период (на основе процедур)";
    dictionary["Davr bo‘yicha (muolajalar asosida)"] = "За период (на основе процедур)";
    dictionary["Qabullar ro'yxatini ochish"] = "Открыть список приёмов";
    dictionary["Qabullar ro‘yxatini ochish"] = "Открыть список приёмов";
    dictionary["To'lovlar / qarzlarni ko'rish"] = "Посмотреть платежи / долги";
    dictionary["To‘lovlar / qarzlarni ko‘rish"] = "Посмотреть платежи / долги";
    dictionary["To'lovlar / qarzlarani ko'rish"] = "Посмотреть платежи / долги";
    dictionary["To‘lovlar / qarzlarani ko‘rish"] = "Посмотреть платежи / долги";
    dictionary["To'lov"] = "Оплата";
    dictionary["To‘lov"] = "Оплата";
    dictionary["Filtrlar"] = "Фильтры";
    dictionary["Davr va stomatolog bo'yicha statistikani boshqaring"] = "Управляйте статистикой по периодам и стоматологам";
    dictionary["Davr va stomatolog bo‘yicha statistikani boshqaring"] = "Управляйте статистикой по периодам и стоматологам";
    dictionary["Filtrlarni yopish"] = "Закрыть фильтры";
    dictionary["Filtrlami yopish"] = "Закрыть фильтры";
    dictionary["Filtrlarni ochish"] = "Открыть фильтры";
    dictionary["Barcha stomatologlar"] = "Все стоматологи";
    dictionary["Stomatolog tanlasangiz, barcha KPI shu stomatologga filtrlanadi"] = "Если вы выберете стоматолога, все KPI будут отфильтрованы по этому стоматологу";
    dictionary["Qo'llash"] = "Применить";
    dictionary["Qo‘llash"] = "Применить";
    dictionary["Excel eksport"] = "Экспорт в Excel";
    dictionary["Tahliliy ko'rsatkichlar"] = "Аналитические показатели";
    dictionary["Tahliliy ko‘rsatkichlar"] = "Аналитические показатели";
    dictionary["Tezkor tahlil: eng yaxshi natijalar va risklar"] = "Быстрый анализ: лучшие результаты и риски";
    dictionary["Eng yuqori tushum (stomatolog)"] = "Наибольшая выручка (стоматолог)";
    dictionary["Ma'lumot yo'q"] = "Нет данных";
    dictionary["Ma‘lumot yo‘q"] = "Нет данных";
    dictionary["Ma‘lumot yo‘q"] = "Нет данных";
    dictionary["Eng katta qarz (stomatolog)"] = "Наибольший долг (стоматолог)";
    dictionary["Klinika to'lov darajasi"] = "Уровень оплаты клиники";
    dictionary["Klinika to‘lov darajasi"] = "Уровень оплаты клиники";
    dictionary["Moliyaviy blok"] = "Финансовый блок";
    dictionary["Davr bo'yicha umumiy ko'rsatkichlar"] = "Общие финансовые показатели за период";
    dictionary["Davr bo‘yicha umumiy ko‘rsatkichlar"] = "Общие финансовые показатели за период";
    dictionary["Umumiy summa"] = "Общая сумма";
    dictionary["Muammo yo'q"] = "Нет проблем";
    dictionary["Muammo yo‘q"] = "Нет проблем";
    dictionary["Xavf mavjud"] = "Есть риск";
    dictionary["Reja"] = "План";
    dictionary["Uchrashuvlar va tashriflar"] = "Приёмы и визиты";
    dictionary["Rejalashtirilgan uchrashuvlar"] = "Запланированные приёмы";
    dictionary["Tashriflar (muolajalar)"] = "Визиты (процедуры)";
    dictionary["Stomatologlar bo'yicha ko'rsatkichlar"] = "Показатели по стоматологам";
    dictionary["Stomatologlar bo‘yicha ko‘rsatkichlar"] = "Показатели по стоматологам";
    dictionary["Klinik KPI: tashriflar (muolajalar), bemorlar, tushum, qarz va to'lov foizi"] = "Клинический KPI: визиты (процедуры), пациенты, выручка, долг и процент оплаты";
    dictionary["Klinik KPI: tashriflar (muolajalar), bemorlar, tushum, qarz va to‘lov foizi"] = "Клинический KPI: визиты (процедуры), пациенты, выручка, долг и процент оплаты";
    dictionary["Qidirish: ism..."] = "Поиск: имя...";
    dictionary["Tushum bo'yicha"] = "По выручке";
    dictionary["Tushum bo‘yicha"] = "По выручке";
    dictionary["Tashrif bo'yicha"] = "По визитам";
    dictionary["Tashrif bo‘yicha"] = "По визитам";
    dictionary["Bemor bo'yicha"] = "По пациентам";
    dictionary["Bemor bo‘yicha"] = "По пациентам";
    dictionary["Qarz bo'yicha"] = "По долгу";
    dictionary["Qarz bo‘yicha"] = "По долгу";
    dictionary["Tashrif"] = "Визиты";
    dictionary["Bemor"] = "Пациенты";
    dictionary["Uchrashuv"] = "Приёмы";
    dictionary["Amal"] = "Действие";
    dictionary["Filtrlash"] = "Фильтровать";
    dictionary["Akkaunt"] = "Аккаунт";
    dictionary["Ma'lumot topilmadi."] = "Данные не найдены.";
    dictionary["Ma‘lumot topilmadi."] = "Данные не найдены.";
    dictionary["Uchrashuvlar (Admin)"] = "Приёмы (Админ)";
    dictionary["Rejali uchrashuv qo'shish"] = "Создать запись";
    dictionary["Rejali uchrashuv qo‘shish"] = "Создать запись";
    dictionary["Filtrni tozalash"] = "Сбросить фильтр";
    dictionary["Stomatolog bo‘yicha filtrlangan"] = "Отфильтровано по стоматологу";
    dictionary["Jami:"] = "Итого:";
    dictionary["• Sahifa"] = "• Страница";

    // Warehouse RU
    dictionary["+ Yangi material"] = "+ Новый материал";
    dictionary["📦 Zaxira"] = "📦 Склад";
    dictionary["📋 Harakatlar tarixi"] = "📋 История операций";
    dictionary["Ko'rsatish:"] = "Показать:";
    dictionary["Ko‘rsatish:"] = "Показать:";
    dictionary["↻ Yangilash"] = "↻ Обновить";
    dictionary["Harakatlar tarixi topilmadi"] = "История операций не найдена";
    dictionary["Hali materiallar yo'q"] = "Материалов пока нет";
    dictionary["+ Birinchi materialni qo'shish"] = "+ Добавить первый материал";
    dictionary["Material nomi bo'yicha qidirish..."] = "Поиск по названию материала...";
    dictionary["Barchasi"] = "Все";
    dictionary["📦 Yangi material qo'shish"] = "📦 Добавить новый материал";
    dictionary["📦 Yangi material qo‘shish"] = "📦 Добавить новый материал";
    dictionary["✓ Qo'shish"] = "✓ Добавить";
    dictionary["✓ Qo‘shish"] = "✓ Добавить";
    dictionary["+ Kirim qilish"] = "+ Добавить приход";
    dictionary["− Chiqim qilish"] = "− Добавить расход";
    dictionary["✓ Saqlash"] = "✓ Сохранить";
    dictionary["Qo'shilmoqda..."] = "Добавление...";
    dictionary["Qo‘shilmoqda..."] = "Добавление...";
    dictionary["Kiritilmoqda..."] = "Ввод...";
    dictionary["Sarflanmoqda..."] = "Расход...";
    dictionary["Saqlanmoqda..."] = "Сохранение...";
    dictionary["Material nomi *"] = "Название материала *";
    dictionary["O'lchov birligi"] = "Единица измерения";
    dictionary["O‘lchov birligi"] = "Единица измерения";
    dictionary["Dona narxi (so'm)"] = "Цена за штуку (сум)";
    dictionary["Dona narxi (so‘m)"] = "Цена за штуку (сум)";
    dictionary["Min. qoldiq ogohlantirish"] = "Мин. остаток для предупреждения";
    dictionary["Min. qoldiq"] = "Мин. остаток";
    dictionary["Boshlang'ich qoldiq (ixtiyoriy)"] = "Начальный остаток (необязательно)";
    dictionary["Boshlang‘ich qoldiq (ixtiyoriy)"] = "Начальный остаток (необязательно)";
    dictionary["Masalan: Plomba, Novocaine, Stakan..."] = "Например: Пломба, Новокаин, Стакан...";
    dictionary["Masalan: Plomba, Novokain, Stakan..."] = "Например: Пломба, Новокаин, Стакан...";
    dictionary["Qo'shimcha ma'lumot..."] = "Дополнительная информация...";
    dictionary["Qo‘shimcha ma‘lumot..."] = "Дополнительная информация...";
    dictionary["Yangi material sotib olindi"] = "Куплен новый материал";
    dictionary["Zaxira to'ldirildi"] = "Пополнение запасов";
    dictionary["Zaxira to‘ldirildi"] = "Пополнение запасов";
    dictionary["Boshqadan olingan"] = "Получено из другого источника";
    dictionary["Boshqa sabab"] = "Другая причина";
    dictionary["Sababni tanlang..."] = "Выберите причину...";
    dictionary["Joriy qoldiq:"] = "Текущий остаток:";
    dictionary["Joriy qoldiq"] = "Текущий остаток";
    dictionary["Miqdor ("] = "Количество (";
    dictionary["Miqdor"] = "Количество";
    dictionary["Sotib olish narxi (dona uchun, ixtiyoriy)"] = "Цена покупки (за единицу, необязательно)";
    dictionary["Joriy narx:"] = "Текущая цена:";
    dictionary["Maks:"] = "Макс:";
    dictionary["Bemor ismi, muolaja turi..."] = "Имя пациента, тип лечения...";
    dictionary["Klinika sarfi uchun"] = "Для нужд клиники";
    dictionary["Sinib/yaroqsiz bo'ldi"] = "Сломано/непригодно";
    dictionary["Sinib/yaroqsiz bo‘lidi"] = "Сломано/непригодно";
    dictionary["Qidiruv bo'yicha topilmadi"] = "Ничего не найдено";
    dictionary["Qidiruv bo‘yicha topilmadi"] = "Ничего не найдено";

    // Login & Finance RU
    dictionary["Iltimos, tizimga kirish uchun ma'lumotlaringizni kiriting"] = "Пожалуйста, введите свои данные для входа в систему";
    dictionary["Iltimos, tizimga kirish uchun ma‘lumotlaringizni kiriting"] = "Пожалуйста, введите свои данные для входа в систему";
    dictionary["Admin tizimiga qaytish:"] = "Вход для администратора:";
    dictionary["Admin tizimiga o'tish"] = "Войти как администратор";
    dictionary["Admin tizimiga o‘tish"] = "Войти как администратор";
    dictionary["Stomatologlar uchun tizim:"] = "Вход для стоматологов:";
    dictionary["Stomatolog tizimiga o'tish"] = "Войти как стоматолог";
    dictionary["Stomatolog tizimiga o‘tish"] = "Войти как стоматолог";
    dictionary["OLINGAN OYLIK"] = "ПОЛУЧЕННАЯ ЗАРПЛАТА";
    dictionary["ISH HAQLARI"] = "НАЧИСЛЕНИЯ";
    dictionary["SABAB *"] = "ПРИЧИНА *";
    dictionary["Sabab *"] = "Причина *";

    // Extra RU keys for dropdowns & lists
    dictionary["So'nggi 3 kun"] = "Последние 3 дня";
    dictionary["So‘nggi 3 kun"] = "Последние 3 дня";
    dictionary["So'nggi 7 kun"] = "Последние 7 дней";
    dictionary["So‘nggi 7 kun"] = "Последние 7 дней";
    dictionary["Joriy oy"] = "Текущий месяц";
    dictionary["Joriy chorak"] = "Текущий квартал";
    dictionary["Joriy yil"] = "Текущий год";
    dictionary["Tanlangan oraliq"] = "Выбранный интервал";
    dictionary["Bemor bugun qabul qilindi"] = "Пациент принят сегодня";
    dictionary["Bugun qabul qilindi"] = "Принять сегодня";
    dictionary["To'lov qabul qilindi"] = "Оплата принята";
    dictionary["To‘lov qabul qilindi"] = "Оплата принята";
    dictionary["Rejali band qilish"] = "Забронировать";
    dictionary["Majburan yuborish"] = "Отправить принудительно";
    dictionary["Jonli yuborish"] = "Отправить в живую очередь";
    dictionary["(Bugun)"] = "(Сегодня)";

    // Treatments, Dentists List, Confirm Modal RU
    dictionary["To'lov so'rovlari"] = "Запросы на оплату";
    dictionary["To‘lov so‘rovlari"] = "Запросы на оплату";
    dictionary["Barcha qarzlar"] = "Все долги";
    dictionary["Qarzlari bor barcha davolashlar"] = "Все лечения с задолженностью";
    dictionary["Davolash yaratilgan:"] = "Лечение создано:";
    dictionary["Oxirgi to'lov:"] = "Последний платеж:";
    dictionary["Oxirgi to‘lov:"] = "Последний платеж:";
    dictionary["Umumiy:"] = "Всего:";
    dictionary["Qarz:"] = "Долг:";
    dictionary["Summani o'zgartirish"] = "Изменить сумму";
    dictionary["Summani o‘zgartirish"] = "Изменить сумму";
    dictionary["Tasdiqlash"] = "Подтвердить";
    dictionary["Qarzni eslatish"] = "Напомнить о долге";
    dictionary["* Sana/vaqt avtomatik saqlanadi"] = "* Дата/время сохраняются автоматически";
    dictionary["To'langan (qarz bor)"] = "Оплачено (есть долг)";
    dictionary["To‘langan (qarz bor)"] = "Оплачено (есть долг)";
    dictionary["To'lanmagan"] = "Не оплачено";
    dictionary["To‘lanmagan"] = "Не оплачено";
    dictionary["Jami qarz:"] = "Общий долг:";
    dictionary["Jami so'rov:"] = "Всего запросов:";
    dictionary["Jami so‘rov:"] = "Всего запросов:";
    dictionary["Hozircha stomatologdan to'lov so'rovi yo'q"] = "Пока нет запросов на оплату от стоматологов";
    dictionary["Hozircha stomatologdan to‘lov so‘rovi yo‘q"] = "Пока нет запросов на оплату от стоматологов";
    dictionary["Stomatologlar"] = "Стоматологи";
    dictionary["Klinika shifokorlari va mutaxassislarini boshqarish"] = "Управление врачами и специалистами клиники";
    dictionary["+ Yangi stomatolog qo'shish"] = "+ Добавить нового стоматолога";
    dictionary["+ Yangi stomatolog qo‘shish"] = "+ Добавить нового стоматолога";
    dictionary["HARAKATNI TASDIQLASH"] = "ПОДТВЕРЖДЕНИЕ ДЕЙСТВИЯ";
    dictionary["Ushbu harakatni tasdiqlash uchun administrator paroli va masul stomatolog paroli talab etiladi."] = "Для подтверждения этого действия требуется пароль администратора и пароль ответственного стоматолога.";
    dictionary["Ushbu harakatni tasdiqlash uchun administrator paroli va mas’ul stomatolog paroli talab etiladi."] = "Для подтверждения этого действия требуется пароль администратора и пароль ответственного стоматолога.";
    dictionary["ADMINISTRATOR PAROLI"] = "ПАРОЛЬ АДМИНИСТРАТОРА";
    dictionary["MASUL STOMATOLOG"] = "ОТВЕТСТВЕННЫЙ СТОМАТОЛОГ";
    dictionary["MAS’UL STOMATOLOG"] = "ОТВЕТСТВЕННЫЙ СТОМАТОЛОГ";
    dictionary["STOMATOLOG PAROLI"] = "ПАРОЛЬ СТОМАТОЛОГА";
    dictionary["Ortopedik stomatologiya"] = "Ортопедическая стоматология";
    dictionary["Parodontologiya"] = "Пародонтология";
    dictionary["Terapevtik stomatologiya"] = "Терапевтическая стоматология";
    dictionary["Terapivtik stomatologiya"] = "Терапевтическая стоматология";
    dictionary["Stomatologiya jarrohligi"] = "Хирургическая стоматология";
    dictionary["Stomatologiya Jarrohligi"] = "Хирургическая стоматология";
    dictionary["Jarrohlik stomatologiyasi"] = "Хирургическая стоматология";
    dictionary["Bolalar stomatologiyasi"] = "Детская стоматология";
    dictionary["Estetik stomatologiya"] = "Эстетическая стоматология";
    dictionary["Ortodontiya"] = "Ортодонтия";
    dictionary["Implantologiya"] = "Имплантология";

    // Extra RU keys for templates, errors, and actions
    dictionary["Stomatolog shablonlari"] = "Шаблоны стоматолога";
    dictionary["Tez-tez ishlatiladigan davolash yozuvlarini saqlang va qabulni yakunlashda bir bosishda qo‘llang."] = "Сохраняйте часто используемые записи о лечении и применяйте их одним кликом при завершении приема.";
    dictionary["Tez-tez ishlatiladigan davolash yozuvlarini saqlang va qabulni yakunlashda bir bosishda qo'llang."] = "Сохраняйте часто используемые записи о лечении и применяйте их одним кликом при завершении приема.";
    dictionary["Shablonni tahrirlash"] = "Редактировать шаблон";
    dictionary["Yangi shablon"] = "Новый шаблон";
    dictionary["Shablon nomi *"] = "Название шаблона *";
    dictionary["Narxi (so‘m)"] = "Цена (сум)";
    dictionary["Narxi (so'm)"] = "Цена (сум)";
    dictionary["Masalan: Karies davolash"] = "Например: Лечение кариеса";
    dictionary["Sevimli shablon sifatida belgilash"] = "Отметить как любимый шаблон";
    dictionary["Shablonni yangilash"] = "Обновить шаблон";
    dictionary["Shablonni saqlash"] = "Сохранить шаблон";
    dictionary["Saqlangan shablonlar"] = "Сохраненные шаблоны";
    dictionary["Nomi yoki mazmuni bo‘yicha qidirish"] = "Поиск по названию или содержанию";
    dictionary["Nomi yoki mazmuni bo'yicha qidirish"] = "Поиск по названию или содержанию";
    dictionary["Hozircha shablon yo‘q."] = "Шаблонов пока нет.";
    dictionary["Hozircha shablon yo'q."] = "Шаблонов пока нет.";
    dictionary["Sevimli"] = "Любимый";
    dictionary["Ishlatilgan:"] = "Использовано:";
    dictionary["marta"] = "раз";
    dictionary["Oxirgi:"] = "Последний:";
    dictionary["Tahrirlash"] = "Редактировать";
    dictionary["O‘chirilmoqda..."] = "Удаление...";
    dictionary["O'chirilmoqda..."] = "Удаление...";
    dictionary["O‘chirish"] = "Удалить";
    dictionary["O'chirish"] = "Удалить";
    dictionary["Shablonni o‘chirmoqchimisiz?"] = "Вы хотите удалить шаблон?";
    dictionary["Shablonni o'chirmoqchimisiz?"] = "Вы хотите удалить шаблон?";
    dictionary["Moliyaviy ma'lumotlarni yuklashda xatolik"] = "Ошибка при загрузке финансовых данных";
    dictionary["Moliyaviy ma‘lumotlarni yuklashda xatolik"] = "Ошибка при загрузке финансовых данных";
    dictionary["Serverga ulanib bo'lmadi"] = "Не удалось подключиться к серверу";
    dictionary["Serverga ulanib bo‘lmadi"] = "Не удалось подключиться к серверу";

    // Add Dentist Form RU
    dictionary["Ism majburiy."] = "Имя обязательно.";
    dictionary["Ism faqat harflardan iborat bo‘lishi kerak."] = "Имя должно состоять только из букв.";
    dictionary["Ism faqat harflardan iborat bo'lishi kerak."] = "Имя должно состоять только из букв.";
    dictionary["Telefon raqam majburiy."] = "Номер телефона обязателен.";
    dictionary["Telefon formati noto‘g‘ri: +998 (95) 123-45-67"] = "Неверный формат телефона: +998 (95) 123-45-67";
    dictionary["Telefon formati noto'g'ri: +998 (95) 123-45-67"] = "Неверный формат телефона: +998 (95) 123-45-67";
    dictionary["Email majburiy."] = "Email обязателен.";
    dictionary["Email formati noto‘g‘ri."] = "Неверный формат email.";
    dictionary["Email formati noto'g'ri."] = "Неверный формат email.";
    dictionary["Parol majburiy."] = "Пароль обязателен.";
    dictionary["Parol kamida 6 belgidan iborat bo‘lishi kerak."] = "Пароль должен содержать не менее 6 символов.";
    dictionary["Parol kamida 6 belgidan iborat bo'lishi kerak."] = "Пароль должен содержать не менее 6 символов.";
    dictionary["Jins tanlanishi kerak."] = "Необходимо выбрать пол.";
    dictionary["Tajriba (yil) majburiy."] = "Опыт работы (лет) обязателен.";
    dictionary["Tajriba 0 dan 50 yilgacha butun son bo‘lishi kerak."] = "Опыт работы должен быть целым числом от 0 до 50 лет.";
    dictionary["Tajriba 0 dan 50 yilgacha butun son bo'lishi kerak."] = "Опыт работы должен быть целым числом от 0 до 50 лет.";
    dictionary["Hech bo‘lmaganda bitta mutaxassislik tanlanishi kerak."] = "Необходимо выбрать как минимум одну специальность.";
    dictionary["Hech bo'lmaganda bitta mutaxassislik tanlanishi kerak."] = "Необходимо выбрать как минимум одну специальность.";
    dictionary["Ma'lumot / daraja majburiy."] = "Образование / степень обязательно.";
    dictionary["Ma‘lumot / daraja majburiy."] = "Образование / степень обязательно.";
    dictionary["Ma’lumoti / Darajasi majburiy."] = "Образование / степень обязательно.";
    dictionary["Iltimos, stomatolog haqida yozing."] = "Пожалуйста, напишите о стоматологе.";
    dictionary["Kamida 6 ta belgidan iborat bo‘lishi kerak."] = "Должно содержать не менее 6 символов.";
    dictionary["Kamida 6 ta belgidan iborat bo'lishi kerak."] = "Должно содержать не менее 6 символов.";
    dictionary["Rasm yuklash majburiy."] = "Загрузка изображения обязательна.";
    dictionary["Yuklanmoqda, iltimos kuting..."] = "Загрузка, пожалуйста, подождите...";
    dictionary["Yangi stomatolog muvaffaqiyatli qo‘shildi!"] = "Новый стоматолог успешно добавлен!";
    dictionary["Yangi stomatolog muvaffaqiyatli qo'shildi!"] = "Новый стоматолог успешно добавлен!";
    dictionary["Stomatologni saqlashda xatolik yuz berdi."] = "Произошла ошибка при сохранении стоматолога.";
    dictionary["Yangi Stomatolog Qo‘shish"] = "Добавить нового стоматолога";
    dictionary["Yangi Stomatolog Qo'shish"] = "Добавить нового стоматолога";
    dictionary["Quyidagi ma’lumotlarni to‘ldiring."] = "Заполните следующую информацию.";
    dictionary["Quyidagi ma'lumotlarni to'ldiring."] = "Заполните следующую информацию.";
    dictionary["Ism Sharif"] = "ФИО";
    dictionary["Masalan: Dr. Dilshoda Qodirova"] = "Например: Д-р Дильшода Кодирова";
    dictionary["Jins"] = "Пол";
    dictionary["Erkak"] = "Мужской";
    dictionary["Ayol"] = "Женский";
    dictionary["Tajriba (yil)"] = "Опыт работы (лет)";
    dictionary["Masalan: 5"] = "Например: 5";
    dictionary["Mutaxassislik(lar)"] = "Специальность(и)";
    dictionary["Bir nechta yo‘nalishni tanlash uchun Ctrl (yoki Mac’da Cmd) tugmasini bosing."] = "Для выбора нескольких направлений зажмите Ctrl (или Cmd на Mac).";
    dictionary["Bir nechta yo'nalishni tanlash uchun Ctrl (yoki Mac'da Cmd) tugmasini bosing."] = "Для выбора нескольких направлений зажмите Ctrl (или Cmd на Mac).";
    dictionary["Ma’lumoti / Darajasi"] = "Образование / Степень";
    dictionary["Ma'lumoti / Darajasi"] = "Образование / Степень";
    dictionary["Masalan: Tibbiyot doktori"] = "Например: Доктор медицинских наук";
    dictionary["Stomatolog haqida"] = "О стоматологе";
    dictionary["Mutaxassis haqida batafsil..."] = "Подробнее о специалисте...";

    // Navbar links RU
    dictionary["Boshqaruv"] = "Управление";
    dictionary["Uchrashuvlar"] = "Приёмы";
    dictionary["To'lovlar"] = "Платежи";
    dictionary["Shablonlar"] = "Шаблоны";
    dictionary["Bemorlar"] = "Пациенты";
    dictionary["Sozlamalar"] = "Настройки";

    // Services Catalog Page RU
    dictionary["Xizmatlar Katalogi"] = "Каталог услуг";
    dictionary["Klinika xizmatlari, narxlari va to'lov tartibini boshqaring"] = "Управление услугами, ценами и порядком оплаты клиники";
    dictionary["Faol xizmatlar"] = "Активных услуг";
    dictionary["Oldindan to'lov"] = "Предоплата";
    dictionary["Keyin to'lov"] = "Оплата после";
    dictionary["Barcha kategoriyalar"] = "Все категории";
    dictionary["Barcha vaqtlar"] = "Все варианты";
    dictionary["Oldindan"] = "Предоплата";
    dictionary["Keyin"] = "После";
    dictionary["Noaktivlar"] = "Неактивные";
    dictionary["+ Xizmat qo'shish"] = "+ Добавить услугу";
    dictionary["Qidirish..."] = "Поиск...";
    dictionary["Kod"] = "Код";
    dictionary["Nomi"] = "Название";
    dictionary["Narx"] = "Цена";
    dictionary["To'lov vaqti"] = "Время оплаты";
    dictionary["Holat"] = "Статус";
    dictionary["Amallar"] = "Действия";
    dictionary["Xizmat topilmadi"] = "Услуга не найдена";
    dictionary["Birinchi xizmatni qo'shing →"] = "Добавьте первую услугу →";
    dictionary["✓ Faol"] = "✓ Активна";
    dictionary["✕ Noaktiv"] = "✕ Неактивна";
    dictionary["Yangi xizmat qo'shish"] = "Добавить новую услугу";
    dictionary["Xizmatni tahrirlash"] = "Редактировать услугу";
    dictionary["Xizmat nomi *"] = "Название услуги *";
    dictionary["Ruscha nomi"] = "Название на русском";
    dictionary["Inglizcha nomi"] = "Название на английском";
    dictionary["Narx (so'm)"] = "Цена (сум)";
    dictionary["⏳ Davolagandan keyin"] = "⏳ После лечения";
    dictionary["⚡ Oldindan to'lov"] = "⚡ Предоплата";
    dictionary["⚡ Bemor navbatga qo'shilishdan OLDIN to'lov qilishi shart. Kassir yoki qabulxona qabul qiladi."] = "⚡ Пациент должен оплатить ДО записи в очередь. Принимает кассир или регистратура.";
    dictionary["⏳ Bemor davolanib bo'lgandan so'ng to'lov qiladi (joriy tartib)."] = "⏳ Пациент оплачивает после лечения (текущий порядок).";
    dictionary["Xizmat ko'rsatadigan shifokorlar"] = "Врачи, оказывающие услугу";
    dictionary["Faol shifokorlar topilmadi"] = "Активных врачей не найдено";
    dictionary["Xizmat faol"] = "Услуга активна";
    dictionary["Saqlanmoqda..."] = "Сохранение...";
    dictionary["Saqlash"] = "Сохранить";
    dictionary["Bekor qilish"] = "Отмена";
    dictionary["Xizmatni o'chirish"] = "Удалить услугу";
    dictionary["Ha, o'chirish"] = "Да, удалить";
    dictionary["xizmatini deaktivatsiya qilmoqchimisiz?"] = "деактивировать?";
    dictionary["Masalan: Dastlabki konsultatsiya"] = "Например: Первичная консультация";
    dictionary["Konsultatsiya"] = "Консультация";
    dictionary["Davolash"] = "Лечение";
    dictionary["Protsedura"] = "Процедура";
    dictionary["Laboratoriya"] = "Лаборатория";
    dictionary["Xizmatlarni yuklashda xatolik"] = "Ошибка загрузки услуг";
    dictionary["Xizmat nomi talab qilinadi"] = "Название услуги обязательно";
    dictionary["Xizmat o'chirildi"] = "Услуга удалена";
    dictionary["O'chirishda xatolik"] = "Ошибка при удалении";

    // Patients Page RU
    dictionary["Admin bemor ma'lumotlarini tahrirlashi mumkin."] = "Администратор может редактировать данные пациентов.";
    dictionary["Qidirish: B-ID, ism yoki telefon"] = "Поиск: B-ID, имя или телефон";
    dictionary["+ Bemor"] = "+ Пациент";
    dictionary["Telefon yo'q"] = "Нет телефона";
    dictionary["· Oxirgi kelish:"] = "· Последний визит:";
    dictionary["Qarz"] = "Долг";
    dictionary["Bemor topilmadi"] = "Пациент не найден";

    // DentistDetails Page RU
    dictionary["Rentgenologiya"] = "Рентгенология";
    dictionary["Telegram allaqachon ulangan"] = "Telegram уже подключен";
    dictionary["Telegramni haqiqatdan ham uzmoqchimisiz?"] = "Вы действительно хотите отключить Telegram?";
    dictionary["Telegram ulanish havolasini yaratib bo'lmadi"] = "Не удалось создать ссылку для подключения Telegram";

    // Treatments / PaymentBadge RU
    dictionary["To'liq to'langan"] = "Полностью оплачено";

    // DentistDetails extra RU
    dictionary["Stomatolog akkaunti (Admin tahriri)"] = "Аккаунт стоматолога (редактирование админом)";
    dictionary["Arxivda"] = "В архиве";
    dictionary["Faol"] = "Активный";
    dictionary["Arxivdan chiqarish"] = "Восстановить из архива";
    dictionary["Arxivga o'tkazish"] = "Перевести в архив";
    dictionary["Telegram Bot ulanishi"] = "Подключение Telegram бота";
    dictionary["Telegram faol ulandi"] = "Telegram активно подключён";
    dictionary["Telegram bot hali ulanmagan. Skanerlash uchun QR kod generatsiya qiling."] = "Telegram-бот ещё не подключён. Сгенерируйте QR-код для сканирования.";
    dictionary["Telegramni uzish"] = "Отключить Telegram";
    dictionary["Yaratilmoqda..."] = "Создание...";
    dictionary["Telegram QR/havolasini olish"] = "Получить QR-код/ссылку Telegram";
    dictionary["Rasmni yangilash"] = "Обновить фото";
    dictionary["← Orqaga"] = "← Назад";
    dictionary["Topilmadi"] = "Не найдено";
    dictionary["Bir nechta tanlash uchun"] = "Для выбора нескольких";
    dictionary["Mutaxassis Telegramga ulanishi"] = "Подключение специалиста к Telegram";
    dictionary["Akkaunt saqlandi"] = "Аккаунт сохранён";
    dictionary["Akkauntni yuklashda xatolik"] = "Ошибка загрузки аккаунта";
    dictionary["Holat yangilandi"] = "Статус обновлён";
    dictionary["Iltimos, formani to'g'ri to'ldiring"] = "Пожалуйста, правильно заполните форму";
    dictionary["Telefon majburiy."] = "Телефон обязателен.";
    dictionary["Telegram bog'lanishi muvaffaqiyatli uzildi!"] = "Telegram успешно отключён!";
    dictionary["Telegram muvaffaqiyatli ulandi!"] = "Telegram успешно подключён!";
    dictionary["Telegramni uzib bo'lmadi"] = "Не удалось отключить Telegram";

    // AddReceptionist / AddCashier / Staff Pages RU
    dictionary["Qabulxona xodimi qo'shish"] = "Добавить регистратора";
    dictionary["Qabulxona xodimi muvaffaqiyatli qo'shildi"] = "Регистратор успешно добавлен";
    dictionary["Ro'yxatdagi qabulxona xodimlari"] = "Список регистраторов";
    dictionary["Qabulxona ID & Ismi"] = "ИД регистратора и имя";
    dictionary["Aloqa"] = "Контакт";
    dictionary["Holati"] = "Статус";
    dictionary["Harakat"] = "Действие";
    dictionary["Faollashtirish"] = "Активировать";
    dictionary["Bloklash"] = "Заблокировать";
    dictionary["F.I.O"] = "Ф.И.О.";
    dictionary["Telefon raqami"] = "Номер телефона";
    dictionary["Login (Elektron pochta)"] = "Логин (Эл. почта)";
    dictionary["Registrator (qabulxona xodimi) tomonidan amalga oshirilgan ishlar auditi"] = "Аудит действий регистратора";
    dictionary["Ro'yxatga olgan bemorlari"] = "Зарегистрированных пациентов";
    dictionary["Bron qilgan uchrashuvlari"] = "Забронированных приёмов";
    dictionary["Yaratilgan vaqt:"] = "Время создания:";
    dictionary["Bemorlar bo'limi"] = "Пациенты";
    dictionary["Uchrashuvlar bo'limi"] = "Приёмы";
    dictionary["Uchrashuvlar topilmadi"] = "Приёмы не найдены";
    dictionary["Uchrashuvlar topilmadi."] = "Приёмы не найдены.";
    dictionary["Bemorlar topilmadi"] = "Пациенты не найдены";
    dictionary["Bemorlar topilmadi."] = "Пациенты не найдены.";
    dictionary["Faol"] = "Активный";
    dictionary["Bloklangan"] = "Заблокирован";
    dictionary["Kassirlar"] = "Кассиры";
    dictionary["Kassir qo'shish"] = "Добавить кассира";
    dictionary["Kassir muvaffaqiyatli qo'shildi"] = "Кассир успешно добавлен";
    dictionary["Qidiruv..."] = "Поиск...";

    // More missing strings
    dictionary["Kechiring, xatolik yuz berdi"] = "Извините, произошла ошибка";
    dictionary["Serverda xatolik"] = "Ошибка сервера";
    dictionary["Saqlandi"] = "Сохранёно";
    dictionary["Xatolik"] = "Ошибка";
    dictionary["Yuklanmoqda..."] = "Загрузка...";
    dictionary["Hali ma'lumot yo'q"] = "Данных пока нет";
    dictionary["Band"] = "Занят";
    dictionary["Bo'sh"] = "Свободно";
    dictionary["Bekor qilindi"] = "Отменёно";
    dictionary["Kelmadi"] = "Не явился";
    dictionary["Kutilmoqda"] = "Ожидается";
    dictionary["Qabulda"] = "На приёме";
    dictionary["Yakunlandi"] = "Завершёно";

    // ─── Dashboard Page RU ───────────────────────────────────────────────────
    dictionary["Admin boshqaruv paneli"] = "Панель управления";
    dictionary["bo'yicha ko'rsatkichlar"] = "показатели за";
    dictionary["To'lov:"] = "Оплата:";
    dictionary["Qarz:"] = "Долг:";
    dictionary["so'm"] = "сум";
    dictionary["Filtrlar"] = "Фильтры";
    dictionary["Davr va stomatolog bo'yicha statistikani boshqaring"] = "Управляйте статистикой по периодам и стоматологам";
    dictionary["Filtrni tozalash"] = "Сбросить фильтр";
    dictionary["Filtrlarni yopish"] = "Закрыть фильтры";
    dictionary["Filtrlarni ochish"] = "Открыть фильтры";
    dictionary["Davr"] = "Период";
    dictionary["Bugun"] = "Сегодня";
    dictionary["7 kun"] = "7 дней";
    dictionary["Oy"] = "Месяц";
    dictionary["Boshlanish"] = "Начало";
    dictionary["Tugash"] = "Конец";
    dictionary["Barcha stomatologlar"] = "Все стоматологи";
    dictionary["* Stomatolog tanlasangiz, barcha KPI shu stomatologga filtrlanadi"] = "* При выборе стоматолога все KPI будут отфильтрованы по нему";
    dictionary["Qo'llash"] = "Применить";
    dictionary["Excel eksport"] = "Экспорт в Excel";
    dictionary["Stomatolog bo'yicha filtrlangan"] = "Отфильтровано по стоматологу";
    // Stat cards
    dictionary["Stomatologlar"] = "Стоматологи";
    dictionary["Ro'yxatni ochish"] = "Открыть список";
    dictionary["Bemorlar (davr)"] = "Пациенты (период)";
    dictionary["Davr bo'yicha (muolajalar asosida)"] = "За период (на основе процедур)";
    dictionary["Tashriflar (davr)"] = "Визиты (период)";
    dictionary["Qabullar ro'yxatini ochish"] = "Открыть список приёмов";
    dictionary["Tushum (davr)"] = "Выручка (период)";
    dictionary["To'lovlar / qarzlarni ko'rish"] = "Посмотреть платежи / долги";
    dictionary["To'lov"] = "Оплата";
    dictionary["Qarz"] = "Долг";
    // Analytics section
    dictionary["Tahliliy ko'rsatkichlar"] = "Аналитические показатели";
    dictionary["Tezkor tahlil: eng yaxshi natijalar va risklar"] = "Быстрый анализ: лучшие результаты и риски";
    dictionary["Yangilash"] = "Обновить";
    dictionary["Eng yuqori tushum (stomatolog)"] = "Наибольшая выручка (стоматолог)";
    dictionary["Ma'lumot yo'q"] = "Нет данных";
    dictionary["Tashrif:"] = "Визит:";
    dictionary["Bemor:"] = "Пациент:";
    dictionary["Ko'rish"] = "Смотреть";
    dictionary["Eng katta qarz (stomatolog)"] = "Наибольший долг (стоматолог)";
    dictionary["To'lov:"] = "Оплата:";
    dictionary["Tushum:"] = "Выручка:";
    dictionary["To'lovlar"] = "Платежи";
    dictionary["Klinika to'lov darajasi"] = "Уровень оплаты клиники";
    // Finance block
    dictionary["Moliyaviy blok"] = "Финансовый блок";
    dictionary["Davr bo'yicha umumiy ko'rsatkichlar"] = "Общие финансовые показатели за период";
    dictionary["Umumiy summa"] = "Общая сумма";
    dictionary["Tushum"] = "Выручка";
    dictionary["Xavf mavjud"] = "Есть риск";
    dictionary["Muammo yo'q"] = "Нет проблем";
    // Plan section
    dictionary["Reja"] = "План";
    dictionary["Uchrashuvlar va tashriflar"] = "Приёмы и визиты";
    dictionary["Rejalashtirilgan uchrashuvlar"] = "Запланированные приёмы";
    dictionary["Qabullar"] = "Приёмы";
    dictionary["Tashriflar (muolajalar)"] = "Визиты (процедуры)";
    dictionary["Muolajalar"] = "Процедуры";
    // Dentist KPI table
    dictionary["Stomatologlar bo'yicha ko'rsatkichlar"] = "Показатели по стоматологам";
    dictionary["Klinik KPI: tashriflar (muolajalar), bemorlar, tushum, qarz va to'lov foizi"] = "Клинический KPI: визиты (процедуры), пациенты, выручка, долг и процент оплаты";
    dictionary["Qidirish: ism..."] = "Поиск имя...";
    dictionary["Tushum bo'yicha"] = "По выручке";
    dictionary["Tashrif bo'yicha"] = "По визитам";
    dictionary["Bemor bo'yicha"] = "По пациентам";
    dictionary["Qarz bo'yicha"] = "По долгу";
    dictionary["Tashrif"] = "Визиты";
    dictionary["Bemor"] = "Пациенты";
    dictionary["Uchrashuv"] = "Приёмы";
    dictionary["Tushum"] = "Выручка";
    dictionary["Amal"] = "Действие";
    dictionary["Filtrlash"] = "Фильтровать";
    dictionary["Akkaunt"] = "Аккаунт";
    dictionary["Ma'lumot topilmadi."] = "Данные не найдены.";
    dictionary["Jami:"] = "Итого:";
    dictionary["Sahifa"] = "Страница";
    // RANGE_OPTIONS labels
    dictionary["So'nggi 3 kun"] = "3 дня";
    dictionary["So'nggi 7 kun"] = "7 дней";
    dictionary["Joriy oy"] = "Текущий месяц";
    dictionary["Joriy chorak"] = "Текущий квартал";
    dictionary["Joriy yil"] = "Текущий год";
    dictionary["Tanlangan oraliq"] = "Выбранный диапазон";
    dictionary["Barcha vaqt"] = "Всё время";
    // Statistika error
    dictionary["Statistikani yuklashda xatolik"] = "Ошибка загрузки статистики";

    // AllAppointments Page RU
    dictionary["Uchrashuvlar (Admin)"] = "Приёмы (Админ)";
    dictionary["+ Rejali uchrashuv qo'shish"] = "+ Создать запись";
    dictionary["Hammasi"] = "Все";
    dictionary["Bugun"] = "Сегодня";
    dictionary["Kutilmoqda"] = "Ожидается";
    dictionary["To‘langan"] = "Оплачено";
    dictionary["To'langan"] = "Оплачено";
    dictionary["Bekor qilingan"] = "Отменено";
    dictionary["Kelmagan"] = "Не явился";
    dictionary["Bemor / telefon / stomatolog"] = "Пациент / телефон / стоматолог";
    dictionary["Oxirgi to'lov"] = "Последняя оплата";
    dictionary["Oxirgi to‘lov"] = "Последняя оплата";
    dictionary["Harakatlar"] = "Операции";
    dictionary["To‘lov tasdiqlanishi kutilmoqda"] = "Ожидает подтверждения оплаты";
    dictionary["To'lov tasdiqlanishi kutilmoqda"] = "Ожидает подтверждения оплаты";
    dictionary["Maxfiy infeksion belgi bor"] = "Есть скрытый инфекционный маркер";
    dictionary["Bugun qabul qilindi"] = "Принять сегодня";
    dictionary["Qabul qilinmoqda"] = "На приёме";
    dictionary["Arxivda"] = "В архиве";

    // LiveDentistsBar / WalkInModal / Telegram Patient RU
    dictionary["Stomatologlar holati"] = "Статус стоматологов";
    dictionary["Navbat"] = "Очередь";
    dictionary["Keladi"] = "Явились";
    dictionary["Qabul qilingan"] = "Принято";
    dictionary["Keyingi bemor:"] = "Следующий пациент:";
    dictionary["Keyingi bemor"] = "Следующий пациент";
    dictionary["Majburan yuborish"] = "Отправить принудительно";
    dictionary["Jonli yuborish"] = "Отправить в живую очередь";
    dictionary["Rejali band qilish"] = "Забронировать";
    dictionary["Hozircha stomatologlar topilmadi."] = "Стоматологи пока не найдены.";
    dictionary["Bemor qidirish sozlanmagan"] = "Поиск пациентов не настроен";
    dictionary["Bu telefon raqam bilan bir nechta bemor topildi. Ro‘yxatdan aniq bemorni tanlang."] = "Найдено несколько пациентов с этим номером. Выберите конкретного пациента.";
    dictionary["Bemor topilmasa, forma orqali yangi bemor yarating."] = "Если пациент не найден, создайте нового с помощью формы.";
    dictionary["Yangi bemor uchun ism, telefon va tug‘ilgan sana majburiy"] = "Имя, телефон и дата рождения обязательны для нового пациента";
    dictionary["Bemor yaratish funksiyasi ulanmagan"] = "Функция создания пациента не подключена";
    dictionary["Ism sharif • qidirilmoqda"] = "Имя и фамилия • поиск";
    dictionary["Avval tanlangan bemorni tozalang"] = "Сначала очистите выбранного пациента";
    dictionary["Formani ochish"] = "Открыть форму";
    dictionary["Mavjud bemor tanlangan. Yangi bemor yaratish uchun avval tanlovni tozalang yoki boshqa qidiruv kiriting."] = "Выбран существующий пациент. Чтобы создать нового, сначала очистите выбор.";
    dictionary["Tanlanmagan"] = "Не выбран";
    dictionary["Erkak"] = "Мужчина";
    dictionary["Ayol"] = "Женщина";
    dictionary["Shahar / tuman"] = "Город / район";
    dictionary["Mahalla / ko‘cha"] = "Махалля / улица";
    dictionary["Yuborilmoqda..."] = "Отправка...";

    // Treatments / ChangeAmountModal RU
    dictionary["Hozircha qarzdor davolash yo'q"] = "Пока нет лечений с задолженностью";
    dictionary["Hozircha qarzdor davolash yo‘q"] = "Пока нет лечений с задолженностью";
    dictionary["Dentist so'rovi:"] = "Запрос стоматолога:";
    dictionary["Dentist so‘rovi:"] = "Запрос стоматолога:";
    dictionary["Batafsil"] = "Подробнее";
    dictionary["Yopish"] = "Закрыть";
    dictionary["Izoh (ixtiyoriy) — masalan: qarzning 2-qismi"] = "Примечание (необязательно) — например: 2-я часть долга";
    dictionary["Qarzni eslatish"] = "Напомнить о долге";
    dictionary["Bemorga Telegram orqali qarz to'lovi haqida eslatma yubormoqchimisiz?"] = "Вы хотите отправить пациенту напоминание о долге через Telegram?";
    dictionary["Bemorga Telegram orqali qarz to‘lovi haqida eslatma yubormoqchimisiz?"] = "Вы хотите отправить пациенту напоминание о долге через Telegram?";
    dictionary["Diagnos"] = "Диагноз";
    dictionary["Ishlangan tish(lar)"] = "Обработанный зуб(ы)";
    dictionary["Bajarilgan ishlar"] = "Выполненные работы";
    dictionary["Keyingi qadam"] = "Следующий шаг";
    dictionary["Dorilar"] = "Медикаменты";
    dictionary["Eslatma"] = "Примечание";
    dictionary["Keyingi ko'rik"] = "Следующий осмотр";
    dictionary["Keyingi ko‘rik"] = "Следующий осмотр";
    dictionary["To'lovlar tarixi"] = "История платежей";
    dictionary["To‘lovlar tarixi"] = "История платежей";
    dictionary["To'lovlar yo'q"] = "Нет платежей";
    dictionary["To‘lovlar yo‘q"] = "Нет платежей";
    dictionary["X-ray / Rentgen rasmlari"] = "Рентген снимки";
    dictionary["Rasm yo'q"] = "Нет снимков";
    dictionary["Rasm yo‘q"] = "Нет снимков";
    dictionary["To'lovlar tarixi yo'q"] = "История платежей отсутствует";
    dictionary["To‘lovlar tarixi yo‘q"] = "История платежей отсутствует";
    dictionary["Summa o'zgarishlari tarixi"] = "История изменений суммы";
    dictionary["Summa o‘zgarishlari tarixi"] = "История изменений суммы";
    dictionary["Summa o'zgarishlari yo'q"] = "Изменений суммы не было";
    dictionary["Summa o‘zgarishlari yo‘q"] = "Изменений суммы не было";
    dictionary["Sabab:"] = "Причина:";
    dictionary["Stomatolog tasdig'i:"] = "Подтверждение стоматолога:";
    dictionary["Stomatolog tasdig‘i:"] = "Подтверждение стоматолога:";
    dictionary["Summani tuzatish"] = "Корректировка суммы";
    dictionary["Joriy summa:"] = "Текущая сумма:";
    dictionary["Allaqachon to'langan:"] = "Уже оплачено:";
    dictionary["Allaqachon to‘langan:"] = "Уже оплачено:";
    dictionary["1. Admin"] = "1. Админ";
    dictionary["2. Stomatolog"] = "2. Стоматолог";
    dictionary["3. Yangi summa"] = "3. Новая сумма";
    dictionary["Admin paroli"] = "Пароль админа";
    dictionary["Admin parolini kiriting"] = "Введите пароль админа";
    dictionary["Stomatolog paroli"] = "Пароль стоматолога";
    dictionary["Stomatolog parolini kiriting"] = "Введите пароль стоматолога";
    dictionary["Admin telefon orqali stomatolog bilan aniqlashtirgandan keyin kiritadi."] = "Админ вводит пароль после уточнения со стоматологом по телефону.";
    dictionary["Yangi summa"] = "Новая сумма";
    dictionary["Masalan: 250000"] = "Например: 250000";
    dictionary["Yangi summa noto'g'ri"] = "Некорректная новая сумма";
    dictionary["Yangi summa noto‘g‘ri"] = "Некорректная новая сумма";
    dictionary["Yangi summa allaqachon to'langan summadan kichik bo'lishi mumkin emas"] = "Новая сумма не может быть меньше уже оплаченной суммы";
    dictionary["Yangi summa allaqachon to‘langan summadan kichik bo‘lishi mumkin emas"] = "Новая сумма не может быть меньше уже оплаченной суммы";
    dictionary["O'zgartirish sababi"] = "Причина изменения";
    dictionary["O‘zgartirish sababi"] = "Причина изменения";
    dictionary["Masalan: stomatolog summani noto'g'ri kiritgan, rentgen summasi qo'shilmagan"] = "Например: стоматолог ввел неверную сумму, не добавлена сумма за рентген";
    dictionary["Masalan: stomatolog summani noto‘g‘ri kiritgan, rentgen summasi qo‘shilmagan"] = "Например: стоматолог ввел неверную сумму, не добавлена сумма за рентген";
    dictionary["Sababni kiriting"] = "Введите причину";
    dictionary["Orqaga"] = "Назад";
    dictionary["Davom etish"] = "Продолжить";

    // Staff creation error messages RU
    dictionary["Barcha maydonlar to‘ldirilishi shart"] = "Все поля обязательны к заполнению";
    dictionary["G'aznachi muvaffaqiyatli qo‘shildi"] = "Кассир успешно добавлен";
    dictionary["G'aznachi qo‘shish"] = "Добавить кассира";
    dictionary["G'aznachini saqlash"] = "Сохранить кассира";
    dictionary["Ro‘yxatdagi g'aznachilar"] = "Список кассиров";
    dictionary["Hozircha hech qanday g'aznachi qo‘shilmagan."] = "Кассиры пока не добавлены.";
    dictionary["Ism faqat harflardan iborat bo‘lishi kerak."] = "Имя должно состоять только из букв.";
    dictionary["Telefon formati noto‘g‘ri: +998 (95) 123-45-67"] = "Неверный формат телефона: +998 (95) 123-45-67";
    dictionary["Email formati noto‘g‘ri."] = "Неверный формат электронной почты.";
    dictionary["Parol kamida 6 belgidan iborat bo‘lishi kerak."] = "Пароль должен содержать не менее 6 символов.";
    dictionary["Tajriba 0 dan 50 yilgacha butun son bo‘lishi kerak."] = "Опыт работы должен быть целым числом от 0 до 50 лет.";
    dictionary["Hech bo‘lmaganda bitta mutaxassislik tanlanishi kerak."] = "Необходимо выбрать хотя бы одну специальность.";
    dictionary["Kamida 6 ta belgidan iborat bo‘lishi kerak."] = "Должно быть не менее 6 символов.";
    dictionary["Yangi stomatolog muvaffaqiyatli qo‘shildi!"] = "Новый стоматолог успешно добавлен!";
    dictionary["Yangi Stomatolog Qo‘shish"] = "Добавить нового стоматолога";
    dictionary["Quyidagi ma’lumotlarni to‘ldiring."] = "Заполните следующую информацию.";
    dictionary["Bir nechta yo‘nalishni tanlash uchun <b>Ctrl</b> (yoki Mac’da"] = "Для выбора нескольких специальностей используйте <b>Ctrl</b> (или на Mac";
    dictionary["Qo‘shilmoqda..."] = "Добавление...";
    dictionary["Ism, telefon va tug‘ilgan sana majburiy"] = "Имя, телефон и дата рождения обязательны";
    dictionary["Bemor login sahifasida <b>ism</b>, <b>telefon raqam</b> va <b>DOB</b> orqali parol o‘rnatadi"] = "Пациент устанавливает пароль на странице входа, используя <b>имя</b>, <b>номер телефона</b> и <b>дату рождения</b>";
    dictionary["Mahalla / Ko‘cha"] = "Махалля / Улица";
    dictionary["Qo‘shimcha qabulxonalar boshqaruvi"] = "Управление регистратурой";
    dictionary["Qabulxonani saqlash"] = "Сохранить регистратора";
    dictionary["Hozircha qo‘shimcha qabulxona xodimlari qo‘shilmagan."] = "Регистраторы пока не добавлены.";

    // PatientModal Page RU
    dictionary["Tahrirlash uchun parolni kiriting."] = "Введите пароль для редактирования.";
    dictionary["Kirish"] = "Войти";
    dictionary["Maxfiy infeksion belgilar"] = "Скрытые инфекционные маркеры";
    dictionary["Belgilanmagan"] = "Не указано";
    dictionary["Chaqirildi"] = "Вызван";
    dictionary["Tugallangan"] = "Завершено";
    dictionary["Ortodont nazorat ma'lumoti"] = "Данные ортодонтического контроля";
    dictionary["Ortodont nazorat ma‘lumoti"] = "Данные ортодонтического контроля";
    dictionary["Navbat raqami:"] = "Номер очереди:";
    dictionary["Maqsad:"] = "Цель:";
    dictionary["Birinchi tashrif:"] = "Первый визит:";
    dictionary["Yo‘q"] = "Нет";
    dictionary["Yo'q"] = "Нет";
    dictionary["Ha"] = "Да";
    dictionary["Keyingi nazorat:"] = "Следующий контроль:";
    dictionary["Keyingi nazorat sanasi:"] = "Дата следующего контроля:";
    dictionary["Navbatga qo‘shilgan:"] = "Добавлен в очередь:";
    dictionary["Navbatga qo'shilgan:"] = "Добавлен в очередь:";
    dictionary["Chaqirilgan:"] = "Вызван:";
    dictionary["Tugatildi:"] = "Завершено:";
    dictionary["Jarayon rasmlari:"] = "Фотографии процесса:";
    dictionary["To'langan:"] = "Оплачено:";
    dictionary["To‘langan:"] = "Оплачено:";
    dictionary["To'lov:"] = "Оплата:";
    dictionary["To‘lov:"] = "Оплата:";
    dictionary["Telegram bot ulanmagan"] = "Telegram-бот не подключен";
    dictionary["Telegram ulangan"] = "Telegram подключен";
    dictionary["QR kod orqali bog‘lang"] = "Подключите через QR-код";
    dictionary["Ulanishni uzish"] = "Отключить";
    dictionary["Telegramni ulash"] = "Подключить Telegram";
    dictionary["Tayyorlanmoqda..."] = "Подготовка...";
    dictionary["Bemor ma’lumotlarini tahrirlash"] = "Редактирование данных пациента";
    dictionary["Ism, telefon, manzil, allergiya va boshqa ma’lumotlarni shu yerda yangilang."] = "Обновите имя, телефон, адрес, аллергии и другие данные здесь.";
    dictionary["Ism va familiya"] = "Имя и фамилия";
    dictionary["Jinsi"] = "Пол";
    dictionary["Manzil"] = "Адрес";
    dictionary["Allergiya"] = "Аллергия";
    dictionary["Tibbiy ogohlantirish"] = "Медицинское предупреждение";
    dictionary["Ortodont nazorat"] = "Контроль ортодонта";
    dictionary["Qabul va davolash tarixi"] = "История приёмов и лечения";
    dictionary["Shablon:"] = "Шаблон:";
    dictionary["Diagnos:"] = "Диагноз:";
    dictionary["Tishlar:"] = "Зубы:";
    dictionary["Muolajalar:"] = "Процедуры:";
    dictionary["Keyingi reja:"] = "Следующий план:";
    dictionary["Dorilar:"] = "Медикаменты:";
    dictionary["Eslatma:"] = "Примечание:";
    dictionary["Keyingi qabul:"] = "Следующий приём:";
    dictionary["Qabul summasi:"] = "Сумма приёма:";
    dictionary["Qolgan qarz:"] = "Оставшийся долг:";
    dictionary["Status:"] = "Статус:";
    dictionary["Yaratilgan:"] = "Создано:";
    dictionary["To‘lovlar:"] = "Платежи:";
    dictionary["To'lovlar:"] = "Платежи:";
    dictionary["Summa o‘zgarishlari:"] = "Изменения суммы:";
    dictionary["Summa o'zgarishlari:"] = "Изменения суммы:";
    dictionary["Kim o‘zgartirdi:"] = "Кто изменил:";
    dictionary["Kim o'zgartirdi:"] = "Кто изменил:";
    dictionary["Rentgenlar:"] = "Рентген снимки:";

    // Warehouse, Finance, Login RU
    dictionary["Olingan Oylik & Ish haqilari"] = "ПОЛУЧЕННАЯ ЗАРПЛАТА И НАЧИСЛЕНИЯ";
    dictionary["+ Kirim"] = "+ Приход";
    dictionary["- Chiqim"] = "- Расход";
    dictionary["− Chiqim"] = "- Расход";
    dictionary["Yangi material"] = "Новый материал";
    dictionary["Parolingiz"] = "Ваш пароль";
    dictionary["Admin"] = "Администратор";
    dictionary["Dan"] = "С";
    dictionary["Gacha"] = "По";
    dictionary["Hafta"] = "Неделя";
    dictionary["Tushgan Pullar (Maosh)"] = "Полученные деньги (зарплата)";
    dictionary["Jami to'langan ish haqilari"] = "Всего выплачено зарплат";
    dictionary["Jami to‘langan ish haqilari"] = "Всего выплачено зарплат";
    dictionary["Sarflangan Materiallar"] = "Израсходованные материалы";
    dictionary["Olingan sarf materiallari qiymati"] = "Стоимость израсходованных материалов";
    dictionary["Sof Foyda (Balans)"] = "Чистая прибыль (баланс)";
    dictionary["Oylik minus xarajatlar qoldig'i"] = "Остаток зарплаты за вычетом расходов";
    dictionary["Oylik minus xarajatlar qoldig‘i"] = "Остаток зарплаты за вычетом расходов";
    dictionary["To'lovlar tarixi topilmadi"] = "История платежей не найдена";
    dictionary["To‘lovlar tarixi topilmadi"] = "История платежей не найдена";
    dictionary["Sana"] = "Дата";
    dictionary["Summa"] = "Сумма";
    dictionary["Izoh"] = "Примечание";
    dictionary["Oylik komissiya to'lovi"] = "Ежемесячная комиссионная выплата";
    dictionary["Oylik komissiya to‘lovi"] = "Ежемесячная комиссионная выплата";
    dictionary["Jami"] = "Итого";
    dictionary["Sarflangan Materiallar (Xarajat)"] = "Израсходованные материалы (расход)";
    dictionary["Xarajatlar tarixi topilmadi"] = "История расходов не найдена";
    dictionary["Material"] = "Материал";
    dictionary["Miqdor"] = "Количество";
    dictionary["Qiymati"] = "Стоимость";
    dictionary["O'chirilgan material"] = "Удаленный материал";
    dictionary["O‘chirilgan material"] = "Удаленный материал";
    dictionary["Jami xarajat"] = "Всего расходов";
    dictionary["Qulflangan"] = "Заблокировано";
    dictionary["🔒 Qulflangan"] = "🔒 Заблокировано";
    dictionary["Qidirish: bemor / telefon / stomatolog"] = "Поиск: пациент / телефон / стоматолог";
    dictionary["• Oxirgi to'lov:"] = "• Последний платеж:";
    dictionary["• Oxirgi to‘lov:"] = "• Последний платеж:";

  } else if (activeLang === 'en') {
    dictionary["stomatolog"] = "dentist";
    dictionary["Stomatolog"] = "Dentist";
    dictionary["Elektron pochta"] = "Email Address";
    dictionary["Parol"] = "Password";
    dictionary["Tizimga kirish"] = "Log In";
    dictionary["tizimiga kirish"] = "login to system";
    dictionary["Admin panel"] = "Admin Panel";
    dictionary["Stomatolog panel"] = "Dentist Panel";
    dictionary["Chiqish"] = "Log Out";
    dictionary["Mening hisobim"] = "My Account";
    dictionary["Hisob-kitob"] = "Finance";
    dictionary["Bosh sahifa"] = "Home";
    dictionary["Biz haqimizda"] = "About Us";
    dictionary["Aloqa"] = "Contact";
    dictionary["Uchrashuvlarim"] = "My Appointments";
    dictionary["Mening akkauntim"] = "My Account";
    dictionary["Akkauntdan chiqish"] = "Log Out";
    dictionary["Akkauntga kirish"] = "Sign In";

    // Modals and Alerts
    dictionary["Bemorning Telegram bog'lanishini uzmoqchimisiz?"] = "Are you sure you want to disconnect Telegram for this patient?";
    dictionary["Bemorning Telegram bog‘lanishini uzmoqchimisiz?"] = "Are you sure you want to disconnect Telegram for this patient?";
    dictionary["Bemor yangilandi"] = "Patient updated";
    dictionary["Elektron pochta kiriting"] = "Please enter email address";
    dictionary["Parol kiriting"] = "Please enter password";
    dictionary["Kirish muvaffaqiyatli"] = "Login successful";

    // Admin Dashboard / Appointments / Live Queue EN
    dictionary["panel"] = "panel";
    dictionary["Panel"] = "Panel";
    dictionary["Omborxona"] = "Warehouse";
    dictionary["Unikal bemorlar"] = "Unique patients";
    dictionary["Tanlangan davr bo'yicha"] = "For selected period";
    dictionary["Tanlangan davr bo‘yicha"] = "For selected period";
    dictionary["To'lov foizi"] = "Payment percentage";
    dictionary["To‘lov foizi"] = "Payment percentage";
    dictionary["Umumiy - to'langan"] = "Total - paid";
    dictionary["Umumiy - to‘langan"] = "Total - paid";
    dictionary["Hozircha ma'lumot yo'q"] = "No data available yet";
    dictionary["Hozircha ma’lumot yo‘q"] = "No data available yet";
    dictionary["Hozircha ma‘lumot yo‘q"] = "No data available yet";
    dictionary["Mening uchrashuvlarim"] = "My Appointments";
    dictionary["Rejali uchrashuv yaratish"] = "Create Scheduled Appointment";
    dictionary["Ko'rsatilmoqda"] = "Showing";
    dictionary["Ko‘rsatilmoqda"] = "Showing";
    dictionary["Umumiy qarz"] = "Total debt";
    dictionary["Live holat"] = "Live status";
    dictionary["Sahifa"] = "Page";
    dictionary["Oldingi"] = "Prev";
    dictionary["Keyingi"] = "Next";
    dictionary["Admin yozgan"] = "Booked by admin";
    dictionary["Ishni boshladim"] = "Start session";
    dictionary["Telefonni nusxa olish"] = "Copy phone number";
    dictionary["Stomatolog yozgan"] = "Booked by dentist";
    dictionary["Yakunlangan (qarz bor)"] = "Completed (has debt)";
    dictionary["Jonli Yuborish"] = "Send to Live Queue";
    dictionary["Bemor ID (B-1)"] = "Patient ID (B-1)";
    dictionary["Ism sharif"] = "Full name";
    dictionary["Bemor topilmadimi?"] = "Patient not found?";
    dictionary["Shu joyning o'zida yangi bemor yaratib jonli yuboring."] = "Create a new patient right here and send to live queue.";
    dictionary["Shu joyning o‘zida yangi bemor yaratib jonli yuboring."] = "Create a new patient right here and send to live queue.";
    dictionary["Formani yopish"] = "Close Form";
    dictionary["Allergiya (ixtiyoriy)"] = "Allergy (optional)";
    dictionary["Tibbiy ogohlantirish (ixtiyoriy)"] = "Medical warnings (optional)";
    dictionary["Izoh (ixtiyoriy)"] = "Comment (optional)";
    dictionary["Maxfiy infeksion belgi (ixtiyoriy)"] = "Hidden infection flag (optional)";
    dictionary["Faqat admin va stomatolog ko'radi. Bemor va navbat ekranda ko'rinmaydi."] = "Visible only to admin and dentist. Not displayed to patients or queue screens.";
    dictionary["Faqat admin va stomatolog ko‘radi. Bemor va navbat ekranda ko‘rinmaydi."] = "Visible only to admin and dentist. Not displayed to patients or queue screens.";
    dictionary["Faqat admin va stomatolog ko'radi. Bemor va navbat ekranida ko'rinmaydi."] = "Visible only to admin and dentist. Not displayed to patients or queue screens.";
    dictionary["Faqat admin va stomatolog ko‘radi. Bemor va navbat ekranida ko‘rinmaydi."] = "Visible only to admin and dentist. Not displayed to patients or queue screens.";
    dictionary["treatment.procedures ichidan ajratildi"] = "extracted from treatment procedures";

    // Dentist Templates Page EN
    dictionary["Stomatolog shablonlari"] = "Dentist Templates";
    dictionary["Tez-tez ishlatiladigan davolash yozuvlarini saqlang va qabulni yakunlashda bir bosishda qo'llang."] = "Save frequently used treatment notes and apply them in one click when completing reception.";
    dictionary["Tez-tez ishlatiladigan davolash yozuvlarini saqlang va qabulni yakunlashda bir bosishda qo‘llang."] = "Save frequently used treatment notes and apply them in one click when completing reception.";
    dictionary["Shablon nomi *"] = "Template Name *";
    dictionary["Masalan: Karies davolash"] = "For example: Caries treatment";
    dictionary["Narxi (so'm)"] = "Price (som)";
    dictionary["Narxi (so‘m)"] = "Price (som)";
    dictionary["Masalan: 150 000"] = "For example: 150 000";
    dictionary["Sevimli shablon sifatida belgilash"] = "Mark as favorite template";
    dictionary["Saqlangan shablonlar"] = "Saved Templates";
    dictionary["Nomi yoki mazmuni bo'yicha qidirish"] = "Search by name or content";
    dictionary["Nomi yoki mazmuni bo‘yicha qidirish"] = "Search by name or content";
    dictionary["Ishlatilgan:"] = "Used:";
    dictionary["Oxirgi:"] = "Last:";
    dictionary["Tishlar:"] = "Teeth:";
    dictionary["Bajarilgan ishlar:"] = "Completed works:";
    dictionary["Keyingi qadam:"] = "Next step:";
    dictionary["Dorilar:"] = "Medicines:";
    dictionary["Eslatma:"] = "Notes:";

    // Dentist Patients Page EN
    dictionary["Stomatolog bo'yicha biriktirilgan bemorlar ro'yxati"] = "List of patients assigned to the dentist";
    dictionary["Stomatolog bo‘yicha biriktirilgan bemorlar ro‘yxati"] = "List of patients assigned to the dentist";
    dictionary["Oxirgi tashrif:"] = "Last visit:";
    dictionary["Email (ixtiyoriy)"] = "Email (optional)";

    // Navigation and week pagination EN
    // Navigation and week pagination EN
    dictionary["⬅ Oldingi hafta"] = "⬅ Previous week";
    dictionary["Keyingi hafta ➡"] = "Next week ➡";
    dictionary["⬅ Oldingi"] = "⬅ Prev";
    dictionary["Keyingi ➡"] = "Next ➡";

    // Dentist Appointments & Modals EN
    dictionary["Qabul qilinmoqda"] = "In Progress";
    dictionary["Qabulni tugatish"] = "Complete Session";
    dictionary["Qabulni yakunlash"] = "Complete Reception";
    dictionary["Shablon (ixtiyoriy)"] = "Template (optional)";
    dictionary["Shablon tanlang"] = "Select template";
    dictionary["Shablon tanlansa, diagnoz va klinik maydonlar avtomatik to'ladi."] = "Selecting a template automatically fills the diagnosis and clinical fields.";
    dictionary["Shablon tanlansa, diagnoz va klinik maydonlar avtomatik to‘ladi."] = "Selecting a template automatically fills the diagnosis and clinical fields.";
    dictionary["To'lov ma'lumotlari"] = "Payment Information";
    dictionary["To‘lov ma’lumotlari"] = "Payment Information";
    dictionary["To‘lov ma‘lumotlari"] = "Payment Information";
    dictionary["Umumiy narx *"] = "Total Price *";
    dictionary["Masalan: 150000"] = "For example: 150000";
    dictionary["Umumiy narx majburiy"] = "Total price is required";
    dictionary["Hozir olingan (ixtiyoriy)"] = "Received now (optional)";
    dictionary["Umumiy"] = "Total";
    dictionary["Hozir"] = "Now";
    dictionary["Keyingi ko'rik uchun sana va vaqt (ixtiyoriy)"] = "Next visit date and time (optional)";
    dictionary["Keyingi ko‘rik uchun sana va vaqt (ixtiyoriy)"] = "Next visit date and time (optional)";
    dictionary["Taqvimdan mos kun va bo'sh vaqtni tanlang. Hozirgi band vaqtlar ko'rinadi."] = "Select a suitable day and free time from the calendar. Currently booked slots are shown.";
    dictionary["Taqvimdan mos kun va bo‘sh vaqtni tanlang. Hozirgi band vaqtlar ko‘rinadi."] = "Select a suitable day and free time from the calendar. Currently booked slots are shown.";
    dictionary["Uchrashuv vaqti tanlanmagan"] = "Appointment time not selected";
    dictionary["HAFTANI BOSHLASH SANASI"] = "WEEK START DATE";
    dictionary["Taqvim bandlik jadvali (7 kun)"] = "Calendar schedule (7 days)";
    dictionary["XRAY / suratlar (ixtiyoriy)"] = "X-Ray / images (optional)";

    // Telegram and Edit Patient details EN
    dictionary["Telegram bot ulanmagan"] = "Telegram bot not connected";
    dictionary["QR kod orqali bog'lang"] = "Connect via QR code";
    dictionary["QR kod orqali bog‘lang"] = "Connect via QR code";
    dictionary["Telegramni ulash"] = "Connect Telegram";
    dictionary["Bemor ma'lumotlarini tahrirlash"] = "Edit Patient Details";
    dictionary["Bemor ma’lumotlarini tahrirlash"] = "Edit Patient Details";
    dictionary["Ism, Telefon, Адрес, allergia va boshqa ma'lumotlarni shu yerda yangilang."] = "Update name, phone, address, allergy and other details here.";
    dictionary["Ism, Telefon, Адрес, allergia va boshqa ma’lumotlarni shu yerda yangilang."] = "Update name, phone, address, allergy and other details here.";

    // Patient History & Visit Card EN
    dictionary["Muolajalar:"] = "Procedures:";
    dictionary["Keyingi reja:"] = "Next plan:";
    dictionary["Keyingi qabul:"] = "Next reception:";
    dictionary["Qabul summasi:"] = "Reception amount:";
    dictionary["To'langan:"] = "Paid:";
    dictionary["To‘langan:"] = "Paid:";
    dictionary["Qolgan qarz:"] = "Remaining debt:";
    dictionary["Qisman"] = "Partially";
    dictionary["Yaratilgan:"] = "Created:";
    dictionary["To'lovlar:"] = "Payments:";
    dictionary["To‘lovlar:"] = "Payments:";
    dictionary["Summa o'zgarishlari:"] = "Amount changes:";
    dictionary["Summa o‘zgarishlari:"] = "Amount changes:";
    dictionary["Sabab: Qabul yakunida birinchi summa kiritildi"] = "Reason: Initial amount entered at the end of reception";
    dictionary["Kim o'zgartirdi:"] = "Changed by:";
    dictionary["Kim o‘zgartirdi:"] = "Changed by:";
    dictionary["Stomatolog tasdig'i:"] = "Dentist confirmation:";
    dictionary["Stomatolog tasdig‘i:"] = "Dentist confirmation:";

    // Dentist Profile Page EN
    dictionary["Tajriba"] = "Experience";
    dictionary["Daraja"] = "Rank";
    dictionary["Mutaxassislik"] = "Specialty";
    dictionary["Parol xavfsizlik uchun ko'rsatilmaydi."] = "Password is not shown for security reasons.";
    dictionary["Parol xavfsizlik uchun ko‘rsatilmaydi."] = "Password is not shown for security reasons.";
    dictionary["Eski parolni kiriting va yangi parolni 2 marta tasdiqlang."] = "Enter old password and confirm new password twice.";
    dictionary["Eski parol"] = "Old password";
    dictionary["Kamida 6 ta belgi"] = "Minimum 6 characters";
    dictionary["Yangi parolni tasdiqlang"] = "Confirm new password";
    dictionary["Parolni saqlash"] = "Save password";

    // Warehouse Page & Modals EN
    dictionary["Mening Omborxonam"] = "My Warehouse";
    dictionary["Shaxsiy materiallar va stomatolog zaxirasi"] = "Personal materials and dentist stock";
    dictionary["Yangi material qo'shish"] = "Add New Material";
    dictionary["Yangi material qo‘shish"] = "Add New Material";
    dictionary["+ Yangi material qo'shish"] = "+ Add New Material";
    dictionary["+ Yangi material qo‘shish"] = "+ Add New Material";
    dictionary["JAMI TURLAR"] = "TOTAL TYPES";
    dictionary["material turi"] = "material type";
    dictionary["OMBOR QIYMATI"] = "STOCK VALUE";
    dictionary["umumiy bozor narxi"] = "total market price";
    dictionary["KAM QOLDI"] = "LOW STOCK";
    dictionary["materialda qoldiq kam"] = "low material balance";
    dictionary["HARAKATLAR"] = "ACTIONS";
    dictionary["jami kirim/chiqim"] = "total incoming/outgoing";
    dictionary["Zaxira"] = "Stock";
    dictionary["Harakatlar tarixi"] = "Transaction history";
    dictionary["Material nomi bo'yicha qidirish..."] = "Search by material name...";
    dictionary["Material nomi bo‘yicha qidirish..."] = "Search by material name...";
    dictionary["MATERIAL NOMI"] = "MATERIAL NAME";
    dictionary["MATERIAL NOMI *"] = "MATERIAL NAME *";
    dictionary["KATEGORIYA"] = "CATEGORY";
    dictionary["QOLDIQ"] = "STOCK BALANCE";
    dictionary["NARXI"] = "PRICE";
    dictionary["Sarflovchi material"] = "Consumable material";
    dictionary["Sarflovchi materiallar"] = "Consumables";
    dictionary["Uskuna / Jihoz"] = "Equipment / Tools";
    dictionary["Dori-darmon"] = "Medicines";
    dictionary["Boshqa"] = "Other";
    dictionary["Masalan: Plomba, Novocaine, Stakan..."] = "For example: Filling, Novocaine, Cup...";
    dictionary["O'LCHOV BIRLIGI"] = "UNIT OF MEASURE";
    dictionary["O‘LCHOV BIRLIGI"] = "UNIT OF MEASURE";
    dictionary["dona"] = "pcs";
    dictionary["DONA NARXI (SO'M)"] = "UNIT PRICE (SOM)";
    dictionary["DONA NARXI (SO‘M)"] = "UNIT PRICE (SOM)";
    dictionary["Masalan: 50 000"] = "For example: 50 000";
    dictionary["MIN. QOLDIQ OGOHLANTIRISH"] = "MIN. STOCK WARNING";
    dictionary["BOSHLANG'ICH QOLDIQ (IXTIYORIY)"] = "INITIAL STOCK (OPTIONAL)";
    dictionary["BOSHLANG‘ICH QOLDIQ (IXTIYORIY)"] = "INITIAL STOCK (OPTIONAL)";
    dictionary["NOTE"] = "NOTE";
    dictionary["Qo'shimcha ma'lumot..."] = "Additional information...";
    dictionary["Qo‘shimcha ma’lumot..."] = "Additional information...";
    dictionary["Qo'shish"] = "Add";
    dictionary["Qo‘shish"] = "Add";

    // Warehouse units EN
    dictionary["ml"] = "ml";
    dictionary["gr"] = "g";
    dictionary["kg"] = "kg";
    dictionary["litr"] = "L";
    dictionary["metr"] = "m";
    dictionary["quti"] = "box";
    dictionary["paket"] = "packet";
    dictionary["juft"] = "pair";
    dictionary["set"] = "set";

    // Warehouse log filters EN
    dictionary["Ko'rsatish:"] = "Show:";
    dictionary["Ko‘rsatish:"] = "Show:";
    dictionary["Barchasi"] = "All";
    dictionary["🟢 Kirim"] = "🟢 Incoming";
    dictionary["🔴 Chiqim"] = "🔴 Outgoing";
    dictionary["Yangilash"] = "Refresh";

    // Warehouse table headers EN
    dictionary["SANA"] = "DATE";
    dictionary["TUR"] = "TYPE";
    dictionary["SABAB"] = "REASON";
    dictionary["MIQDOR"] = "QUANTITY";
    dictionary["↑ Kirim"] = "↑ Incoming";
    dictionary["↓ Chiqim"] = "↓ Outgoing";

    // Warehouse reasons EN
    dictionary["Bemor muolajasi uchun"] = "For patient treatment";
    dictionary["Boshlang'ich qoldiq kiritildi"] = "Initial stock entered";
    dictionary["Boshlang‘ich qoldiq kiritildi"] = "Initial stock entered";

    // Modals EN
    dictionary["Formani ochish"] = "Open Form";

    // Finance Page EN
    dictionary["Mening hisob-kitobim"] = "My Accounting";
    dictionary["Bugun"] = "Today";
    dictionary["Hafta"] = "Week";
    dictionary["Oy"] = "Month";
    dictionary["Dan"] = "From";
    dictionary["Gacha"] = "To";
    dictionary["Dan:"] = "From:";
    dictionary["Gacha:"] = "To:";
    dictionary["TUSHGAN PULLAR (MAOSH)"] = "RECEIVED FUNDS (SALARY)";
    dictionary["Jami to'langan ish haqilari"] = "Total paid salaries";
    dictionary["Jami to'langan ish haqlari"] = "Total paid salaries";
    dictionary["Jami to‘langan ish haqlari"] = "Total paid salaries";
    dictionary["SARFLANGAN MATERIALLAR"] = "CONSUMED MATERIALS";
    dictionary["Olingan sarf materiallari qiymati"] = "Value of consumed materials";
    dictionary["SOF FOYDA (BALANS)"] = "NET PROFIT (BALANCE)";
    dictionary["Oylik minus xarajatlar qoldig'i"] = "Remaining salary minus expenses";
    dictionary["Oylik minus xarajatlar qoldig‘i"] = "Remaining salary minus expenses";
    dictionary["OLINGAN OYLIK & ISH HAQLARI"] = "RECEIVED SALARY & WAGES";
    dictionary["Sana"] = "Date";
    dictionary["Summa"] = "Amount";
    dictionary["Izoh"] = "Note";
    dictionary["Oylik komissiya to'lovi"] = "Monthly commission payout";
    dictionary["Oylik komissiya to‘lovi"] = "Monthly commission payout";
    dictionary["Jami"] = "Total";
    dictionary["To'lovlar tarixi topilmadi"] = "Payment history not found";
    dictionary["To‘lovlar tarixi topilmadi"] = "Payment history not found";
    dictionary["SARFLANGAN MATERIALLAR (XARAJAT)"] = "CONSUMED MATERIALS (EXPENSES)";
    dictionary["Material"] = "Material";
    dictionary["Miqdor"] = "Quantity";
    dictionary["Qiymati"] = "Value";
    dictionary["Jami xarajat"] = "Total expenses";
    dictionary["Xarajatlar tarixi topilmadi"] = "Expense history not found";
    dictionary["Kam qoldiq"] = "Low Stock";
    dictionary["Sabab:"] = "Reason:";
    dictionary["Status:"] = "Status:";
    dictionary["Qabul yakunida birinchi summa kiritildi"] = "First amount entered upon completing treatment";

    // Extra EN keys
    dictionary["Dushanba"] = "Monday";
    dictionary["Seshanba"] = "Tuesday";
    dictionary["Chorshanba"] = "Wednesday";
    dictionary["Payshanba"] = "Thursday";
    dictionary["Juma"] = "Friday";
    dictionary["Shanba"] = "Saturday";
    dictionary["Yakshanba"] = "Sunday";
    dictionary["To'lov qo'shish"] = "Add Payment";
    dictionary["To‘lov qo‘shish"] = "Add Payment";
    dictionary["Yakunlangan (to'lov kutilmoqda)"] = "Completed (payment pending)";
    dictionary["Yakunlangan (to‘lov kutilmoqda)"] = "Completed (payment pending)";
    dictionary["Yakunlangan (to'langan)"] = "Completed (paid)";
    dictionary["Yakunlangan (to‘langan)"] = "Completed (paid)";
    dictionary["Diagnos *"] = "Diagnosis *";
    dictionary["Diagnos:"] = "Diagnosis:";
    dictionary["Oxirgi:"] = "Last:";
    dictionary["Oxirgi"] = "Last";

    // Admin Dashboard EN
    dictionary["Admin boshqaruv paneli"] = "Admin Dashboard Panel";
    dictionary["Bugun bo'yicha ko'rsatkichlar"] = "Indicators for today";
    dictionary["Bugun bo‘yicha ko‘rsatkichlar"] = "Indicators for today";
    dictionary["Barcha vaqt bo'yicha ko'rsatkichlar"] = "Indicators for all time";
    dictionary["Barcha vaqt bo‘yicha ko‘rsatkichlar"] = "Indicators for all time";
    dictionary["Barcha vaqt"] = "All time";
    dictionary["Ro'yxatni ochish"] = "Open list";
    dictionary["Ro‘yxatni ochish"] = "Open list";
    dictionary["Davr bo'yicha (muolajalar asosida)"] = "For the period (based on treatments)";
    dictionary["Davr bo‘yicha (muolajalar asosida)"] = "For the period (based on treatments)";
    dictionary["Qabullar ro'yxatini ochish"] = "Open appointments list";
    dictionary["Qabullar ro‘yxatini ochish"] = "Open appointments list";
    dictionary["To'lovlar / qarzlarni ko'rish"] = "View payments / debts";
    dictionary["To‘lovlar / qarzlarni ko‘rish"] = "View payments / debts";
    dictionary["To'lovlar / qarzlarani ko'rish"] = "View payments / debts";
    dictionary["To‘lovlar / qarzlarani ko‘rish"] = "View payments / debts";
    dictionary["To'lov"] = "Payment";
    dictionary["To‘lov"] = "Payment";
    dictionary["Filtrlar"] = "Filters";
    dictionary["Davr va stomatolog bo'yicha statistikani boshqaring"] = "Manage statistics by period and dentist";
    dictionary["Davr va stomatolog bo‘yicha statistikani boshqaring"] = "Manage statistics by period and dentist";
    dictionary["Filtrlarni yopish"] = "Close filters";
    dictionary["Filtrlami yopish"] = "Close filters";
    dictionary["Filtrlarni ochish"] = "Open filters";
    dictionary["Barcha stomatologlar"] = "All dentists";
    dictionary["Stomatolog tanlasangiz, barcha KPI shu stomatologga filtrlanadi"] = "If you choose a dentist, all KPIs will be filtered by that dentist";
    dictionary["Qo'llash"] = "Apply";
    dictionary["Qo‘llash"] = "Apply";
    dictionary["Excel eksport"] = "Excel export";
    dictionary["Tahliliy ko'rsatkichlar"] = "Analytical indicators";
    dictionary["Tahliliy ko‘rsatkichlar"] = "Analytical indicators";
    dictionary["Tezkor tahlil: eng yaxshi natijalar va risklar"] = "Quick analysis: best results and risks";
    dictionary["Eng yuqori tushum (stomatolog)"] = "Highest revenue (dentist)";
    dictionary["Ma'lumot yo'q"] = "No data";
    dictionary["Ma‘lumot yo‘q"] = "No data";
    dictionary["Ma‘lumot yo‘q"] = "No data";
    dictionary["Eng katta qarz (stomatolog)"] = "Largest debt (dentist)";
    dictionary["Klinika to'lov darajasi"] = "Clinic payment level";
    dictionary["Klinika to‘lov darajasi"] = "Clinic payment level";
    dictionary["Moliyaviy blok"] = "Financial block";
    dictionary["Davr bo'yicha umumiy ko'rsatkichlar"] = "General financial indicators for the period";
    dictionary["Davr bo‘yicha umumiy ko‘rsatkichlar"] = "General financial indicators for the period";
    dictionary["Umumiy summa"] = "Total amount";
    dictionary["Muammo yo'q"] = "No issues";
    dictionary["Muammo yo‘q"] = "No issues";
    dictionary["Xavf mavjud"] = "Risk detected";
    dictionary["Reja"] = "Plan";
    dictionary["Uchrashuvlar va tashriflar"] = "Appointments and visits";
    dictionary["Rejalashtirilgan uchrashuvlar"] = "Scheduled appointments";
    dictionary["Tashriflar (muolajalar)"] = "Visits (treatments)";
    dictionary["Stomatologlar bo'yicha ko'rsatkichlar"] = "Indicators by dentists";
    dictionary["Stomatologlar bo‘yicha ko‘rsatkichlar"] = "Indicators by dentists";
    dictionary["Klinik KPI: tashriflar (muolajalar), bemorlar, tushum, qarz va to'lov foizi"] = "Clinical KPI: visits (treatments), patients, revenue, debt and payment percentage";
    dictionary["Klinik KPI: tashriflar (muolajalar), bemorlar, tushum, qarz va to‘lov foizi"] = "Clinical KPI: visits (treatments), patients, revenue, debt and payment percentage";
    dictionary["Qidirish: ism..."] = "Search: name...";
    dictionary["Tushum bo'yicha"] = "By revenue";
    dictionary["Tushum bo‘yicha"] = "By revenue";
    dictionary["Tashrif bo'yicha"] = "By visits";
    dictionary["Tashrif bo‘yicha"] = "By visits";
    dictionary["Bemor bo'yicha"] = "By patients";
    dictionary["Bemor bo‘yicha"] = "By patients";
    dictionary["Qarz bo'yicha"] = "By debt";
    dictionary["Qarz bo‘yicha"] = "By debt";
    dictionary["Tashrif"] = "Visits";
    dictionary["Bemor"] = "Patients";
    dictionary["Uchrashuv"] = "Appointments";
    dictionary["Amal"] = "Action";
    dictionary["Filtrlash"] = "Filter";
    dictionary["Akkaunt"] = "Account";
    dictionary["Ma'lumot topilmadi."] = "No data found.";
    dictionary["Ma‘lumot topilmadi."] = "No data found.";
    dictionary["Uchrashuvlar (Admin)"] = "Appointments (Admin)";
    dictionary["Rejali uchrashuv qo'shish"] = "Book Appointment";
    dictionary["Rejali uchrashuv qo‘shish"] = "Book Appointment";
    dictionary["Filtrni tozalash"] = "Clear filter";
    dictionary["Stomatolog bo‘yicha filtrlangan"] = "Filtered by dentist";
    dictionary["Jami:"] = "Total:";
    dictionary["• Sahifa"] = "• Page";

    // Warehouse EN
    dictionary["+ Yangi material"] = "+ New Material";
    dictionary["📦 Zaxira"] = "📦 Inventory";
    dictionary["📋 Harakatlar tarixi"] = "📋 Transaction History";
    dictionary["Ko'rsatish:"] = "Show:";
    dictionary["Ko‘rsatish:"] = "Show:";
    dictionary["↻ Yangilash"] = "↻ Refresh";
    dictionary["Harakatlar tarixi topilmadi"] = "Transaction history not found";
    dictionary["Hali materiallar yo'q"] = "No materials yet";
    dictionary["+ Birinchi materialni qo'shish"] = "+ Add first material";
    dictionary["Material nomi bo'yicha qidirish..."] = "Search by material name...";
    dictionary["Barchasi"] = "All";
    dictionary["📦 Yangi material qo'shish"] = "📦 Add New Material";
    dictionary["📦 Yangi material qo‘shish"] = "📦 Add New Material";
    dictionary["✓ Qo'shish"] = "✓ Add";
    dictionary["✓ Qo‘shish"] = "✓ Add";
    dictionary["+ Kirim qilish"] = "+ Add Incoming";
    dictionary["− Chiqim qilish"] = "− Add Outgoing";
    dictionary["✓ Saqlash"] = "✓ Save";
    dictionary["Qo'shilmoqda..."] = "Adding...";
    dictionary["Qo‘shilmoqda..."] = "Adding...";
    dictionary["Kiritilmoqda..."] = "Entering...";
    dictionary["Sarflanmoqda..."] = "Consuming...";
    dictionary["Saqlanmoqda..."] = "Saving...";
    dictionary["Material nomi *"] = "Material Name *";
    dictionary["O'lchov birligi"] = "Unit of measurement";
    dictionary["O‘lchov birligi"] = "Unit of measurement";
    dictionary["Dona narxi (so'm)"] = "Unit price (som)";
    dictionary["Dona narxi (so‘m)"] = "Unit price (som)";
    dictionary["Min. qoldiq ogohlantirish"] = "Min. stock warning";
    dictionary["Min. qoldiq"] = "Min. stock";
    dictionary["Boshlang'ich qoldiq (ixtiyoriy)"] = "Initial stock (optional)";
    dictionary["Boshlang‘ich qoldiq (ixtiyoriy)"] = "Initial stock (optional)";
    dictionary["Masalan: Plomba, Novocaine, Stakan..."] = "e.g. Filling, Novocaine, Glass...";
    dictionary["Masalan: Plomba, Novokain, Stakan..."] = "e.g. Filling, Novocaine, Glass...";
    dictionary["Qo'shimcha ma'lumot..."] = "Additional info...";
    dictionary["Qo‘shimcha ma‘lumot..."] = "Additional info...";
    dictionary["Yangi material sotib olindi"] = "New material purchased";
    dictionary["Zaxira to'ldirildi"] = "Stock replenished";
    dictionary["Zaxira to‘ldirildi"] = "Stock replenished";
    dictionary["Boshqadan olingan"] = "Received from another source";
    dictionary["Boshqa sabab"] = "Other reason";
    dictionary["Sababni tanlang..."] = "Select reason...";
    dictionary["Joriy qoldiq:"] = "Current stock:";
    dictionary["Joriy qoldiq"] = "Current stock";
    dictionary["Miqdor ("] = "Quantity (";
    dictionary["Miqdor"] = "Quantity";
    dictionary["Sotib olish narxi (dona uchun, ixtiyoriy)"] = "Purchase price (per unit, optional)";
    dictionary["Joriy narx:"] = "Current price:";
    dictionary["Maks:"] = "Max:";
    dictionary["Bemor ismi, muolaja turi..."] = "Patient name, treatment type...";
    dictionary["Klinika sarfi uchun"] = "For clinic use";
    dictionary["Sinib/yaroqsiz bo'ldi"] = "Broken/unusable";
    dictionary["Sinib/yaroqsiz bo‘lidi"] = "Broken/unusable";
    dictionary["Qidiruv bo'yicha topilmadi"] = "No results found";
    dictionary["Qidiruv bo‘yicha topilmadi"] = "No results found";

    // Login & Finance EN
    dictionary["Iltimos, tizimga kirish uchun ma'lumotlaringizni kiriting"] = "Please enter your details to log in to the system";
    dictionary["Iltimos, tizimga kirish uchun ma‘lumotlaringizni kiriting"] = "Please enter your details to log in to the system";
    dictionary["Admin tizimiga qaytish:"] = "Return to Admin login:";
    dictionary["Admin tizimiga o'tish"] = "Login as admin";
    dictionary["Admin tizimiga o‘tish"] = "Login as admin";
    dictionary["Stomatologlar uchun tizim:"] = "Login for dentists:";
    dictionary["Stomatolog tizimiga o'tish"] = "Login as dentist";
    dictionary["Stomatolog tizimiga o‘tish"] = "Login as dentist";
    dictionary["OLINGAN OYLIK"] = "RECEIVED SALARY";
    dictionary["ISH HAQLARI"] = "WAGES";
    dictionary["SABAB *"] = "REASON *";
    dictionary["Sabab *"] = "Reason *";

    // Extra EN keys for dropdowns & lists
    dictionary["So'nggi 3 kun"] = "Last 3 days";
    dictionary["So‘nggi 3 kun"] = "Last 3 days";
    dictionary["So'nggi 7 kun"] = "Last 7 days";
    dictionary["So‘nggi 7 kun"] = "Last 7 days";
    dictionary["Joriy oy"] = "Current month";
    dictionary["Joriy chorak"] = "Current quarter";
    dictionary["Joriy yil"] = "Current year";
    dictionary["Tanlangan oraliq"] = "Selected range";
    dictionary["Bemor bugun qabul qilindi"] = "Patient accepted today";
    dictionary["Bugun qabul qilindi"] = "Accept today";
    dictionary["To'lov qabul qilindi"] = "Payment accepted";
    dictionary["To‘lov qabul qilindi"] = "Payment accepted";
    dictionary["Rejali band qilish"] = "Book schedule";
    dictionary["Majburan yuborish"] = "Force send";
    dictionary["Jonli yuborish"] = "Send to Live Queue";
    dictionary["(Bugun)"] = "(Today)";

    // Treatments, Dentists List, Confirm Modal EN
    dictionary["To'lov so'rovlari"] = "Payment requests";
    dictionary["To‘lov so‘rovlari"] = "Payment requests";
    dictionary["Barcha qarzlar"] = "All debts";
    dictionary["Qarzlari bor barcha davolashlar"] = "All treatments with debt";
    dictionary["Davolash yaratilgan:"] = "Treatment created:";
    dictionary["Oxirgi to'lov:"] = "Last payment:";
    dictionary["Oxirgi to‘lov:"] = "Last payment:";
    dictionary["Umumiy:"] = "Total:";
    dictionary["Qarz:"] = "Debt:";
    dictionary["Summani o'zgartirish"] = "Change amount";
    dictionary["Summani o‘zgartirish"] = "Change amount";
    dictionary["Tasdiqlash"] = "Confirm";
    dictionary["Qarzni eslatish"] = "Remind about debt";
    dictionary["* Sana/vaqt avtomatik saqlanadi"] = "* Date/time saved automatically";
    dictionary["To'langan (qarz bor)"] = "Paid (has debt)";
    dictionary["To‘langan (qarz bor)"] = "Paid (has debt)";
    dictionary["To'lanmagan"] = "Unpaid";
    dictionary["To‘lanmagan"] = "Unpaid";
    dictionary["Jami qarz:"] = "Total debt:";
    dictionary["Jami so'rov:"] = "Total requests:";
    dictionary["Jami so‘rov:"] = "Total requests:";
    dictionary["Hozircha stomatologdan to'lov so'rovi yo'q"] = "No payment requests from dentists yet";
    dictionary["Hozircha stomatologdan to‘lov so‘rovi yo‘q"] = "No payment requests from dentists yet";
    dictionary["Stomatologlar"] = "Dentists";
    dictionary["Klinika shifokorlari va mutaxassislarini boshqarish"] = "Manage clinic doctors and specialists";
    dictionary["+ Yangi stomatolog qo'shish"] = "+ Add new dentist";
    dictionary["+ Yangi stomatolog qo‘shish"] = "+ Add new dentist";
    dictionary["HARAKATNI TASDIQLASH"] = "CONFIRM ACTION";
    dictionary["Ushbu harakatni tasdiqlash uchun administrator paroli va masul stomatolog paroli talab etiladi."] = "To confirm this action, the administrator password and the responsible dentist password are required.";
    dictionary["Ushbu harakatni tasdiqlash uchun administrator paroli va mas’ul stomatolog paroli talab etiladi."] = "To confirm this action, the administrator password and the responsible dentist password are required.";
    dictionary["ADMINISTRATOR PAROLI"] = "ADMINISTRATOR PASSWORD";
    dictionary["MASUL STOMATOLOG"] = "RESPONSIBLE DENTIST";
    dictionary["MAS’UL STOMATOLOG"] = "RESPONSIBLE DENTIST";
    dictionary["STOMATOLOG PAROLI"] = "DENTIST PASSWORD";
    dictionary["Ortopedik stomatologiya"] = "Orthopedic dentistry";
    dictionary["Parodontologiya"] = "Periodontics";
    dictionary["Terapevtik stomatologiya"] = "Therapeutic dentistry";
    dictionary["Terapivtik stomatologiya"] = "Therapeutic dentistry";
    dictionary["Stomatologiya jarrohligi"] = "Surgical dentistry";
    dictionary["Stomatologiya Jarrohligi"] = "Surgical dentistry";
    dictionary["Jarrohlik stomatologiyasi"] = "Surgical dentistry";
    dictionary["Bolalar stomatologiyasi"] = "Pediatric dentistry";
    dictionary["Estetik stomatologiya"] = "Aesthetic dentistry";
    dictionary["Ortodontiya"] = "Orthodontics";
    dictionary["Implantologiya"] = "Implantology";

    // Extra EN keys for templates, errors, and actions
    dictionary["Stomatolog shablonlari"] = "Dentist templates";
    dictionary["Tez-tez ishlatiladigan davolash yozuvlarini saqlang va qabulni yakunlashda bir bosishda qo‘llang."] = "Save frequently used treatment notes and apply them with one click when finishing the reception.";
    dictionary["Tez-tez ishlatiladigan davolash yozuvlarini saqlang va qabulni yakunlashda bir bosishda qo'llang."] = "Save frequently used treatment notes and apply them with one click when finishing the reception.";
    dictionary["Shablonni tahrirlash"] = "Edit template";
    dictionary["Yangi shablon"] = "New template";
    dictionary["Shablon nomi *"] = "Template name *";
    dictionary["Narxi (so‘m)"] = "Price (som)";
    dictionary["Narxi (so'm)"] = "Price (som)";
    dictionary["Masalan: Karies davolash"] = "For example: Caries treatment";
    dictionary["Sevimli shablon sifatida belgilash"] = "Mark as favorite template";
    dictionary["Shablonni yangilash"] = "Update template";
    dictionary["Shablonni saqlash"] = "Save template";
    dictionary["Saqlangan shablonlar"] = "Saved templates";
    dictionary["Nomi yoki mazmuni bo‘yicha qidirish"] = "Search by name or content";
    dictionary["Nomi yoki mazmuni bo'yicha qidirish"] = "Search by name or content";
    dictionary["Hozircha shablon yo‘q."] = "No templates yet.";
    dictionary["Hozircha shablon yo'q."] = "No templates yet.";
    dictionary["Sevimli"] = "Favorite";
    dictionary["Ishlatilgan:"] = "Used:";
    dictionary["marta"] = "times";
    dictionary["Oxirgi:"] = "Last:";
    dictionary["Tahrirlash"] = "Edit";
    dictionary["O‘chirilmoqda..."] = "Deleting...";
    dictionary["O'chirilmoqda..."] = "Deleting...";
    dictionary["O‘chirish"] = "Delete";
    dictionary["O'chirish"] = "Delete";
    dictionary["Shablonni o‘chirmoqchimisiz?"] = "Do you want to delete the template?";
    dictionary["Shablonni o'chirmoqchimisiz?"] = "Do you want to delete the template?";
    dictionary["Moliyaviy ma'lumotlarni yuklashda xatolik"] = "Error loading financial data";
    dictionary["Moliyaviy ma‘lumotlarni yuklashda xatolik"] = "Error loading financial data";
    dictionary["Serverga ulanib bo'lmadi"] = "Could not connect to server";
    dictionary["Serverga ulanib bo‘lmadi"] = "Could not connect to server";

    // Add Dentist Form EN
    dictionary["Ism majburiy."] = "Name is required.";
    dictionary["Ism faqat harflardan iborat bo‘lishi kerak."] = "Name must contain only letters.";
    dictionary["Ism faqat harflardan iborat bo'lishi kerak."] = "Name must contain only letters.";
    dictionary["Telefon raqam majburiy."] = "Phone number is required.";
    dictionary["Telefon formati noto‘g‘ri: +998 (95) 123-45-67"] = "Invalid phone format: +998 (95) 123-45-67";
    dictionary["Telefon formati noto'g'ri: +998 (95) 123-45-67"] = "Invalid phone format: +998 (95) 123-45-67";
    dictionary["Email majburiy."] = "Email is required.";
    dictionary["Email formati noto‘g‘ri."] = "Invalid email format.";
    dictionary["Email formati noto'g'ri."] = "Invalid email format.";
    dictionary["Parol majburiy."] = "Password is required.";
    dictionary["Parol kamida 6 belgidan iborat bo‘lishi kerak."] = "Password must be at least 6 characters long.";
    dictionary["Parol kamida 6 belgidan iborat bo'lishi kerak."] = "Password must be at least 6 characters long.";
    dictionary["Jins tanlanishi kerak."] = "Gender must be selected.";
    dictionary["Tajriba (yil) majburiy."] = "Experience (years) is required.";
    dictionary["Tajriba 0 dan 50 yilgacha butun son bo‘lishi kerak."] = "Experience must be an integer between 0 and 50 years.";
    dictionary["Tajriba 0 dan 50 yilgacha butun son bo'lishi kerak."] = "Experience must be an integer between 0 and 50 years.";
    dictionary["Hech bo‘lmaganda bitta mutaxassislik tanlanishi kerak."] = "At least one specialty must be selected.";
    dictionary["Hech bo'lmaganda bitta mutaxassislik tanlanishi kerak."] = "At least one specialty must be selected.";
    dictionary["Ma'lumot / daraja majburiy."] = "Education / degree is required.";
    dictionary["Ma‘lumot / daraja majburiy."] = "Education / degree is required.";
    dictionary["Ma’lumoti / Darajasi majburiy."] = "Education / degree is required.";
    dictionary["Iltimos, stomatolog haqida yozing."] = "Please write about the dentist.";
    dictionary["Kamida 6 ta belgidan iborat bo‘lishi kerak."] = "Must be at least 6 characters long.";
    dictionary["Kamida 6 ta belgidan iborat bo'lishi kerak."] = "Must be at least 6 characters long.";
    dictionary["Rasm yuklash majburiy."] = "Image upload is required.";
    dictionary["Yuklanmoqda, iltimos kuting..."] = "Loading, please wait...";
    dictionary["Yangi stomatolog muvaffaqiyatli qo‘shildi!"] = "New dentist added successfully!";
    dictionary["Yangi stomatolog muvaffaqiyatli qo'shildi!"] = "New dentist added successfully!";
    dictionary["Stomatologni saqlashda xatolik yuz berdi."] = "An error occurred while saving the dentist.";
    dictionary["Yangi Stomatolog Qo‘shish"] = "Add New Dentist";
    dictionary["Yangi Stomatolog Qo'shish"] = "Add New Dentist";
    dictionary["Quyidagi ma’lumotlarni to‘ldiring."] = "Fill in the following information.";
    dictionary["Quyidagi ma'lumotlarni to'ldiring."] = "Fill in the following information.";
    dictionary["Ism Sharif"] = "Full Name";
    dictionary["Masalan: Dr. Dilshoda Qodirova"] = "For example: Dr. Dilshoda Qodirova";
    dictionary["Jins"] = "Gender";
    dictionary["Erkak"] = "Male";
    dictionary["Ayol"] = "Female";
    dictionary["Tajriba (yil)"] = "Experience (years)";
    dictionary["Masalan: 5"] = "For example: 5";
    dictionary["Mutaxassislik(lar)"] = "Specialty(ies)";
    dictionary["Bir nechta yo‘nalishni tanlash uchun Ctrl (yoki Mac’da Cmd) tugmasini bosing."] = "To select multiple options, hold Ctrl (or Cmd on Mac).";
    dictionary["Bir nechta yo'nalishni tanlash uchun Ctrl (yoki Mac'da Cmd) tugmasini bosing."] = "To select multiple options, hold Ctrl (or Cmd on Mac).";
    dictionary["Ma’lumoti / Darajasi"] = "Education / Degree";
    dictionary["Ma'lumoti / Darajasi"] = "Education / Degree";
    dictionary["Masalan: Tibbiyot doktori"] = "For example: Doctor of Medicine";
    dictionary["Stomatolog haqida"] = "About the dentist";
    dictionary["Mutaxassis haqida batafsil..."] = "More details about the specialist...";

    // Navbar links EN
    dictionary["Boshqaruv"] = "Dashboard";
    dictionary["Uchrashuvlar"] = "Appointments";
    dictionary["To'lovlar"] = "Payments";
    dictionary["Shablonlar"] = "Templates";
    dictionary["Bemorlar"] = "Patients";
    dictionary["Sozlamalar"] = "Settings";

    // Services Catalog Page EN
    dictionary["Xizmatlar Katalogi"] = "Services Catalog";
    dictionary["Klinika xizmatlari, narxlari va to'lov tartibini boshqaring"] = "Manage clinic services, prices and payment terms";
    dictionary["Faol xizmatlar"] = "Active services";
    dictionary["Oldindan to'lov"] = "Advance payment";
    dictionary["Keyin to'lov"] = "Payment after";
    dictionary["Barcha kategoriyalar"] = "All categories";
    dictionary["Barcha vaqtlar"] = "All options";
    dictionary["Oldindan"] = "Advance";
    dictionary["Keyin"] = "After";
    dictionary["Noaktivlar"] = "Inactive";
    dictionary["+ Xizmat qo'shish"] = "+ Add Service";
    dictionary["Qidirish..."] = "Search...";
    dictionary["Kod"] = "Code";
    dictionary["Nomi"] = "Name";
    dictionary["Narx"] = "Price";
    dictionary["To'lov vaqti"] = "Payment time";
    dictionary["Holat"] = "Status";
    dictionary["Amallar"] = "Actions";
    dictionary["Xizmat topilmadi"] = "Service not found";
    dictionary["Birinchi xizmatni qo'shing →"] = "Add the first service →";
    dictionary["✓ Faol"] = "✓ Active";
    dictionary["✕ Noaktiv"] = "✕ Inactive";
    dictionary["Yangi xizmat qo'shish"] = "Add New Service";
    dictionary["Xizmatni tahrirlash"] = "Edit Service";
    dictionary["Xizmat nomi *"] = "Service name *";
    dictionary["Ruscha nomi"] = "Russian name";
    dictionary["Inglizcha nomi"] = "English name";
    dictionary["Narx (so'm)"] = "Price (som)";
    dictionary["⏳ Davolagandan keyin"] = "⏳ After treatment";
    dictionary["⚡ Oldindan to'lov"] = "⚡ Advance payment";
    dictionary["⚡ Bemor navbatga qo'shilishdan OLDIN to'lov qilishi shart. Kassir yoki qabulxona qabul qiladi."] = "⚡ Patient must pay BEFORE joining the queue. Accepted by cashier or reception.";
    dictionary["⏳ Bemor davolanib bo'lgandan so'ng to'lov qiladi (joriy tartib)."] = "⏳ Patient pays after treatment is complete (standard process).";
    dictionary["Xizmat ko'rsatadigan shifokorlar"] = "Doctors providing this service";
    dictionary["Faol shifokorlar topilmadi"] = "No active doctors found";
    dictionary["Xizmat faol"] = "Service active";
    dictionary["Saqlanmoqda..."] = "Saving...";
    dictionary["Saqlash"] = "Save";
    dictionary["Bekor qilish"] = "Cancel";
    dictionary["Xizmatni o'chirish"] = "Delete Service";
    dictionary["Ha, o'chirish"] = "Yes, delete";
    dictionary["xizmatini deaktivatsiya qilmoqchimisiz?"] = "deactivate?";
    dictionary["Masalan: Dastlabki konsultatsiya"] = "E.g.: Initial Consultation";
    dictionary["Konsultatsiya"] = "Consultation";
    dictionary["Davolash"] = "Treatment";
    dictionary["Protsedura"] = "Procedure";
    dictionary["Laboratoriya"] = "Laboratory";
    dictionary["Xizmatlarni yuklashda xatolik"] = "Error loading services";
    dictionary["Xizmat nomi talab qilinadi"] = "Service name is required";
    dictionary["Xizmat o'chirildi"] = "Service deleted";
    dictionary["O'chirishda xatolik"] = "Error deleting";

    // Patients Page EN
    dictionary["Admin bemor ma'lumotlarini tahrirlashi mumkin."] = "Admin can edit patient information.";
    dictionary["Qidirish: B-ID, ism yoki telefon"] = "Search: B-ID, name or phone";
    dictionary["+ Bemor"] = "+ Patient";
    dictionary["Telefon yo'q"] = "No phone";
    dictionary["· Oxirgi kelish:"] = "· Last visit:";
    dictionary["Qarz"] = "Debt";
    dictionary["Bemor topilmadi"] = "Patient not found";

    // DentistDetails Page EN
    dictionary["Rentgenologiya"] = "Radiology";
    dictionary["Telegram allaqachon ulangan"] = "Telegram already connected";
    dictionary["Telegramni haqiqatdan ham uzmoqchimisiz?"] = "Are you sure you want to disconnect Telegram?";
    dictionary["Telegram ulanish havolasini yaratib bo'lmadi"] = "Could not create Telegram connection link";

    // Treatments / PaymentBadge EN
    dictionary["To'liq to'langan"] = "Fully paid";

    // DentistDetails extra EN
    dictionary["Stomatolog akkaunti (Admin tahriri)"] = "Dentist Account (Admin Edit)";
    dictionary["Arxivda"] = "Archived";
    dictionary["Faol"] = "Active";
    dictionary["Arxivdan chiqarish"] = "Restore from archive";
    dictionary["Arxivga o'tkazish"] = "Move to archive";
    dictionary["Telegram Bot ulanishi"] = "Telegram Bot Connection";
    dictionary["Telegram faol ulandi"] = "Telegram actively connected";
    dictionary["Telegram bot hali ulanmagan. Skanerlash uchun QR kod generatsiya qiling."] = "Telegram bot not connected yet. Generate a QR code for scanning.";
    dictionary["Telegramni uzish"] = "Disconnect Telegram";
    dictionary["Yaratilmoqda..."] = "Creating...";
    dictionary["Telegram QR/havolasini olish"] = "Get Telegram QR/Link";
    dictionary["Rasmni yangilash"] = "Update photo";
    dictionary["← Orqaga"] = "← Back";
    dictionary["Topilmadi"] = "Not found";
    dictionary["Bir nechta tanlash uchun"] = "To select multiple";
    dictionary["Mutaxassis Telegramga ulanishi"] = "Specialist Telegram Connection";
    dictionary["Akkaunt saqlandi"] = "Account saved";
    dictionary["Akkauntni yuklashda xatolik"] = "Error loading account";
    dictionary["Holat yangilandi"] = "Status updated";
    dictionary["Iltimos, formani to'g'ri to'ldiring"] = "Please fill in the form correctly";
    dictionary["Telefon majburiy."] = "Phone is required.";
    dictionary["Telegram bog'lanishi muvaffaqiyatli uzildi!"] = "Telegram disconnected successfully!";
    dictionary["Telegram muvaffaqiyatli ulandi!"] = "Telegram connected successfully!";
    dictionary["Telegramni uzib bo'lmadi"] = "Could not disconnect Telegram";

    // AddReceptionist / AddCashier / Staff Pages EN
    dictionary["Qabulxona xodimi qo'shish"] = "Add Receptionist";
    dictionary["Qabulxona xodimi muvaffaqiyatli qo'shildi"] = "Receptionist added successfully";
    dictionary["Ro'yxatdagi qabulxona xodimlari"] = "List of Receptionists";
    dictionary["Qabulxona ID & Ismi"] = "Receptionist ID & Name";
    dictionary["Aloqa"] = "Contact";
    dictionary["Holati"] = "Status";
    dictionary["Harakat"] = "Action";
    dictionary["Faollashtirish"] = "Activate";
    dictionary["Bloklash"] = "Block";
    dictionary["F.I.O"] = "Full Name";
    dictionary["Telefon raqami"] = "Phone number";
    dictionary["Login (Elektron pochta)"] = "Login (Email)";
    dictionary["Registrator (qabulxona xodimi) tomonidan amalga oshirilgan ishlar auditi"] = "Audit of actions by the receptionist";
    dictionary["Ro'yxatga olgan bemorlari"] = "Registered patients";
    dictionary["Bron qilgan uchrashuvlari"] = "Booked appointments";
    dictionary["Yaratilgan vaqt:"] = "Created time:";
    dictionary["Bemorlar bo'limi"] = "Patients";
    dictionary["Uchrashuvlar bo'limi"] = "Appointments";
    dictionary["Uchrashuvlar topilmadi"] = "Appointments not found";
    dictionary["Uchrashuvlar topilmadi."] = "Appointments not found.";
    dictionary["Bemorlar topilmadi"] = "Patients not found";
    dictionary["Bemorlar topilmadi."] = "Patients not found.";
    dictionary["Faol"] = "Active";
    dictionary["Bloklangan"] = "Blocked";
    dictionary["Kassirlar"] = "Cashiers";
    dictionary["Kassir qo'shish"] = "Add Cashier";
    dictionary["Kassir muvaffaqiyatli qo'shildi"] = "Cashier added successfully";
    dictionary["Qidiruv..."] = "Search...";

    // More missing strings EN
    dictionary["Kechiring, xatolik yuz berdi"] = "Sorry, an error occurred";
    dictionary["Serverda xatolik"] = "Server error";
    dictionary["Saqlandi"] = "Saved";
    dictionary["Xatolik"] = "Error";
    dictionary["Yuklanmoqda..."] = "Loading...";
    dictionary["Hali ma'lumot yo'q"] = "No data yet";
    dictionary["Band"] = "Busy";
    dictionary["Bo'sh"] = "Free";
    dictionary["Bekor qilindi"] = "Cancelled";
    dictionary["Kelmadi"] = "No show";
    dictionary["Kutilmoqda"] = "Waiting";
    dictionary["Qabulda"] = "In session";
    dictionary["Yakunlandi"] = "Completed";

    // ─── Dashboard Page EN ───────────────────────────────────────────────────
    dictionary["Admin boshqaruv paneli"] = "Admin Dashboard";
    dictionary["bo'yicha ko'rsatkichlar"] = "indicators for";
    dictionary["To'lov:"] = "Payment:";
    dictionary["Qarz:"] = "Debt:";
    dictionary["so'm"] = "som";
    dictionary["Filtrlar"] = "Filters";
    dictionary["Davr va stomatolog bo'yicha statistikani boshqaring"] = "Manage statistics by period and dentist";
    dictionary["Filtrni tozalash"] = "Clear filter";
    dictionary["Filtrlarni yopish"] = "Close filters";
    dictionary["Filtrlarni ochish"] = "Open filters";
    dictionary["Davr"] = "Period";
    dictionary["Bugun"] = "Today";
    dictionary["7 kun"] = "7 days";
    dictionary["Oy"] = "Month";
    dictionary["Boshlanish"] = "Start";
    dictionary["Tugash"] = "End";
    dictionary["Barcha stomatologlar"] = "All dentists";
    dictionary["* Stomatolog tanlasangiz, barcha KPI shu stomatologga filtrlanadi"] = "* Selecting a dentist will filter all KPIs to that dentist";
    dictionary["Qo'llash"] = "Apply";
    dictionary["Excel eksport"] = "Export to Excel";
    dictionary["Stomatolog bo'yicha filtrlangan"] = "Filtered by dentist";
    // Stat cards EN
    dictionary["Stomatologlar"] = "Dentists";
    dictionary["Ro'yxatni ochish"] = "Open list";
    dictionary["Bemorlar (davr)"] = "Patients (period)";
    dictionary["Davr bo'yicha (muolajalar asosida)"] = "For period (based on procedures)";
    dictionary["Tashriflar (davr)"] = "Visits (period)";
    dictionary["Qabullar ro'yxatini ochish"] = "Open appointments list";
    dictionary["Tushum (davr)"] = "Revenue (period)";
    dictionary["To'lovlar / qarzlarni ko'rish"] = "View payments / debts";
    dictionary["To'lov"] = "Payment";
    dictionary["Qarz"] = "Debt";
    // Analytics section EN
    dictionary["Tahliliy ko'rsatkichlar"] = "Analytics";
    dictionary["Tezkor tahlil: eng yaxshi natijalar va risklar"] = "Quick analysis: best results and risks";
    dictionary["Yangilash"] = "Refresh";
    dictionary["Eng yuqori tushum (stomatolog)"] = "Highest revenue (dentist)";
    dictionary["Ma'lumot yo'q"] = "No data";
    dictionary["Tashrif:"] = "Visit:";
    dictionary["Bemor:"] = "Patient:";
    dictionary["Ko'rish"] = "View";
    dictionary["Eng katta qarz (stomatolog)"] = "Highest debt (dentist)";
    dictionary["Tushum:"] = "Revenue:";
    dictionary["To'lovlar"] = "Payments";
    dictionary["Klinika to'lov darajasi"] = "Clinic payment rate";
    // Finance block EN
    dictionary["Moliyaviy blok"] = "Finance Block";
    dictionary["Davr bo'yicha umumiy ko'rsatkichlar"] = "Overall indicators for the period";
    dictionary["Umumiy summa"] = "Total amount";
    dictionary["Tushum"] = "Revenue";
    dictionary["Xavf mavjud"] = "Risk present";
    dictionary["Muammo yo'q"] = "No issues";
    // Plan section EN
    dictionary["Reja"] = "Plan";
    dictionary["Uchrashuvlar va tashriflar"] = "Appointments and visits";
    dictionary["Rejalashtirilgan uchrashuvlar"] = "Scheduled appointments";
    dictionary["Qabullar"] = "Appointments";
    dictionary["Tashriflar (muolajalar)"] = "Visits (procedures)";
    dictionary["Muolajalar"] = "Procedures";
    // Dentist KPI table EN
    dictionary["Stomatologlar bo'yicha ko'rsatkichlar"] = "Dentist Indicators";
    dictionary["Klinik KPI: tashriflar (muolajalar), bemorlar, tushum, qarz va to'lov foizi"] = "Clinical KPI: visits (procedures), patients, revenue, debt and payment rate";
    dictionary["Qidirish: ism..."] = "Search name...";
    dictionary["Tushum bo'yicha"] = "By revenue";
    dictionary["Tashrif bo'yicha"] = "By visits";
    dictionary["Bemor bo'yicha"] = "By patients";
    dictionary["Qarz bo'yicha"] = "By debt";
    dictionary["Tashrif"] = "Visits";
    dictionary["Bemor"] = "Patients";
    dictionary["Uchrashuv"] = "Appointments";
    dictionary["Amal"] = "Action";
    dictionary["Filtrlash"] = "Filter";
    dictionary["Akkaunt"] = "Account";
    dictionary["Ma'lumot topilmadi."] = "Data not found.";
    dictionary["Jami:"] = "Total:";
    dictionary["Sahifa"] = "Page";
    // RANGE_OPTIONS EN
    dictionary["So'nggi 3 kun"] = "Last 3 days";
    dictionary["So'nggi 7 kun"] = "Last 7 days";
    dictionary["Joriy oy"] = "Current month";
    dictionary["Joriy chorak"] = "Current quarter";
    dictionary["Joriy yil"] = "Current year";
    dictionary["Tanlangan oraliq"] = "Custom range";
    dictionary["Barcha vaqt"] = "All time";
    // Error EN
    dictionary["Statistikani yuklashda xatolik"] = "Error loading statistics";

    // AllAppointments Page EN
    dictionary["Uchrashuvlar (Admin)"] = "Appointments (Admin)";
    dictionary["+ Rejali uchrashuv qo'shish"] = "+ Book Appointment";
    dictionary["Hammasi"] = "All";
    dictionary["Bugun"] = "Today";
    dictionary["Kutilmoqda"] = "Waiting";
    dictionary["To‘langan"] = "Paid";
    dictionary["To'langan"] = "Paid";
    dictionary["Bekor qilingan"] = "Cancelled";
    dictionary["Kelmagan"] = "No show";
    dictionary["Bemor / telefon / stomatolog"] = "Patient / phone / dentist";
    dictionary["Oxirgi to'lov"] = "Last payment";
    dictionary["Oxirgi to‘lov"] = "Last payment";
    dictionary["Harakatlar"] = "Actions";
    dictionary["To‘lov tasdiqlanishi kutilmoqda"] = "Pending payment confirmation";
    dictionary["To'lov tasdiqlanishi kutilmoqda"] = "Pending payment confirmation";
    dictionary["Maxfiy infeksion belgi bor"] = "Has confidential infectious disease marker";
    dictionary["Bugun qabul qilindi"] = "Accept today";
    dictionary["Qabul qilinmoqda"] = "In progress";
    dictionary["Arxivda"] = "Archived";

    // LiveDentistsBar / WalkInModal / Telegram Patient EN
    dictionary["Stomatologlar holati"] = "Dentists Status";
    dictionary["Navbat"] = "Queue";
    dictionary["Keladi"] = "Arrived";
    dictionary["Qabul qilingan"] = "Completed";
    dictionary["Keyingi bemor:"] = "Next patient:";
    dictionary["Keyingi bemor"] = "Next patient";
    dictionary["Majburan yuborish"] = "Send forced";
    dictionary["Jonli yuborish"] = "Send to live queue";
    dictionary["Rejali band qilish"] = "Book appointment";
    dictionary["Hozircha stomatologlar topilmadi."] = "No dentists found yet.";
    dictionary["Bemor qidirish sozlanmagan"] = "Patient lookup is not configured";
    dictionary["Bu telefon raqam bilan bir nechta bemor topildi. Ro‘yxatdan aniq bemorni tanlang."] = "Multiple patients found with this phone number. Choose the specific patient.";
    dictionary["Bemor topilmasa, forma orqali yangi bemor yarating."] = "If patient is not found, create a new one using the form.";
    dictionary["Yangi bemor uchun ism, telefon va tug‘ilgan sana majburiy"] = "Full name, phone, and DOB are required for the new patient";
    dictionary["Bemor yaratish funksiyasi ulanmagan"] = "Patient creation function is not connected";
    dictionary["Ism sharif • qidirilmoqda"] = "Full Name • searching";
    dictionary["Avval tanlangan bemorni tozalang"] = "Clear selected patient first";
    dictionary["Formani ochish"] = "Open form";
    dictionary["Mavjud bemor tanlangan. Yangi bemor yaratish uchun avval tanlovni tozalang yoki boshqa qidiruv kiriting."] = "Existing patient selected. To create a new one, clear the selection first.";
    dictionary["Tanlanmagan"] = "Not selected";
    dictionary["Erkak"] = "Male";
    dictionary["Ayol"] = "Female";
    dictionary["Shahar / tuman"] = "City / district";
    dictionary["Mahalla / ko‘cha"] = "Mahalla / street";
    dictionary["Yuborilmoqda..."] = "Sending...";

    // Treatments / ChangeAmountModal EN
    dictionary["Hozircha qarzdor davolash yo'q"] = "No treatments with debt yet";
    dictionary["Hozircha qarzdor davolash yo‘q"] = "No treatments with debt yet";
    dictionary["Dentist so'rovi:"] = "Dentist request:";
    dictionary["Dentist so‘rovi:"] = "Dentist request:";
    dictionary["Batafsil"] = "Details";
    dictionary["Yopish"] = "Close";
    dictionary["Izoh (ixtiyoriy) — masalan: qarzning 2-qismi"] = "Comment (optional) — e.g. 2nd part of debt";
    dictionary["Qarzni eslatish"] = "Remind about debt";
    dictionary["Bemorga Telegram orqali qarz to'lovi haqida eslatma yubormoqchimisiz?"] = "Do you want to send a debt reminder to the patient via Telegram?";
    dictionary["Bemorga Telegram orqali qarz to‘lovi haqida eslatma yubormoqchimisiz?"] = "Do you want to send a debt reminder to the patient via Telegram?";
    dictionary["Diagnos"] = "Diagnosis";
    dictionary["Ishlangan tish(lar)"] = "Treated tooth/teeth";
    dictionary["Bajarilgan ishlar"] = "Procedures performed";
    dictionary["Keyingi qadam"] = "Next step";
    dictionary["Dorilar"] = "Medicines";
    dictionary["Eslatma"] = "Notes";
    dictionary["Keyingi ko'rik"] = "Next check-up";
    dictionary["Keyingi ko‘rik"] = "Next check-up";
    dictionary["To'lovlar tarixi"] = "Payment history";
    dictionary["To‘lovlar tarixi"] = "Payment history";
    dictionary["To'lovlar yo'q"] = "No payments";
    dictionary["To‘lovlar yo‘q"] = "No payments";
    dictionary["X-ray / Rentgen rasmlari"] = "X-ray images";
    dictionary["Rasm yo'q"] = "No images";
    dictionary["Rasm yo‘q"] = "No images";
    dictionary["To'lovlar tarixi yo'q"] = "No payment history";
    dictionary["To‘lovlar tarixi yo‘q"] = "No payment history";
    dictionary["Summa o'zgarishlari tarixi"] = "Amount change history";
    dictionary["Summa o‘zgarishlari tarixi"] = "Amount change history";
    dictionary["Summa o'zgarishlari yo'q"] = "No amount changes";
    dictionary["Summa o‘zgarishlari yo‘q"] = "No amount changes";
    dictionary["Sabab:"] = "Reason:";
    dictionary["Stomatolog tasdig'i:"] = "Dentist confirmation:";
    dictionary["Stomatolog tasdig‘i:"] = "Dentist confirmation:";
    dictionary["Summani tuzatish"] = "Correct amount";
    dictionary["Joriy summa:"] = "Current amount:";
    dictionary["Allaqachon to'langan:"] = "Already paid:";
    dictionary["Allaqachon to‘langan:"] = "Already paid:";
    dictionary["1. Admin"] = "1. Admin";
    dictionary["2. Stomatolog"] = "2. Dentist";
    dictionary["3. Yangi summa"] = "3. New amount";
    dictionary["Admin paroli"] = "Admin password";
    dictionary["Admin parolini kiriting"] = "Enter admin password";
    dictionary["Stomatolog paroli"] = "Dentist password";
    dictionary["Stomatolog parolini kiriting"] = "Enter dentist password";
    dictionary["Admin telefon orqali stomatolog bilan aniqlashtirgandan keyin kiritadi."] = "Admin enters password after confirming with the dentist via phone.";
    dictionary["Yangi summa"] = "New amount";
    dictionary["Masalan: 250000"] = "E.g.: 250000";
    dictionary["Yangi summa noto'g'ri"] = "Invalid new amount";
    dictionary["Yangi summa noto‘g‘ri"] = "Invalid new amount";
    dictionary["Yangi summa allaqachon to'langan summadan kichik bo'lishi mumkin emas"] = "New amount cannot be less than already paid amount";
    dictionary["Yangi summa allaqachon to‘langan summadan kichik bo‘lishi mumkin emas"] = "New amount cannot be less than already paid amount";
    dictionary["O'zgartirish sababi"] = "Reason for change";
    dictionary["O‘zgartirish sababi"] = "Reason for change";
    dictionary["Masalan: stomatolog summani noto'g'ri kiritgan, rentgen summasi qo'shilmagan"] = "E.g.: dentist entered incorrect amount, xray amount not added";
    dictionary["Masalan: stomatolog summani noto‘g‘ri kiritgan, rentgen summasi qo‘shilmagan"] = "E.g.: dentist entered incorrect amount, xray amount not added";
    dictionary["Sababni kiriting"] = "Enter reason";
    dictionary["Orqaga"] = "Back";
    dictionary["Davom etish"] = "Continue";

    // Staff creation error messages EN
    dictionary["Barcha maydonlar to‘ldirilishi shart"] = "All fields must be filled";
    dictionary["G'aznachi muvaffaqiyatli qo‘shildi"] = "Cashier successfully added";
    dictionary["G'aznachi qo‘shish"] = "Add Cashier";
    dictionary["G'aznachini saqlash"] = "Save Cashier";
    dictionary["Ro‘yxatdagi g'aznachilar"] = "List of Cashiers";
    dictionary["Hozircha hech qanday g'aznachi qo‘shilmagan."] = "No cashiers added yet.";
    dictionary["Ism faqat harflardan iborat bo‘lishi kerak."] = "Name must only contain letters.";
    dictionary["Telefon formati noto‘g‘ri: +998 (95) 123-45-67"] = "Invalid phone format: +998 (95) 123-45-67";
    dictionary["Email formati noto‘g‘ri."] = "Invalid email format.";
    dictionary["Parol kamida 6 belgidan iborat bo‘lishi kerak."] = "Password must be at least 6 characters.";
    dictionary["Tajriba 0 dan 50 yilgacha butun son bo‘lishi kerak."] = "Experience must be an integer between 0 and 50 years.";
    dictionary["Hech bo‘lmaganda bitta mutaxassislik tanlanishi kerak."] = "At least one specialty must be selected.";
    dictionary["Kamida 6 ta belgidan iborat bo‘lishi kerak."] = "Must be at least 6 characters.";
    dictionary["Yangi stomatolog muvaffaqiyatli qo‘shildi!"] = "New dentist successfully added!";
    dictionary["Yangi Stomatolog Qo‘shish"] = "Add New Dentist";
    dictionary["Quyidagi ma’lumotlarni to‘ldiring."] = "Fill in the following details.";
    dictionary["Bir nechta yo‘nalishni tanlash uchun <b>Ctrl</b> (yoki Mac’da"] = "To select multiple specialties hold <b>Ctrl</b> (or cmd on Mac";
    dictionary["Qo‘shilmoqda..."] = "Adding...";
    dictionary["Ism, telefon va tug‘ilgan sana majburiy"] = "Name, phone, and DOB are required";
    dictionary["Bemor login sahifasida <b>ism</b>, <b>telefon raqam</b> va <b>DOB</b> orqali parol o‘rnatadi"] = "Patient sets password on login page via <b>name</b>, <b>phone number</b>, and <b>DOB</b>";
    dictionary["Mahalla / Ko‘cha"] = "Mahalla / Street";
    dictionary["Qo‘shimcha qabulxonalar boshqaruvi"] = "Manage receptionists";
    dictionary["Qabulxonani saqlash"] = "Save Receptionist";
    dictionary["Hozircha qo‘shimcha qabulxona xodimlari qo‘shilmagan."] = "No additional receptionists added yet.";

    // PatientModal Page EN
    dictionary["Tahrirlash uchun parolni kiriting."] = "Enter password to edit.";
    dictionary["Kirish"] = "Login";
    dictionary["Maxfiy infeksion belgilar"] = "Confidential infectious markers";
    dictionary["Belgilanmagan"] = "Not specified";
    dictionary["Chaqirildi"] = "Called";
    dictionary["Tugallangan"] = "Completed";
    dictionary["Ortodont nazorat ma'lumoti"] = "Orthodontic control data";
    dictionary["Ortodont nazorat ma‘lumoti"] = "Orthodontic control data";
    dictionary["Navbat raqami:"] = "Queue number:";
    dictionary["Maqsad:"] = "Purpose:";
    dictionary["Birinchi tashrif:"] = "First visit:";
    dictionary["Yo‘q"] = "No";
    dictionary["Yo'q"] = "No";
    dictionary["Ha"] = "Yes";
    dictionary["Keyingi nazorat:"] = "Next control:";
    dictionary["Keyingi nazorat sanasi:"] = "Next control date:";
    dictionary["Navbatga qo‘shilgan:"] = "Added to queue:";
    dictionary["Navbatga qo'shilgan:"] = "Added to queue:";
    dictionary["Chaqirilgan:"] = "Called at:";
    dictionary["Tugatildi:"] = "Finished:";
    dictionary["Jarayon rasmlari:"] = "Process images:";
    dictionary["To'langan:"] = "Paid:";
    dictionary["To‘langan:"] = "Paid:";
    dictionary["To'lov:"] = "Payment:";
    dictionary["To‘lov:"] = "Payment:";
    dictionary["Telegram bot ulanmagan"] = "Telegram bot not connected";
    dictionary["Telegram ulangan"] = "Telegram connected";
    dictionary["QR kod orqali bog‘lang"] = "Connect via QR code";
    dictionary["Ulanishni uzish"] = "Disconnect";
    dictionary["Telegramni ulash"] = "Connect Telegram";
    dictionary["Tayyorlanmoqda..."] = "Preparing...";
    dictionary["Bemor ma’lumotlarini tahrirlash"] = "Edit Patient Details";
    dictionary["Ism, telefon, manzil, allergiya va boshqa ma’lumotlarni shu yerda yangilang."] = "Update name, phone, address, allergies, and other details here.";
    dictionary["Ism va familiya"] = "Full Name";
    dictionary["Jinsi"] = "Gender";
    dictionary["Manzil"] = "Address";
    dictionary["Allergiya"] = "Allergy";
    dictionary["Tibbiy ogohlantirish"] = "Medical Warning";
    dictionary["Ortodont nazorat"] = "Orthodontist Control";
    dictionary["Qabul va davolash tarixi"] = "Appointments and Treatment History";
    dictionary["Shablon:"] = "Template:";
    dictionary["Diagnos:"] = "Diagnosis:";
    dictionary["Tishlar:"] = "Teeth:";
    dictionary["Muolajalar:"] = "Procedures:";
    dictionary["Keyingi reja:"] = "Next Step:";
    dictionary["Dorilar:"] = "Medicines:";
    dictionary["Eslatma:"] = "Notes:";
    dictionary["Keyingi qabul:"] = "Next Appointment:";
    dictionary["Qabul summasi:"] = "Appointment Amount:";
    dictionary["Qolgan qarz:"] = "Remaining Debt:";
    dictionary["Status:"] = "Status:";
    dictionary["Yaratilgan:"] = "Created:";
    dictionary["To‘lovlar:"] = "Payments:";
    dictionary["To'lovlar:"] = "Payments:";
    dictionary["Summa o‘zgarishlari:"] = "Amount Changes:";
    dictionary["Summa o'zgarishlari:"] = "Amount Changes:";
    dictionary["Kim o‘zgartirdi:"] = "Changed by:";
    dictionary["Kim o'zgartirdi:"] = "Changed by:";
    dictionary["Rentgenlar:"] = "X-rays:";

    // Warehouse, Finance, Login EN
    dictionary["Olingan Oylik & Ish haqilari"] = "RECEIVED SALARY & WAGES";
    dictionary["+ Kirim"] = "+ Incoming";
    dictionary["- Chiqim"] = "- Outgoing";
    dictionary["− Chiqim"] = "- Outgoing";
    dictionary["Yangi material"] = "New Material";
    dictionary["Parolingiz"] = "Your password";
    dictionary["Admin"] = "Admin";
    dictionary["Dan"] = "From";
    dictionary["Gacha"] = "To";
    dictionary["Hafta"] = "Week";
    dictionary["Tushgan Pullar (Maosh)"] = "Received money (salary)";
    dictionary["Jami to'langan ish haqilari"] = "Total salary paid";
    dictionary["Jami to‘langan ish haqilari"] = "Total salary paid";
    dictionary["Sarflangan Materiallar"] = "Spent materials";
    dictionary["Olingan sarf materiallari qiymati"] = "Spent materials value";
    dictionary["Sof Foyda (Balans)"] = "Net profit (balance)";
    dictionary["Oylik minus xarajatlar qoldig'i"] = "Remaining salary minus expenses";
    dictionary["Oylik minus xarajatlar qoldig‘i"] = "Remaining salary minus expenses";
    dictionary["To'lovlar tarixi topilmadi"] = "Payment history not found";
    dictionary["To‘lovlar tarixi topilmadi"] = "Payment history not found";
    dictionary["Sana"] = "Date";
    dictionary["Summa"] = "Amount";
    dictionary["Izoh"] = "Note";
    dictionary["Oylik komissiya to'lovi"] = "Monthly commission payment";
    dictionary["Oylik komissiya to‘lovi"] = "Monthly commission payment";
    dictionary["Jami"] = "Total";
    dictionary["Sarflangan Materiallar (Xarajat)"] = "Spent materials (expenses)";
    dictionary["Xarajatlar tarixi topilmadi"] = "Expense history not found";
    dictionary["Material"] = "Material";
    dictionary["Miqdor"] = "Quantity";
    dictionary["Qiymati"] = "Value";
    dictionary["O'chirilgan material"] = "Deleted material";
    dictionary["O‘chirilgan material"] = "Deleted material";
    dictionary["Jami xarajat"] = "Total expenses";
    dictionary["Qulflangan"] = "Locked";
    dictionary["🔒 Qulflangan"] = "🔒 Locked";
    dictionary["Qidirish: bemor / telefon / stomatolog"] = "Search: patient / phone / dentist";
    dictionary["• Oxirgi to'lov:"] = "• Last payment:";
    dictionary["• Oxirgi to‘lov:"] = "• Last payment:";

  }

  // Normalize apostrophes for matching Uzbek text (including modifier letter apostrophe \u02bc)
  const normalizeApostrophes = (str) => {
    if (!str) return str;
    return str.replace(/[‘’'ʼ`´]/g, "‘");
  };

  const normalizedDictionary = {};
  for (const [key, value] of Object.entries(dictionary)) {
    normalizedDictionary[normalizeApostrophes(key).toLowerCase()] = value;
  }

  const translateValue = (val) => {
    if (!val) return val;
    const trimmed = val.trim();
    if (!trimmed) return val;

    const norm = (str) => normalizeApostrophes(str.trim()).toLowerCase();

    // 1. Check exact match
    const normalizedVal = norm(trimmed);
    if (normalizedDictionary[normalizedVal]) {
      return val.replace(trimmed, normalizedDictionary[normalizedVal]);
    }

    // 2. Comma-separated list splitting
    if (trimmed.includes(',')) {
      const parts = trimmed.split(',').map(part => {
        const pTrimmed = part.trim();
        const pNorm = norm(pTrimmed);
        if (normalizedDictionary[pNorm]) {
          return part.replace(pTrimmed, normalizedDictionary[pNorm]);
        }
        return part;
      });
      return parts.join(', ');
    }

    // 3. Dynamic experience / time units
    if (trimmed.toLowerCase() === 'yil') {
      return activeLang === 'en' ? 'years' : activeLang === 'ru' ? 'лет' : val;
    }
    if (/^\d+\s+yil$/i.test(trimmed)) {
      const num = trimmed.match(/^\d+/)[0];
      return activeLang === 'en' ? `${num} years` : activeLang === 'ru' ? `${num} лет` : val;
    }

    // 4. Weekdays with short dates: "Se 14.07" -> "Tue 14.07"
    const weekdayMatch = trimmed.match(/^(Du|Se|Ch|Pa|Ju|Sh|Ya)\s+(\d{2}\.\d{2})$/i);
    if (weekdayMatch) {
      const day = weekdayMatch[1];
      const dateStr = weekdayMatch[2];
      const enDays = { du: "Mon", se: "Tue", ch: "Wed", pa: "Thu", ju: "Fri", sh: "Sat", ya: "Sun" };
      const ruDays = { du: "Пн", se: "Вт", ch: "Ср", pa: "Чт", ju: "Пт", sh: "Сб", ya: "Вс" };
      const dayKey = day.toLowerCase();
      const translatedDay = activeLang === 'en' ? enDays[dayKey] : activeLang === 'ru' ? ruDays[dayKey] : day;
      return `${translatedDay} ${dateStr}`;
    }

    // 5. Weekdays with full dates: "14-07-2026, Seshanba" -> "14-07-2026, Tuesday" / "14-07-2026, Вторник"
    const fullDateMatch = trimmed.match(/^(\d{2}-\d{2}-\d{4}),\s+(Dushanba|Seshanba|Chorshanba|Payshanba|Juma|Shanba|Yakshanba)$/i);
    if (fullDateMatch) {
      const datePart = fullDateMatch[1];
      const day = fullDateMatch[2].toLowerCase();
      const enDays = {
        dushanba: "Monday",
        seshanba: "Tuesday",
        chorshanba: "Wednesday",
        payshanba: "Thursday",
        juma: "Friday",
        shanba: "Saturday",
        yakshanba: "Sunday"
      };
      const ruDays = {
        dushanba: "Понедельник",
        seshanba: "Вторник",
        chorshanba: "Среда",
        payshanba: "Четверг",
        juma: "Пятница",
        shanba: "Суббота",
        yakshanba: "Воскресенье"
      };
      const translatedDay = activeLang === 'en' ? enDays[day] : activeLang === 'ru' ? ruDays[day] : day;
      return `${datePart}, ${translatedDay}`;
    }

    // 6. Dynamic remaining minutes: "32 daqiqa qoldi" / "32 daqiqa o'tdi"
    const minutesMatch = trimmed.match(/^(\d+)\s+daqiqa\s+(qoldi|o['‘`’]tdi)$/i);
    if (minutesMatch) {
      const num = minutesMatch[1];
      const action = minutesMatch[2].toLowerCase();
      if (action.includes('qold')) {
        return activeLang === 'en' ? `${num} minutes left` : activeLang === 'ru' ? `Осталось ${num} минут` : val;
      } else {
        return activeLang === 'en' ? `${num} minutes ago` : activeLang === 'ru' ? `Прошло ${num} минут` : val;
      }
    }

    // 7. Dynamic dashboard status values: "1 ta kutilmoqda / 0 ta qabulda"
    const statsValueMatch = trimmed.match(/^(\d+)\s+ta\s+kutilmoqda\s+\/\s+(\d+)\s+ta\s+qabulda$/i);
    if (statsValueMatch) {
      const pending = statsValueMatch[1];
      const active = statsValueMatch[2];
      return activeLang === 'en'
        ? `${pending} pending / ${active} in progress`
        : activeLang === 'ru'
          ? `${pending} ожидает / ${active} на приёме`
          : val;
    }

    // 8. Dynamic dashboard status hints: "0 ta yakunlangan • 0 ta kelmagan • 0 ta bekor"
    const statsHintMatch = trimmed.match(/^(\d+)\s+ta\s+yakunlangan\s+•\s+(\d+)\s+ta\s+kelmagan\s+•\s+(\d+)\s+ta\s+bekor$/i);
    if (statsHintMatch) {
      const done = statsHintMatch[1];
      const missed = statsHintMatch[2];
      const cancelled = statsHintMatch[3];
      return activeLang === 'en'
        ? `${done} completed • ${missed} no show • ${cancelled} cancelled`
        : activeLang === 'ru'
          ? `${done} завершено • ${missed} не явилось • ${cancelled} отменено`
          : val;
    }

    // 9. Ko'rsatilmoqda: 11 / 11
    const showMatch = trimmed.match(/^Ko['‘`’]rsatilmoqda:\s*(\d+)\s*\/\s*(\d+)$/i);
    if (showMatch) {
      const current = showMatch[1];
      const total = showMatch[2];
      return activeLang === 'en' ? `Showing: ${current} / ${total}` : activeLang === 'ru' ? `Показано: ${current} / ${total}` : val;
    }

    // 10. Umumiy qarz: 20 000 so'm
    const debtMatch = trimmed.match(/^Umumiy\s+qarz:\s*(.*)$/i);
    if (debtMatch) {
      const amount = debtMatch[1].replace(/\s*so['‘`’]m/gi, activeLang === 'en' ? ' som' : activeLang === 'ru' ? ' сум' : ' so‘m');
      return activeLang === 'en' ? `Total debt: ${amount}` : activeLang === 'ru' ? `Общий долг: ${amount}` : val;
    }

    // 11. Live holat: Свободно
    const liveMatch = trimmed.match(/^Live\s+holat:\s*(.*)$/i);
    if (liveMatch) {
      const status = liveMatch[1];
      return activeLang === 'en' ? `Live status: ${status}` : activeLang === 'ru' ? `Живой статус: ${status}` : val;
    }

    // 12. Sahifa: 1 / 3
    const pageMatch = trimmed.match(/^Sahifa:\s*(\d+)\s*\/\s*(\d+)$/i);
    if (pageMatch) {
      const current = pageMatch[1];
      const total = pageMatch[2];
      return activeLang === 'en' ? `Page: ${current} / ${total}` : activeLang === 'ru' ? `Страница: ${current} / ${total}` : val;
    }

    // 13. Currency values: "150 000 so'm" -> "150 000 сум" / "150 000 som"
    if (trimmed.toLowerCase().endsWith("so'm") || trimmed.toLowerCase().endsWith("so‘m")) {
      const suffix = activeLang === 'en' ? ' som' : activeLang === 'ru' ? ' сум' : ' so‘m';
      return val.replace(/\s*so['‘`’]m/gi, suffix);
    }

    // 14. Dona units: "2 dona" -> "2 шт." / "2 pcs"
    const donaMatch = trimmed.match(/^(\d+)\s+dona$/i);
    if (donaMatch) {
      const num = donaMatch[1];
      return activeLang === 'en' ? `${num} pcs` : activeLang === 'ru' ? `${num} шт.` : val;
    }
    const donaMinMatch = trimmed.match(/^(.*)\b(\d+)\s+dona\b(.*)$/i);
    if (donaMinMatch) {
      return val.replace(/(\d+)\s+dona/gi, (m, num) => {
        return activeLang === 'en' ? `${num} pcs` : activeLang === 'ru' ? `${num} шт.` : `${num} dona`;
      });
    }

    // 15. Prefix match for Jonli Yuborish: "Jonli Yuborish — Behzod Madmarov"
    if (trimmed.startsWith("Jonli Yuborish —")) {
      const prefix = activeLang === 'en' ? "Send to Live Queue —" : activeLang === 'ru' ? "Отправить в живую очередь —" : "Jonli Yuborish —";
      return val.replace(/^Jonli\s+Yuborish\s+—/gi, prefix);
    }
    if (trimmed.startsWith("🟢 Kirim —")) {
      const prefix = activeLang === 'en' ? "🟢 Incoming —" : activeLang === 'ru' ? "🟢 Приход —" : "🟢 Kirim —";
      return val.replace(/^🟢\s+Kirim\s+—/gi, prefix);
    }
    if (trimmed.startsWith("🔴 Chiqim —")) {
      const prefix = activeLang === 'en' ? "🔴 Outgoing —" : activeLang === 'ru' ? "🔴 Расход —" : "🔴 Chiqim —";
      return val.replace(/^🔴\s+Chiqim\s+—/gi, prefix);
    }

    // 16. Kam qoldiq warning helper: "⚠ Kam qoldiq (min: 2 dona)" / "⚠ Kam qoldiq (min: 2 шт.)"
    const kamQoldiqMatch = trimmed.match(/^(?:⚠?\s*)?Kam\s+qoldiq\s+\(min:\s*(.*)\)$/i);
    if (kamQoldiqMatch) {
      const minVal = kamQoldiqMatch[1]; // e.g. "2 dona" or "2 шт."
      const translatedMinVal = translateValue(minVal);
      return activeLang === 'en'
        ? `⚠ Low stock (min: ${translatedMinVal})`
        : activeLang === 'ru'
          ? `⚠ Мало остатков (мин: ${translatedMinVal})`
          : val;
    }
    // Handle split text node prefix: "⚠ Kam qoldiq (min: " / "Kam qoldiq (min: "
    if (/^(?:⚠?\s*)?Kam\s+qoldiq\s*\(min:\s*$/i.test(trimmed)) {
      return activeLang === 'en'
        ? "⚠ Low stock (min: "
        : activeLang === 'ru'
          ? "⚠ Мало остатков (мин: "
          : val;
    }

    // 16b. Prefix match for Edit: "✎ Tahrirlash — plomba"
    if (trimmed.startsWith("✎ Tahrirlash —")) {
      const prefix = activeLang === 'en' ? "✎ Edit —" : activeLang === 'ru' ? "✎ Редактировать —" : "✎ Tahrirlash —";
      return val.replace(/^✎\s+Tahrirlash\s+—/gi, prefix);
    }

    // 17. Dynamic stats info: "Tashrif: 0 • Bemor: 0" -> "Визиты: 0 • Пациенты: 0"
    const statsInfoMatch = trimmed.match(/^Tashrif:\s*(\d+)\s*•\s*Bemor:\s*(\d+)$/i);
    if (statsInfoMatch) {
      const visits = statsInfoMatch[1];
      const patients = statsInfoMatch[2];
      return activeLang === 'en'
        ? `Visits: ${visits} • Patients: ${patients}`
        : activeLang === 'ru'
          ? `Визиты: ${visits} • Пациенты: ${patients}`
          : val;
    }

    // 18. Dynamic debt rate info: "To‘lov: 0% • Tushum: 0 so‘m"
    const debtRateMatch = trimmed.match(/^To[‘'‘]lov:\s*(\d+)%\s*•\s*Tushum:\s*(.*)$/i);
    if (debtRateMatch) {
      const rate = debtRateMatch[1];
      const paid = debtRateMatch[2].replace(/\s*so['‘`’]m/gi, activeLang === 'en' ? ' som' : activeLang === 'ru' ? ' сум' : ' so‘m');
      return activeLang === 'en'
        ? `Paid: ${rate}% • Revenue: ${paid}`
        : activeLang === 'ru'
          ? `Оплата: ${rate}% • Выручка: ${paid}`
          : val;
    }

    // 19. Dynamic to'lov max value placeholder: "To'lov (max: 20 000)" or "To‘lov (max: 20 000)"
    const maxPaymentMatch = trimmed.match(/^To[‘'‘]lov\s*\(max:\s*(.*)\)$/i);
    if (maxPaymentMatch) {
      const amount = maxPaymentMatch[1];
      return activeLang === 'en'
        ? `Payment (max: ${amount})`
        : activeLang === 'ru'
          ? `Оплата (макс: ${amount})`
          : val;
    }

    // 20. Suffix for checking / searching placeholders/texts: "Bemor ID (B-1) • tekshirilmoqda"
    if (trimmed.endsWith("• tekshirilmoqda")) {
      const main = trimmed.replace("• tekshirilmoqda", "").trim();
      const transMain = translateValue(main);
      return activeLang === 'en' ? `${transMain} • checking` : activeLang === 'ru' ? `${transMain} • проверка` : val;
    }
    if (trimmed.endsWith("• qidirilmoqda")) {
      const main = trimmed.replace("• qidirilmoqda", "").trim();
      const transMain = translateValue(main);
      return activeLang === 'en' ? `${transMain} • searching` : activeLang === 'ru' ? `${transMain} • поиск` : val;
    }

    // 21. Dynamic joriy holat: "Joriy holat: Belgilanmagan"
    const joriyHolatMatch = trimmed.match(/^Joriy\s+holat:\s*(.*)$/i);
    if (joriyHolatMatch) {
      const status = translateValue(joriyHolatMatch[1]);
      return activeLang === 'en' ? `Current status: ${status}` : activeLang === 'ru' ? `Текущий статус: ${status}` : val;
    }

    return val;
  };

  const translateNode = (node) => {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const val = node.nodeValue;
      const translated = translateValue(val);
      if (translated !== val) {
        node.nodeValue = translated;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip script/style tags
      if (node.tagName === "SCRIPT" || node.tagName === "STYLE") return;

      // Inputs placeholders/values
      if (node.tagName === "INPUT" || node.tagName === "TEXTAREA") {
        const placeholder = node.getAttribute("placeholder");
        if (placeholder) {
          const trans = translateValue(placeholder);
          if (trans !== placeholder) node.setAttribute("placeholder", trans);
        }
        if (node.type === "button" || node.type === "submit") {
          const val = node.value;
          const trans = translateValue(val);
          if (trans !== val) node.value = trans;
        }
      }

      // Title attribute
      const title = node.getAttribute("title");
      if (title) {
        const trans = translateValue(title);
        if (trans !== title) node.setAttribute("title", trans);
      }

      // Recurse children
      for (let child = node.firstChild; child; child = child.nextSibling) {
        translateNode(child);
      }
    }
  };

  const translateTitle = () => {
    const t = document.title;
    const trans = translateValue(t);
    if (trans !== t) document.title = trans;
  };

  const init = () => {
    translateNode(document.body || document.documentElement);
    translateTitle();

    const observer = new MutationObserver((mutations) => {
      observer.disconnect();

      try {
        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => translateNode(node));
          } else if (mutation.type === "characterData") {
            translateNode(mutation.target);
          }
        }
      } catch (err) {
        console.error("Translation observer error:", err);
      } finally {
        observer.observe(document.body || document.documentElement, {
          childList: true,
          subtree: true,
          characterData: true
        });
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
