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

    // Public website translations
    dictionary["Bosh sahifa"] = "Главная";
    dictionary["Stomatologlar"] = "Стоматологи";
    dictionary["Biz haqimizda"] = "О нас";
    dictionary["Aloqa"] = "Контакты";
    dictionary["Barcha stomatologlarni ko‘rish"] = "Посмотреть всех стоматологов";
    dictionary["Uchrashuv Belgilash"] = "Записаться на прием";
    
    dictionary["Magic Denta"] = "Magic Denta";
    dictionary["ga xush kelibsiz"] = "Добро пожаловать в";
    dictionary["Sizning tabassumingiz eng yaxshi g'amxo'rlikka loyiq. Magic Dentada biz har bir tashrifni ijobiy tajribaga aylantirish uchun professionallik, qulaylik va eng so'nggi stomatologik texnologiyalarni birlashtiramiz."] = "Ваша улыбка заслуживает наилучшего ухода. В Magic Denta мы объединяем профессионализм, комфорт и новейшие стоматологические технологии, чтобы сделать каждый визит приятным.";
    dictionary["Sizning tabassumingiz eng yaxshi g‘amxo‘rlikka loyiq. Magic Dentada biz har bir tashrifni ijobiy tajribaga aylantirish uchun professionallik, qulaylik va eng so‘nggi stomatologik texnologiyalarni birlashtiramiz."] = "Ваша улыбка заслуживает наилучшего ухода. В Magic Denta мы объединяем профессионализм, комфорт и новейшие стоматологические технологии, чтобы сделать каждый визит приятным.";
    dictionary["Uchrashuvga yozilish"] = "Записаться на прием";

    dictionary["Bizning mutaxassisliklarimiz"] = "Наши специальности";
    dictionary["Zamonaviy texnologiyalar va do'stona muhit bilan eng yaxshi yordamni taqdim etadigan tajribali stomatologlarimizning keng doiradagi stomatologiya mutaxassisliklarini kashf eting."] = "Откройте для себя широкий спектр наших стоматологических специальностей, где наши опытные стоматологи предоставят вам лучший уход в дружелюбной атмосфере с использованием современных технологий.";
    dictionary["Zamonaviy texnologiyalar va do‘stona muhit bilan eng yaxshi yordamni taqdim etadigan tajribali stomatologlarimizning keng doiradagi stomatologiya mutaxassisliklarini kashf eting."] = "Откройте для себя широкий спектр наших стоматологических специальностей, где наши опытные стоматологи предоставят вам лучший уход в дружелюбной атмосфере с использованием современных технологий.";

    dictionary["Ayol stomatolog"] = "Женский стоматолог";
    dictionary["Terapevtik stomatologiy"] = "Терапевтическая стоматология";
    dictionary["Terapevtik stomatologiya"] = "Терапевтическая стоматология";
    dictionary["Ortodontiya"] = "Ортодонтия";
    dictionary["Ortopedik stomatologiya"] = "Ортопедическая стоматология";
    dictionary["Stomatologiya Jarrohligi"] = "Стоматологическая хирургия";
    dictionary["Parodontologiya"] = "Пародонтология";
    dictionary["Bolalar stomatologiyasi"] = "Детская стоматология";
    dictionary["Implantologiya"] = "Имплантология";
    dictionary["Estetik stomatologiya"] = "Эстетическая стоматология";
    dictionary["Rentgenologiya"] = "Рентгенология";

    dictionary["Eng Yaxshi Stomatologlar"] = "Лучшие стоматологи";
    dictionary["Ajoyib yordam ko‘rsatishga bag‘ishlangan tajribali stomatologlarimiz bilan tanishing. Ular sizning sog‘lom va chiroyli tabassumingiz uchun professional xizmat ko‘rsatadi."] = "Познакомьтесь с нашими опытными стоматологами, готовыми оказать вам квалифицированную помощь. Они предоставят профессиональные услуги для вашей здоровой и красивой улыбки.";
    dictionary["Ajoyib yordam ko‘rsatishga bag‘ishlangan tajribali stomatologlarimiz"] = "Наши опытные стоматологи, готовые оказать вам квалифицированную помощь";

    dictionary["Akkaunt yarating va Uchrashuvni belgilang"] = "Создайте аккаунт и запишитесь на прием";
    dictionary["Xavfsiz onlayn bron qilish tizimimiz orqali keyingi tashrifingizni tez va qulay tarzda rejalashtiring. Uchrashuvlaringiz va Akkauntingizni bitta joyda boshqaring."] = "Быстро и удобно планируйте свой следующий визит через нашу безопасную систему онлайн-бронирования. Управляйте своими приемами и аккаунтом в одном месте.";
    dictionary["Akkaunt Yaratish"] = "Создать аккаунт";

    dictionary["Biz bilan bog‘lanish"] = "Связаться с нами";
    dictionary["Biz bilan bog'lanish"] = "Связаться с нами";
    dictionary["24 / 7 Ochiq"] = "Открыто 24/7";
    dictionary["Tezkor havolalar"] = "Быстрые ссылки";
    dictionary["Bizning manzil"] = "Наш адрес";
    dictionary["Barcha huquqlar himoyalangan."] = "Все права защищены.";

    dictionary["Hamma Stomatologlar"] = "Все стоматологи";
    dictionary["Mutaxassisliklar"] = "Специальности";
    dictionary["Bu mutaxassislik bo‘yicha stomatologlar topilmadi."] = "Стоматологи по этой специальности не найдены.";
    dictionary["yo‘nalishi uchun Stomatologlar"] = "Стоматологи по направлению";

    dictionary["Savollaringiz bormi yoki uchrashuv belgilamoqchimisiz? Quyidagi shakl orqali bizga yozing — jamoamiz tez orada sizga javob beradi."] = "Есть вопросы или хотите записаться на прием? Напишите нам через форму ниже — наша команда ответит вам в ближайшее время.";
    dictionary["Aloqa ma’lumotlari"] = "Контактная информация";
    dictionary["Xabar yuborish"] = "Отправить сообщение";
    dictionary["Ism"] = "Имя";
    dictionary["Ism sharifingizni kiriting"] = "Введите ваше имя и фамилию";
    dictionary["Telefon raqam"] = "Номер телефона";
    dictionary["Xabar"] = "Сообщение";
    dictionary["Xabaringizni yozing..."] = "Напишите ваше сообщение...";
    dictionary["Yuborish"] = "Отправить";
    dictionary["Yuborilmoqda..."] = "Отправка...";

    dictionary["Magic Denta — Sog‘lom tabassum, ishonchli g‘amxo‘rlik"] = "Magic Denta — Здоровая улыбка, надежная забота";
    dictionary["Biz zamonaviy usullar orqali har bir tashrifni qulay va samarali qilamiz."] = "Мы делаем каждый визит комфортным и эффективным с помощью современных методов.";
    dictionary["Stomatologlarimizni ko‘ring"] = "Посмотреть наших стоматологов";
    dictionary["Bizning prinsiplar"] = "Наши принципы";
    dictionary["Bemor xavfsizligi va qulayligi"] = "Безопасность и комфорт пациента";
    dictionary["Zamonaviy diagnostika va uskunalar"] = "Современная диагностика и оборудование";
    dictionary["Moliyaviy shaffoflik va ma’lumot berish"] = "Финансовая прозрачность и информирование";
    dictionary["Bizning missiyamiz"] = "Наша миссия";
    dictionary["Har bir bemorga individual yondashuv va zamonaviy stomatologik xizmatlar orqali sog‘lom, chiroyli tabassumni tiklash."] = "Восстановление здоровой и красивой улыбки каждого пациента на основе индивидуального подхода и современных стоматологических услуг.";
    dictionary["Bizning ko‘zlangan maqsad"] = "Наша цель";
    dictionary["Mahalliy va mintaqaviy darajada ishonchli klinika bo‘lish, shuningdek bemorlar uchun eng qulay, sifatli davolash xizmatlarini taqdim etish."] = "Стать надежной клиникой на местном и региональном уровнях, а также предоставлять пациентам наиболее удобные и качественные лечебные услуги.";
    dictionary["Bizning yo‘nalishlar"] = "Наши направления";
    dictionary["Nima uchun biz?"] = "Почему мы?";
    dictionary["Sifat, tajriba va bemorlar bilan ishonchli munosabat — bu bizning asosiy tamoyillarimiz."] = "Качество, опыт и доверительные отношения с пациентами — наши главные принципы.";
    dictionary["Yillik tajriba"] = "Лет опыта";
    dictionary["Mamnun mijozlar"] = "Довольных клиентов";
    dictionary["Malakali xodimlar"] = "Квалифицированных специалистов";
    dictionary["Vaqtni bron qiling"] = "Забронировать время";
    dictionary["Onlayn tizim orqali oson va tez bron — bemorlarimiz uchun qulay."] = "Простая и быстрая онлайн-запись — удобно для наших пациентов.";
    
    dictionary["Parolni unutdingizmi?"] = "Забыли пароль?";
    dictionary["Ro‘yxatdan o‘tish"] = "Регистрация";

    // Doctor Details / Appointments RU
    dictionary["Ma'lumoti"] = "Образование";
    dictionary["Ma‘lumoti"] = "Образование";
    dictionary["Tajriba"] = "Опыт";
    dictionary["Shifokor haqida"] = "О враче";
    dictionary["Onlayn qabul"] = "Онлайн прием";
    dictionary["Tushlik"] = "Обед";
    dictionary["Yakshanba: onlayn bron yopiq"] = "Воскресенье: онлайн бронирование закрыто";
    dictionary["Agar sizga kerakli vaqtda onlayn bron mavjud bo'lmasa, iltimos, klinikamizga qo'ng'iroq qilib administrator bilan bog'laning."] = "Если в нужное вам время нет свободной онлайн-записи, пожалуйста, позвоните в нашу клинику и свяжитесь с администратором.";
    dictionary["Agar sizga kerakli vaqtda onlayn bron mavjud bo‘lmasa, iltimos, klinikamizga qo‘ng‘iroq qilib administrator bilan bog‘laning."] = "Если в нужное вам время нет свободной онлайн-записи, пожалуйста, позвоните в нашу клинику и свяжитесь с администратором.";
    dictionary["O'sh davlat tibbiyot insituti"] = "Ошский государственный медицинский институт";
    dictionary["O'sh davlat tibbiyot instituti"] = "Ошский государственный медицинский институт";
    dictionary["O‘sh davlat tibbiyot insituti"] = "Ошский государственный медицинский институт";
    dictionary["O‘sh davlat tibbiyot instituti"] = "Ошский государственный медицинский институт";
    dictionary["Uchrashuv vaqtini tanlang"] = "Выберите время приема";
    dictionary["Tanlangan vaqt:"] = "Выбранное время:";
    dictionary["Tasdiqlash"] = "Подтвердить";
    dictionary["Hoziroq Uchrashuv belgilash"] = "Записаться прямо сейчас";
    dictionary["Kirish / Ro‘yxatdan o‘tish"] = "Войти / Зарегистрироваться";
    dictionary["Kirish / Ro'yxatdan o'tish"] = "Войти / Зарегистрироваться";

    // Contact Page / Footer / Register RU
    dictionary["Biz bilan bog‘laning"] = "Связаться с нами";
    dictionary["Biz bilan bog'laning"] = "Связаться с нами";
    dictionary["Ish vaqti:"] = "Часы работы:";
    dictionary["24 / 7 xizmat"] = "Круглосуточно 24/7";
    dictionary["24 / 7 Ochiq"] = "Круглосуточно 24/7";
    dictionary["Ijtimoiy tarmoqlar"] = "Социальные сети";
    dictionary["Akkaunt yaratish"] = "Создать аккаунт";
    dictionary["Uchrashuvni band qilish uchun iltimos, hisobingizdan foydalaning."] = "Для бронирования приема, пожалуйста, войдите в свой аккаунт.";
    dictionary["Akkaunt rasmi"] = "Фото профиля";
    dictionary["Ism sharifingiz"] = "Имя и фамилия";
    dictionary["Ism Sharifingiz"] = "Имя и фамилия";
    dictionary["Ism sharifingizni kiriting"] = "Введите ваше имя и фамилию";
    dictionary["Email manzilingiz (ixtiyoriy)"] = "Ваш Email (необязательно)";
    dictionary["Shaxar / Tuman"] = "Город / Район";
    dictionary["Mahalla, Ko'cha, Xonadon"] = "Махалля, улица, дом/квартира";
    dictionary["Mahalla, Ko‘cha, Xonadon"] = "Махалля, улица, дом/квартира";
    dictionary["Jins"] = "Пол";
    dictionary["Parolingiz"] = "Пароль";
    dictionary["Admin yaratgan akkauntni ism, tug'ilgan sana va telefon raqam orqali faollashtiring."] = "Активируйте аккаунт, созданный администратором, с помощью имени, даты рождения и номера телефона.";
    dictionary["Admin yaratgan akkauntni ism, tug‘ilgan sana va telefon raqam orqali faollashtiring."] = "Активируйте аккаунт, созданный администратором, с помощью имени, даты рождения и номера телефона.";
    dictionary["Telefon:"] = "Телефон:";

    // Additional Russian translations for client portal
    dictionary["Kirish muvaffaqiyatli"] = "Вход выполнен успешно";
    dictionary["Mening uchrashuvlarim"] = "Мои приёмы";
    dictionary["Davolash tarixi"] = "История лечения";
    dictionary["Sana: "] = "Дата: ";
    dictionary[" | Vaqt: "] = " | Время: ";
    dictionary["Stomatolog tomonidan yozilgan"] = "Записано стоматологом";
    dictionary["Siz tomonidan yozilgan"] = "Записано вами";
    dictionary["Mening Profilim"] = "Мой профиль";
    dictionary["Shaxsiy ma'lumotlaringizni ko'rish va tahrirlash"] = "Просмотр и редактирование личной информации";
    dictionary["Shaxsiy ma‘lumotlaringizni ko‘rish va tahrirlash"] = "Просмотр и редактирование личной информации";
    dictionary["To'lovlar tarixi"] = "История платежей";
    dictionary["To‘lovlar tarixi"] = "История платежей";
    dictionary["Keyingi ko'rik:"] = "Следующий осмотр:";
    dictionary["Keyingi ko‘rik:"] = "Следующий осмотр:";
    dictionary["To'langan (qarz bor)"] = "Оплачено (есть долг)";
    dictionary["To‘langan (qarz bor)"] = "Оплачено (есть долг)";
    dictionary["To'liq to'langan"] = "Полностью оплачено";
    dictionary["To‘liq to‘langan"] = "Полностью оплачено";
    dictionary["Oxirgi to'lov:"] = "Последний платеж:";
    dictionary["Oxirgi to‘lov:"] = "Последний платеж:";
    dictionary["Qabul qilinmoqda"] = "Принимается";
    dictionary["Yakunlangan"] = "Завершено";

    // Additional Russian translations for client portal
    dictionary["Ulanmagan"] = "Не подключено";
    dictionary["Eslatmalarni Telegram orqali olish uchun akkauntingizni ulang."] = "Привяжите свой аккаунт, чтобы получать уведомления в Telegram.";
    dictionary["Telegram uzish"] = "Отключить Telegram";
    dictionary["Telegram ulash"] = "Подключить Telegram";
    dictionary["Tug‘ilgan sana"] = "Дата рождения";
    dictionary["Tug'ilgan sana"] = "Дата рождения";
    dictionary["Tahrirlash"] = "Редактировать";
    dictionary["Saqlash"] = "Сохранить";
    dictionary["To'lanmagan"] = "Не оплачено";
    dictionary["To‘lanmagan"] = "Не оплачено";
    dictionary["Ishlangan tish(lar)"] = "Обработанные зубы";
    dictionary["Bajarilgan ishlar"] = "Выполненные работы";
    dictionary["Keyingi qadam"] = "Следующий шаг";
    dictionary["Dorilar"] = "Лекарства";
    dictionary["Eslatma"] = "Примечание";
    dictionary["Sana:"] = "Дата:";
    dictionary["Vaqt:"] = "Время:";
    dictionary["Sana: "] = "Дата: ";
    dictionary["Vaqt: "] = "Время: ";
    dictionary[" | Vaqt: "] = " | Время: ";
    dictionary[" | Vaqt:"] = " | Время:";
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

    // Public website translations
    dictionary["Bosh sahifa"] = "Home";
    dictionary["Stomatologlar"] = "Dentists";
    dictionary["Biz haqimizda"] = "About Us";
    dictionary["Aloqa"] = "Contact";
    dictionary["Barcha stomatologlarni ko‘rish"] = "View All Dentists";
    dictionary["Uchrashuv Belgilash"] = "Book Appointment";
    
    dictionary["Magic Denta"] = "Magic Denta";
    dictionary["ga xush kelibsiz"] = "Welcome to";
    dictionary["Sizning tabassumingiz eng yaxshi g'amxo'rlikka loyiq. Magic Dentada biz har bir tashrifni ijobiy tajribaga aylantirish uchun professionallik, qulaylik va eng so'nggi stomatologik texnologiyalarni birlashtiramiz."] = "Your smile deserves the best care. At Magic Denta, we combine professionalism, comfort, and the latest dental technologies to make every visit a positive experience.";
    dictionary["Sizning tabassumingiz eng yaxshi g‘amxo‘rlikka loyiq. Magic Dentada biz har bir tashrifni ijobiy tajribaga aylantirish uchun professionallik, qulaylik va eng so‘nggi stomatologik texnologiyalarni birlashtiramiz."] = "Your smile deserves the best care. At Magic Denta, we combine professionalism, comfort, and the latest dental technologies to make every visit a positive experience.";
    dictionary["Uchrashuvga yozilish"] = "Book Appointment";

    dictionary["Bizning mutaxassisliklarimiz"] = "Our Specialties";
    dictionary["Zamonaviy texnologiyalar va do'stona muhit bilan eng yaxshi yordamni taqdim etadigan tajribali stomatologlarimizning keng doiradagi stomatologiya mutaxassisliklarini kashf eting."] = "Discover a wide range of our dental specialties, where our experienced dentists provide you with the best care in a friendly environment using modern technologies.";
    dictionary["Zamonaviy texnologiyalar va do‘stona muhit bilan eng yaxshi yordamni taqdim etadigan tajribali stomatologlarimizning keng doiradagi stomatologiya mutaxassisliklarini kashf eting."] = "Discover a wide range of our dental specialties, where our experienced dentists provide you with the best care in a friendly environment using modern technologies.";

    dictionary["Ayol stomatolog"] = "Female Dentist";
    dictionary["Terapevtik stomatologiy"] = "Therapeutic Dentistry";
    dictionary["Terapevtik stomatologiya"] = "Therapeutic Dentistry";
    dictionary["Ortodontiya"] = "Orthodontics";
    dictionary["Ortopedik stomatologiya"] = "Orthopedic Dentistry";
    dictionary["Stomatologiya Jarrohligi"] = "Dental Surgery";
    dictionary["Parodontologiya"] = "Periodontics";
    dictionary["Bolalar stomatologiyasi"] = "Pediatric Dentistry";
    dictionary["Implantologiya"] = "Implantology";
    dictionary["Estetik stomatologiya"] = "Aesthetic Dentistry";
    dictionary["Rentgenologiya"] = "Radiology";

    dictionary["Eng Yaxshi Stomatologlar"] = "Top Dentists";
    dictionary["Ajoyib yordam ko‘rsatishga bag‘ishlangan tajribali stomatologlarimiz bilan tanishing. Ular sizning sog‘lom va chiroyli tabassumingiz uchun professional xizmak ko‘rsatadi."] = "Meet our experienced dentists dedicated to providing outstanding care. They offer professional services for your healthy and beautiful smile.";
    dictionary["Ajoyib yordam ko‘rsatishga bag‘ishlangan tajribali stomatologlarimiz"] = "Our experienced dentists dedicated to providing outstanding care";

    dictionary["Akkaunt yarating va Uchrashuvni belgilang"] = "Create an Account and Book an Appointment";
    dictionary["Xavfsiz onlayn bron qilish tizimimiz orqali keyingi tashrifingizni tez va qulay tarzda rejalashtiring. Uchrashuvlaringiz va Akkauntingizni bitta joyda boshqaring."] = "Quickly and conveniently plan your next visit through our secure online booking system. Manage your appointments and account all in one place.";
    dictionary["Akkaunt Yaratish"] = "Create Account";

    dictionary["Biz bilan bog‘lanish"] = "Contact Us";
    dictionary["Biz bilan bog'lanish"] = "Contact Us";
    dictionary["24 / 7 Ochiq"] = "Open 24/7";
    dictionary["Tezkor havolalar"] = "Quick Links";
    dictionary["Bizning manzil"] = "Our Address";
    dictionary["Barcha huquqlar himoyalangan."] = "All rights reserved.";

    dictionary["Hamma Stomatologlar"] = "All Dentists";
    dictionary["Mutaxassisliklar"] = "Specialties";
    dictionary["Bu mutaxassislik bo‘yicha stomatologlar topilmadi."] = "No dentists found for this specialty.";
    dictionary["yo‘nalishi uchun Stomatologlar"] = "Dentists for";

    dictionary["Savollaringiz bormi yoki uchrashuv belgilamoqchimisiz? Quyidagi shakl orqali bizga yozing — jamoamiz tez orada sizga javob beradi."] = "Have questions or want to book an appointment? Write to us via the form below — our team will reply to you soon.";
    dictionary["Aloqa ma’lumotlari"] = "Contact Information";
    dictionary["Xabar yuborish"] = "Send Message";
    dictionary["Ism"] = "Name";
    dictionary["Ism sharifingizni kiriting"] = "Enter your full name";
    dictionary["Telefon raqam"] = "Phone Number";
    dictionary["Xabar"] = "Message";
    dictionary["Xabaringizni yozing..."] = "Type your message...";
    dictionary["Yuborish"] = "Send";
    dictionary["Yuborilmoqda..."] = "Sending...";

    // About page
    dictionary["Magic Denta — Sog‘lom tabassum, ishonchli g‘amxo‘rlik"] = "Magic Denta — Healthy smile, trusted care";
    dictionary["Biz zamonaviy usullar orqali har bir tashrifni qulay va samarali qilamiz."] = "We make every visit comfortable and efficient using modern methods.";
    dictionary["Stomatologlarimizni ko‘ring"] = "See Our Dentists";
    dictionary["Bizning prinsiplar"] = "Our Principles";
    dictionary["Bemor xavfsizligi va qulayligi"] = "Patient Safety & Comfort";
    dictionary["Zamonaviy diagnostika va uskunalar"] = "Modern Diagnostics & Equipment";
    dictionary["Moliyaviy shaffoflik va ma’lumot berish"] = "Financial Transparency & Information";
    dictionary["Bizning missiyamiz"] = "Our Mission";
    dictionary["Har bir bemorga individual yondashuv va zamonaviy stomatologik xizmatlar orqali sog‘lom, chiroyli tabassumni tiklash."] = "To restore healthy, beautiful smiles through an individual approach to every patient and modern dental services.";
    dictionary["Bizning ko‘zlangan maqsad"] = "Our Goal";
    dictionary["Mahalliy va mintaqaviy darajada ishonchli klinika bo‘lish, shuningdek bemorlar uchun eng qulay, sifatli davolash xizmatlarini taqdim etish."] = "To be a trusted clinic locally and regionally, and to provide patients with the most convenient and high-quality treatment services.";
    dictionary["Bizning yo‘nalishlar"] = "Our Specialties";
    dictionary["Nima uchun biz?"] = "Why Choose Us?";
    dictionary["Sifat, tajriba va bemorlar bilan ishonchli munosabat — bu bizning asosiy tamoyillarimiz."] = "Quality, experience, and trusted relationships with patients are our core principles.";
    dictionary["Yillik tajriba"] = "Years of Experience";
    dictionary["Mamnun mijozlar"] = "Happy Patients";
    dictionary["Malakali xodimlar"] = "Qualified Staff";
    dictionary["Vaqtni bron qiling"] = "Book Now";
    dictionary["Onlayn tizim orqali oson va tez bron — bemorlarimiz uchun qulay."] = "Easy and quick booking via the online system — convenient for our patients.";

    dictionary["Parolni unutdingizmi?"] = "Forgot Password?";
    dictionary["Ro‘yxatdan o‘tish"] = "Register";

    // Doctor Details / Appointments EN
    dictionary["Ma'lumoti"] = "Education";
    dictionary["Ma‘lumoti"] = "Education";
    dictionary["Tajriba"] = "Experience";
    dictionary["Shifokor haqida"] = "About Doctor";
    dictionary["Onlayn qabul"] = "Online reception";
    dictionary["Tushlik"] = "Lunch";
    dictionary["Yakshanba: onlayn bron yopiq"] = "Sunday: online booking closed";
    dictionary["Agar sizga kerakli vaqtda onlayn bron mavjud bo'lmasa, iltimos, klinikamizga qo'ng'iroq qilib administrator bilan bog'laning."] = "If online booking is not available at your preferred time, please call our clinic to contact the administrator.";
    dictionary["Agar sizga kerakli vaqtda onlayn bron mavjud bo‘lmasa, iltimos, klinikamizga qo‘ng‘iroq qilib administrator bilan bog‘laning."] = "If online booking is not available at your preferred time, please call our clinic to contact the administrator.";
    dictionary["O'sh davlat tibbiyot insituti"] = "Osh State Medical Institute";
    dictionary["O'sh davlat tibbiyot instituti"] = "Osh State Medical Institute";
    dictionary["O‘sh davlat tibbiyot insituti"] = "Osh State Medical Institute";
    dictionary["O‘sh davlat tibbiyot instituti"] = "Osh State Medical Institute";
    dictionary["Uchrashuv vaqtini tanlang"] = "Select Appointment Time";
    dictionary["Tanlangan vaqt:"] = "Selected Time:";
    dictionary["Tasdiqlash"] = "Confirm";
    dictionary["Hoziroq Uchrashuv belgilash"] = "Book Now";
    dictionary["Kirish / Ro‘yxatdan o‘tish"] = "Sign In / Register";
    dictionary["Kirish / Ro'yxatdan o'tish"] = "Login / Register";

    // Contact Page / Footer / Register EN
    dictionary["Biz bilan bog‘laning"] = "Contact Us";
    dictionary["Biz bilan bog'laning"] = "Contact Us";
    dictionary["Ish vaqti:"] = "Working Hours:";
    dictionary["24 / 7 xizmat"] = "24/7 Service";
    dictionary["24 / 7 Ochiq"] = "Open 24/7";
    dictionary["Ijtimoiy tarmoqlar"] = "Social Networks";
    dictionary["Akkaunt yaratish"] = "Create Account";
    dictionary["Uchrashuvni band qilish uchun iltimos, hisobingizdan foydalaning."] = "Please log in to your account to book an appointment.";
    dictionary["Akkaunt rasmi"] = "Profile Picture";
    dictionary["Ism sharifingiz"] = "Full Name";
    dictionary["Ism Sharifingiz"] = "Full Name";
    dictionary["Ism sharifingizni kiriting"] = "Enter your full name";
    dictionary["Email manzilingiz (ixtiyoriy)"] = "Your Email Address (optional)";
    dictionary["Shaxar / Tuman"] = "City / District";
    dictionary["Mahalla, Ko'cha, Xonadon"] = "Neighborhood, Street, Apartment";
    dictionary["Mahalla, Ko‘cha, Xonadon"] = "Neighborhood, Street, Apartment";
    dictionary["Jins"] = "Gender";
    dictionary["Parolingiz"] = "Password";
    dictionary["Admin yaratgan akkauntni ism, tug'ilgan sana va telefon raqam orqali faollashtiring."] = "Activate the account created by the admin using your name, date of birth, and phone number.";
    dictionary["Admin yaratgan akkauntni ism, tug‘ilgan sana va telefon raqam orqali faollashtiring."] = "Activate the account created by the admin using your name, date of birth, and phone number.";
    dictionary["Telefon:"] = "Phone:";

    // Additional English translations for client portal
    dictionary["Kirish muvaffaqiyatli"] = "Login successful";
    dictionary["Mening uchrashuvlarim"] = "My Appointments";
    dictionary["Davolash tarixi"] = "Treatment History";
    dictionary["Sana: "] = "Date: ";
    dictionary[" | Vaqt: "] = " | Time: ";
    dictionary["Stomatolog tomonidan yozilgan"] = "Booked by dentist";
    dictionary["Siz tomonidan yozilgan"] = "Booked by you";
    dictionary["Mening Profilim"] = "My Profile";
    dictionary["Shaxsiy ma'lumotlaringizni ko'rish va tahrirlash"] = "View and edit your personal information";
    dictionary["Shaxsiy ma‘lumotlaringizni ko‘rish va tahrirlash"] = "View and edit your personal information";
    dictionary["To'lovlar tarixi"] = "Payment history";
    dictionary["To‘lovlar tarixi"] = "Payment history";
    dictionary["Keyingi ko'rik:"] = "Next check-up:";
    dictionary["Keyingi ko‘rik:"] = "Next check-up:";
    dictionary["To'langan (qarz bor)"] = "Paid (has debt)";
    dictionary["To‘langan (qarz bor)"] = "Paid (has debt)";
    dictionary["To'liq to'langan"] = "Fully paid";
    dictionary["To‘liq to‘langan"] = "Fully paid";
    dictionary["Oxirgi to'lov:"] = "Last payment:";
    dictionary["Oxirgi to‘lov:"] = "Last payment:";
    dictionary["Qabul qilinmoqda"] = "In progress";
    dictionary["Yakunlangan"] = "Completed";

    // Additional English translations for client portal
    dictionary["Ulanmagan"] = "Not connected";
    dictionary["Eslatmalarni Telegram orqali olish uchun akkauntingizni ulang."] = "Connect your account to receive notifications via Telegram.";
    dictionary["Telegram uzish"] = "Disconnect Telegram";
    dictionary["Telegram ulash"] = "Connect Telegram";
    dictionary["Tug‘ilgan sana"] = "Date of Birth";
    dictionary["Tug'ilgan sana"] = "Date of Birth";
    dictionary["Tahrirlash"] = "Edit";
    dictionary["Saqlash"] = "Save";
    dictionary["To'lanmagan"] = "Unpaid";
    dictionary["To‘lanmagan"] = "Unpaid";
    dictionary["Ishlangan tish(lar)"] = "Treated teeth";
    dictionary["Bajarilgan ishlar"] = "Procedures performed";
    dictionary["Keyingi qadam"] = "Next step";
    dictionary["Dorilar"] = "Medicines";
    dictionary["Eslatma"] = "Note";
    dictionary["Sana:"] = "Date:";
    dictionary["Vaqt:"] = "Time:";
    dictionary["Sana: "] = "Date: ";
    dictionary["Vaqt: "] = "Time: ";
    dictionary[" | Vaqt: "] = " | Time: ";
    dictionary[" | Vaqt:"] = " | Time:";
  }

  // Normalize apostrophes for matching Uzbek text (including modifier letter apostrophe \u02bc)
  const normalizeApostrophes = (str) => {
    if (!str) return str;
    return str.replace(/[‘’'ʼ`´]/g, "‘");
  };

  const normalizedDictionary = {};
  for (const [key, value] of Object.entries(dictionary)) {
    normalizedDictionary[normalizeApostrophes(key.trim()).toLowerCase()] = String(value).trim();
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

    // Dynamic next check-up: "🗓️ Keyingi ko'rik: 25-04-2026"
    const nextCheckMatch = trimmed.match(/Keyingi\s+ko['‘`’]rik:\s*(.*)$/i);
    if (nextCheckMatch) {
      const valPart = nextCheckMatch[1];
      const prefix = trimmed.slice(0, nextCheckMatch.index);
      const translatedLabel = activeLang === 'en' ? 'Next check-up:' : activeLang === 'ru' ? 'Следующий осмотр:' : 'Keyingi ko‘rik:';
      return `${prefix}${translatedLabel} ${valPart}`;
    }

    // Dynamic last payment: "Oxirgi to'lov: 13-07-2026 18:03"
    const oxirgiTolovaMatch = trimmed.match(/Oxirgi\s+to['‘`’]lov:\s*(.*)$/i);
    if (oxirgiTolovaMatch) {
      const valPart = oxirgiTolovaMatch[1];
      const prefix = trimmed.slice(0, oxirgiTolovaMatch.index);
      const translatedLabel = activeLang === 'en' ? 'Last payment:' : activeLang === 'ru' ? 'Последний платеж:' : 'Oxirgi to‘lov:';
      return `${prefix}${translatedLabel} ${valPart}`;
    }

    // 2. If it contains comma-separated list of terms, try translating each part
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

    // 3. Dynamic experience years: "yil" or "5 yil"
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

    // 6. Currency values: "150 000 so'm" -> "150 000 сум" / "150 000 som"
    if (trimmed.toLowerCase().endsWith("so'm") || trimmed.toLowerCase().endsWith("so‘m")) {
      const suffix = activeLang === 'en' ? ' som' : activeLang === 'ru' ? ' сум' : ' so‘m';
      return val.replace(/\s*so['‘`’]m/gi, suffix);
    }

    // 7. Dona units: "2 dona" -> "2 шт." / "2 pcs"
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

    // 8. Kam qoldiq warning helper: "⚠ Kam qoldiq (min: 2 dona)" / "⚠ Kam qoldiq (min: 2 шт.)"
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

