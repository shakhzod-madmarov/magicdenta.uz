import crypto from "crypto";
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import { sendTelegramWebhookReply, getTelegramBotUsername } from "../utils/telegramBot.js";
import {
  buildClosedQueueMessage,
  buildOrthodontistQueueMessage,
  buildOrthodontistQueueStartKeyboard,
  buildOrthodontistVisitPurposeKeyboard,
  buildTelegramMainReplyKeyboard,
  buildTelegramLocationReplyKeyboard,
  buildTooFarQueueMessage,
  buildWebsiteLoginButton,
  getOrthodontVisitPurposeLabel,
  isOrthodontistQueueIntentNo,
  isOrthodontistQueueIntentYes,
  isOrthodontistQueueShortcut,
  parseOrthodontistVisitPurposeFromText,
} from "../utils/telegramMessageBuilders.js";
import {
  buildQueuePatientView,
  findTodayPatientOrthodontistEntry,
  getLinkedPatientByChatId,
  listLinkedPatientsByChatId,
  joinOrthodontistQueueFromTelegram,
} from "../utils/orthodontistQueueService.js";

const hashToken = (token) =>
  crypto.createHash("sha256").update(String(token)).digest("hex");

const buildDeepLink = async (token) => {
  const username = await getTelegramBotUsername();
  if (!username || !token) return "";
  return `https://t.me/${username}?start=${token}`;
};

const emptyPendingLink = () => ({
  token: "",
  tokenHash: "",
  expiresAt: null,
  createdAt: null,
});

const emptyOrthoQueueDraft = () => ({
  purposeCode: "",
  purposeLabel: "",
  firstVisit: false,
  latitude: null,
  longitude: null,
  accuracy: null,
  createdAt: null,
});

const hasDraftPurpose = (draft) =>
  Boolean(draft?.purposeCode && draft?.purposeLabel);

const hasDraftLocation = (draft) =>
  Number.isFinite(draft?.latitude) && Number.isFinite(draft?.longitude);

const TELEGRAM_FAMILY_MEMBER_LIMIT_1147 = 20;

const familyPatientButton1147 = (patient) => {
  const name = String(patient?.name || "").trim() || "Patient";
  const patientId = String(patient?.patientId || "").trim();
  return `👤 ${name}${patientId ? ` · ${patientId}` : ""}`.slice(0, 90);
};

const familyText1147 = (language = "uz") => {
  const lang = String(language || "uz").toLowerCase().slice(0, 2);
  const map = {
    uz: {
      title: "Bu Telegram akkauntiga bir nechta oila aʼzosi ulangan.",
      choose: "Iltimos, qaysi bemor uchun amal bajarilishini tanlang.",
      selected: (name) => `✅ Tanlandi: <b>${name}</b>` ,
      limit: `Bu Telegram akkauntiga eng ko‘pi bilan ${TELEGRAM_FAMILY_MEMBER_LIMIT_1147} ta bemor/oila aʼzosi ulanishi mumkin.`,
      limitHint: "Yangi bemorni ulash uchun avval eski bog‘lanishlardan birini uzing yoki administratorga murojaat qiling.",
      resendLocation: "Iltimos, bemorni tanlagandan keyin joylashuvingizni qayta yuboring.",
    },
    ru: {
      title: "К этому Telegram-аккаунту подключено несколько членов семьи.",
      choose: "Пожалуйста, выберите, для какого пациента выполнить действие.",
      selected: (name) => `✅ Выбран пациент: <b>${name}</b>`,
      limit: `К одному Telegram-аккаунту можно подключить максимум ${TELEGRAM_FAMILY_MEMBER_LIMIT_1147} пациентов/членов семьи.`,
      limitHint: "Чтобы подключить нового пациента, сначала отключите одну из старых связей или обратитесь к администратору.",
      resendLocation: "После выбора пациента отправьте геолокацию ещё раз.",
    },
    en: {
      title: "Several family members are connected to this Telegram account.",
      choose: "Please choose which patient this action is for.",
      selected: (name) => `✅ Selected patient: <b>${name}</b>`,
      limit: `One Telegram account can manage up to ${TELEGRAM_FAMILY_MEMBER_LIMIT_1147} patients/family members.`,
      limitHint: "To connect another patient, unlink one old connection first or contact the clinic administrator.",
      resendLocation: "After choosing the patient, please send your location again.",
    },
  };
  return map[lang] || map.uz;
};

const buildFamilyPatientKeyboard1147 = (patients = []) => {
  const rows = patients.slice(0, TELEGRAM_FAMILY_MEMBER_LIMIT_1147).map((patient) => [{ text: familyPatientButton1147(patient) }]);
  rows.push(...(buildTelegramMainReplyKeyboard()?.keyboard || []));
  return {
    keyboard: rows,
    resize_keyboard: true,
    one_time_keyboard: false,
  };
};

const parseFamilyPatientChoice1147 = (text = "", patients = []) => {
  const clean = String(text || "").trim();
  if (!clean) return null;
  return patients.find((patient) => {
    const id = String(patient?._id || "");
    const patientId = String(patient?.patientId || "").trim();
    const label = familyPatientButton1147(patient);
    return clean === label || clean === patientId || clean === id;
  }) || null;
};

const listTelegramFamilyPatients1147 = async (chatId) => {
  return listLinkedPatientsByChatId(chatId, { limit: TELEGRAM_FAMILY_MEMBER_LIMIT_1147 });
};

const selectTelegramFamilyPatient1147 = async ({ chatId, patientId }) => {
  const selectedId = String(patientId || "");
  if (!selectedId) return null;
  await userModel.updateMany(
    { "telegram.chatId": String(chatId), "telegram.isVerified": true },
    {
      $set: {
        "telegram.familySelectedPatientId": selectedId,
        "telegram.familySelectedAt": new Date(),
      },
    },
  );
  return userModel.findById(selectedId).select("name phone patientId telegram");
};

const resolveTelegramPatientForAction1147 = async ({ chatId, text = "", language = "uz", requireExplicit = false } = {}) => {
  const patients = await listTelegramFamilyPatients1147(chatId);
  const lang = String(language || "uz").toLowerCase().slice(0, 2);

  if (!patients.length) {
    return { status: "none", patients, patient: null, language: lang };
  }

  if (patients.length === 1) {
    const patient = patients[0];
    return { status: "selected", patients, patient, language: lang };
  }

  const chosen = parseFamilyPatientChoice1147(text, patients);
  if (chosen) {
    const selected = await selectTelegramFamilyPatient1147({ chatId, patientId: chosen._id });
    return { status: "selected", patients, patient: selected || chosen, language: lang, justSelected: true };
  }

  const selectedPatientId = String(patients.find((patient) => patient?.telegram?.familySelectedPatientId)?.telegram?.familySelectedPatientId || "");
  if (!requireExplicit && selectedPatientId) {
    const selected = patients.find((patient) => String(patient._id) === selectedPatientId);
    if (selected) {
      return { status: "selected", patients, patient: selected, language: lang };
    }
  }

  return { status: "needs_selection", patients, patient: null, language: lang };
};

const sendTelegramFamilySelectionPrompt1147 = async ({ chatId, patients = [], language = "uz", extraText = "" } = {}) => {
  const lang = String(language || "uz").toLowerCase().slice(0, 2);
  const t = familyText1147(lang);
  const visiblePatients = patients.slice(0, TELEGRAM_FAMILY_MEMBER_LIMIT_1147);
  const lines = visiblePatients.map((patient, index) => `${index + 1}. <b>${patient?.name || "Patient"}</b>${patient?.patientId ? ` — ${patient.patientId}` : ""}`);
  await sendTelegramWebhookReply({
    chatId,
    text: `${t.title}\n\n${t.choose}${extraText ? `\n\n${extraText}` : ""}\n\n${lines.join("\n")}`,
    replyMarkup: buildFamilyPatientKeyboard1147(visiblePatients),
  });
};

const sendOrthodontQueueIntentPrompt = async ({ chatId, patientName = "" }) => {
  await sendTelegramWebhookReply({
    chatId,
    text:
      `Assalomu alaykum${patientName ? `, ${patientName}` : ""}!\n\n` +
      `Ortodont navbatga yozilmoqchimisiz?`,
    replyMarkup: buildOrthodontistQueueStartKeyboard(),
  });
};

const sendOrthodontPurposePrompt = async ({ chatId, patientName = "" }) => {
  await sendTelegramWebhookReply({
    chatId,
    text:
      `Assalomu alaykum${patientName ? `, ${patientName}` : ""}!\n\n` +
      `Qaysi sabab bilan ortodont qabuliga kelgansiz?\n\n` +
      `Quyidagi tashrif turidan birini tanlang:`,
    replyMarkup: buildOrthodontistVisitPurposeKeyboard(),
  });
};

const buildReadableTelegramErrorText = (error) => {
  const raw = String(error?.message || "").trim();

  if (!raw) {
    return (
      `Xatolik yuz berdi.\n\n` +
      `Iltimos, qaytadan urinib ko‘ring yoki administratorga murojaat qiling.`
    );
  }

  if (
    raw.includes("visitPurpose") ||
    raw.includes("`visitPurpose`") ||
    raw.includes("is not a valid enum value")
  ) {
    return (
      `Tanlangan tashrif turi qabul qilinmadi.\n\n` +
      `Iltimos, tashrif turini qaytadan tanlang va yana urinib ko‘ring.`
    );
  }

  if (raw.includes("Klinika koordinatalari sozlanmagan")) {
    return (
      `Klinika geolokatsiyasi hozircha sozlanmagan.\n\n` +
      `Iltimos, administratorga xabar bering.`
    );
  }

  if (
    raw.includes("Ortodont shifokor topilmadi") ||
    raw.includes("ORTHODONTIST_DENTIST_ID") ||
    raw.includes("Bir nechta ortodont topildi")
  ) {
    return (
      `Ortodont navbati konfiguratsiyasida muammo bor.\n\n` +
      `Iltimos, administratorga murojaat qiling.`
    );
  }

  return (
    `Xatolik yuz berdi:\n<b>${raw}</b>\n\n` +
    `Iltimos, qaytadan urinib ko‘ring yoki administratorga murojaat qiling.`
  );
};

const sendQueueStateMessage = async ({ chatId, linkedUser, view }) => {
  if (!view?.entry) {
    await sendTelegramWebhookReply({
      chatId,
      text:
        `Siz bugungi ortodont navbatida hali yo‘qsiz.\n\n` +
        `Avval “Ortodont navbatga yozilmoqchimisiz?” savoliga javob bering, keyin tashrif turini tanlang va joylashuvingizni yuboring.`,
      replyMarkup: buildOrthodontistQueueStartKeyboard(),
    });
    return;
  }

  if (view.entry.status === "MISSED") {
    await sendTelegramWebhookReply({
      chatId,
      text:
        `Assalomu alaykum, <b>${linkedUser?.name || "Bemor"}</b>!\n\n` +
        `Sizning bugungi ortodont navbatingiz <b>KELMADI</b> deb yopilgan.\n\n` +
        `Agar siz hali ham klinikaga yetib kelgan bo‘lsangiz, “📍 Joylashuv yuborish” tugmasi orqali joylashuvingizni qayta yuboring.\n` +
        `Shunda sizga <b>yangi navbat raqami</b> beriladi.`,
      replyMarkup: buildTelegramMainReplyKeyboard(),
    });
    return;
  }

  if (["DONE", "CANCELLED"].includes(view.entry.status)) {
    await sendTelegramWebhookReply({
      chatId,
      text: buildClosedQueueMessage({
        patientName: linkedUser.name,
        status: view.entry.status,
        visitPurposeLabel:
          view.entry.visitPurposeLabel ||
          getOrthodontVisitPurposeLabel(view.entry.visitPurpose),
      }),
      replyMarkup: buildTelegramMainReplyKeyboard(),
    });
    return;
  }

  await sendTelegramWebhookReply({
    chatId,
    text: buildOrthodontistQueueMessage({
      patientName: linkedUser.name,
      dentistName: view.dentist?.name,
      entry: view.entry,
      aheadCount: view.peopleAhead || 0,
      totalActive: view.snapshot?.activeCount || 0,
      estimatedWaitMinutes: view.approxMinutes || 0,
      visitPurposeLabel:
        view.entry?.visitPurposeLabel ||
        getOrthodontVisitPurposeLabel(view.entry?.visitPurpose),
    }),
    replyMarkup: buildTelegramMainReplyKeyboard(),
  });
};

export const getTelegramStatus = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Bemor topilmadi",
      });
    }

    const tg = user.telegram || {};
    const pending = tg.pendingLink || {};
    const hasPendingLink = Boolean(
      pending.tokenHash &&
      pending.expiresAt &&
      new Date(pending.expiresAt) > new Date(),
    );

    return res.json({
      success: true,
      telegram: {
        isLinked: Boolean(tg.isVerified && tg.chatId),
        username: tg.username || "",
        firstName: tg.firstName || "",
        linkedAt: tg.linkedAt || null,
        pendingExpiresAt: pending.expiresAt || null,
        hasPendingLink,
      },
    });
  } catch (error) {
    console.error("getTelegramStatus error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server xatoligi",
    });
  }
};

export const createTelegramLinkToken = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Bemor topilmadi",
      });
    }

    if (user.telegram?.isVerified && user.telegram?.chatId) {
      return res.json({
        success: false,
        message: "Telegram allaqachon ulangan",
      });
    }

    const rawToken = crypto.randomBytes(24).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresMinutes = Math.max(
      1,
      Number(process.env.TELEGRAM_LINK_TOKEN_MINUTES || 15),
    );
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

    user.telegram = user.telegram || {};
    user.telegram.pendingLink = {
      token: "",
      tokenHash,
      expiresAt,
      createdAt: new Date(),
    };

    await user.save();

    return res.json({
      success: true,
      deepLink: buildDeepLink(rawToken),
      expiresAt,
      message: "Telegram ulash tokeni yaratildi",
    });
  } catch (error) {
    console.error("createTelegramLinkToken error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server xatoligi",
    });
  }
};

export const unlinkTelegram = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Bemor topilmadi",
      });
    }

    user.telegram = {
      chatId: "",
      username: "",
      firstName: "",
      linkedAt: null,
      isVerified: false,
      pendingLink: emptyPendingLink(),
      orthoQueueDraft: emptyOrthoQueueDraft(),
    };

    await user.save();

    return res.json({
      success: true,
      message: "Telegram bog‘lanishi uzildi",
    });
  } catch (error) {
    console.error("unlinkTelegram error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server xatoligi",
    });
  }
};

export const telegramWebhook = async (req, res) => {
  const fallbackChatId = req.body?.message?.chat?.id;

  try {
    const expectedSecret = String(
      process.env.TELEGRAM_WEBHOOK_SECRET || "",
    ).trim();
    const actualSecret = String(
      req.headers["x-telegram-bot-api-secret-token"] || "",
    ).trim();

    if (expectedSecret && actualSecret !== expectedSecret) {
      return res.status(401).json({
        success: false,
        message: "Telegram secret noto‘g‘ri",
      });
    }

    const message = req.body?.message || null;
    const chatId = message?.chat?.id;
    const chatType = String(message?.chat?.type || "");
    const text = String(message?.text || "").trim();
    const from = message?.from || {};
    const location = message?.location || null;

    if (process.env.NODE_ENV !== "production") {
      console.log("[telegram webhook incoming]", {
        chatType,
        hasText: Boolean(text),
        hasLocation: Boolean(location),
        hasToken: Boolean(String(text).split(/\s+/)[1]),
      });
    }

    if (!chatId) {
      return res.json({ success: true, message: "O'tkazib yuborildi" });
    }

    if (chatType !== "private") {
      return res.json({
        success: true,
        message: "Shaxsiy bo‘lmagan chat o‘tkazib yuborildi",
      });
    }

    if (location) {
      const patientResolution = await resolveTelegramPatientForAction1147({ chatId });
      const linkedUser = patientResolution.patient;

      if (patientResolution.status === "needs_selection") {
        await sendTelegramFamilySelectionPrompt1147({
          chatId,
          patients: patientResolution.patients,
          language: patientResolution.language,
          extraText: familyText1147(patientResolution.language).resendLocation,
        });
        return res.json({ success: true, message: "Family patient selection required before location queue" });
      }

      if (!linkedUser) {
        await sendTelegramWebhookReply({
          chatId,
          text:
            `Avval profilingizni sayt orqali Telegram bilan ulang.\n\n` +
            `So‘ng ortodont navbatidan foydalanishingiz mumkin.`,
          replyMarkup: buildWebsiteLoginButton(),
        });

        return res.json({
          success: true,
          message: "Location received from unlinked user",
        });
      }

      linkedUser.telegram = linkedUser.telegram || {};
      linkedUser.telegram.orthoQueueDraft = {
        ...(linkedUser.telegram.orthoQueueDraft || emptyOrthoQueueDraft()),
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy ?? null,
        createdAt: new Date(),
      };
      await linkedUser.save();

            const draft =
              linkedUser.telegram?.orthoQueueDraft || emptyOrthoQueueDraft();

            if (!hasDraftPurpose(draft)) {
              const todayEntry = await findTodayPatientOrthodontistEntry({
                patientId: linkedUser._id,
              });

              if (todayEntry && todayEntry.status === "MISSED") {
                const joined = await joinOrthodontistQueueFromTelegram({
                  patientId: linkedUser._id,
                  chatId,
                  location: {
                    latitude: draft.latitude,
                    longitude: draft.longitude,
                    accuracy: draft.accuracy ?? null,
                  },
                  visitPurpose: todayEntry.visitPurpose || "REGULAR_CONTROL",
                  visitPurposeLabel:
                    todayEntry.visitPurposeLabel ||
                    getOrthodontVisitPurposeLabel(todayEntry.visitPurpose),
                  firstVisit: Boolean(todayEntry.firstVisit),
                });

                linkedUser.telegram.orthoQueueDraft = emptyOrthoQueueDraft();
                await linkedUser.save();

                if (!joined.ok && joined.code === "TOO_FAR") {
                  await sendTelegramWebhookReply({
                    chatId,
                    text: buildTooFarQueueMessage({
                      distanceMeters: joined.distanceMeters,
                      nearMeters: joined.nearMeters,
                    }),
                    replyMarkup: buildTelegramMainReplyKeyboard(),
                  });

                  return res.json({
                    success: true,
                    message: "Location too far for orthodontist queue rejoin",
                  });
                }

                if (!joined.ok && joined.code === "ALREADY_CLOSED_TODAY") {
                  await sendTelegramWebhookReply({
                    chatId,
                    text: buildClosedQueueMessage({
                      patientName: linkedUser.name,
                      status: joined.entry?.status,
                      visitPurposeLabel:
                        joined.entry?.visitPurposeLabel ||
                        getOrthodontVisitPurposeLabel(
                          joined.entry?.visitPurpose,
                        ),
                    }),
                    replyMarkup: buildTelegramMainReplyKeyboard(),
                  });

                  return res.json({
                    success: true,
                    message: "Closed orthodontist queue already exists today",
                  });
                }

                const view = await buildQueuePatientView({
                  patientId: linkedUser._id,
                });

                await sendQueueStateMessage({ chatId, linkedUser, view });

                return res.json({
                  success: true,
                  message: joined.requeued
                    ? "Missed orthodontist queue rejoined after location"
                    : "Orthodontist queue returned after location",
                });
              }

              await sendTelegramWebhookReply({
                chatId,
                text:
                  `Joylashuvingiz qabul qilindi.\n\n` +
                  `Endi tashrif turini tanlang.`,
                replyMarkup: buildOrthodontistVisitPurposeKeyboard(),
              });

              return res.json({
                success: true,
                message: "Location stored, purpose still required",
              });
            }

      const joined = await joinOrthodontistQueueFromTelegram({
        patientId: linkedUser._id,
        chatId,
        location: {
          latitude: draft.latitude,
          longitude: draft.longitude,
          accuracy: draft.accuracy ?? null,
        },
        visitPurpose: draft.purposeCode,
        visitPurposeLabel: draft.purposeLabel,
        firstVisit: Boolean(draft.firstVisit),
      });

      linkedUser.telegram.orthoQueueDraft = emptyOrthoQueueDraft();
      await linkedUser.save();

      if (!joined.ok && joined.code === "TOO_FAR") {
        await sendTelegramWebhookReply({
          chatId,
          text: buildTooFarQueueMessage({
            distanceMeters: joined.distanceMeters,
            nearMeters: joined.nearMeters,
          }),
          replyMarkup: buildTelegramMainReplyKeyboard(),
        });

        return res.json({
          success: true,
          message: "Location too far for orthodontist queue",
        });
      }

      if (!joined.ok && joined.code === "ALREADY_CLOSED_TODAY") {
        await sendTelegramWebhookReply({
          chatId,
          text: buildClosedQueueMessage({
            patientName: linkedUser.name,
            status: joined.entry?.status,
            visitPurposeLabel:
              joined.entry?.visitPurposeLabel ||
              getOrthodontVisitPurposeLabel(joined.entry?.visitPurpose),
          }),
          replyMarkup: buildTelegramMainReplyKeyboard(),
        });

        return res.json({
          success: true,
          message: "Closed orthodontist queue already exists today",
        });
      }

      const view = await buildQueuePatientView({
        patientId: linkedUser._id,
      });

      await sendQueueStateMessage({ chatId, linkedUser, view });

      return res.json({
        success: true,
        message: joined.created
          ? "Linked patient added to orthodontist queue after location"
          : "Linked patient queue state returned after location",
      });
    }

    if (!text) {
      return res.json({ success: true, message: "Ignored non-text message" });
    }

    const cleanLowerText = String(text || "").trim().toLowerCase();
    const isFamilyTrigger = [
      "/family", "/switch", "/members", "/children",
      "👥 oila a'zolari", "👥 oila a’zolari", "👥 oila a`zolari",
      "👥 члены семьи", "👥 family members"
    ].includes(cleanLowerText);

    if (isFamilyTrigger) {
      const familyResolution = await resolveTelegramPatientForAction1147({ chatId, requireExplicit: true });
      const patients = familyResolution.patients || [];
      const lang = familyResolution.language || "uz";
      
      if (!patients.length) {
        await sendTelegramWebhookReply({
          chatId,
          text:
            `Avval profilingizni sayt orqali Telegram bilan ulang.\n\n` +
            `So‘ng ortodont navbatidan foydalanishingiz mumkin.`,
          replyMarkup: buildWebsiteLoginButton(),
        });
        return res.json({ success: true, message: "Family command from unlinked user" });
      }

      if (patients.length === 1) {
        const patient = patients[0];
        const onePatientMsg = {
          uz: `Sizning Telegram akkauntingizga faqat 1 ta bemor ulangan: <b>${patient?.name || "Bemor"}</b>${patient?.patientId ? ` (${patient.patientId})` : ""}.\n\nBoshqa oila a'zosini ulash uchun, ularning bemor kartasidan yangi QR/havola ochib skaner qiling.`,
          ru: `К вашему Telegram-аккаунту подключен только 1 пациент: <b>${patient?.name || "Пациент"}</b>${patient?.patientId ? ` (${patient.patientId})` : ""}.\n\nЧтобы подключить другого члена семьи, откройте новый QR/ссылку в его карте и отсканируйте.`,
          en: `Only 1 patient is connected to your Telegram account: <b>${patient?.name || "Patient"}</b>${patient?.patientId ? ` (${patient.patientId})` : ""}.\n\nTo connect another family member, open a new QR/link in their card and scan it.`,
        };
        await sendTelegramWebhookReply({
          chatId,
          text: onePatientMsg[lang] || onePatientMsg.uz,
          replyMarkup: buildTelegramMainReplyKeyboard(),
        });
        return res.json({ success: true, message: "Family command shown for single patient" });
      }

      await sendTelegramFamilySelectionPrompt1147({
        chatId,
        patients,
        language: lang,
      });
      return res.json({ success: true, message: "Family selection keyboard shown on command" });
    }

    const familySelectionResolution = await resolveTelegramPatientForAction1147({ chatId, text, requireExplicit: true });
    if (familySelectionResolution.status === "selected" && familySelectionResolution.justSelected) {
      const selected = familySelectionResolution.patient;
      const lang = familySelectionResolution.language;
      const t = familyText1147(lang);
      const tip = {
        uz: "\n\n💡 <i>Oila a'zolarini almashtirish uchun istalgan vaqtda <b>/family</b> buyrug'ini yuborishingiz mumkin.</i>",
        ru: "\n\n💡 <i>Вы можете в любое время отправить команду <b>/family</b>, чтобы переключить члена семьи.</i>",
        en: "\n\n💡 <i>You can send the <b>/family</b> command at any time to switch family members.</i>"
      };
      await sendTelegramWebhookReply({
        chatId,
        text: t.selected(selected?.name || "Patient") + (tip[lang] || tip.uz),
        replyMarkup: buildTelegramMainReplyKeyboard(),
      });
      await sendOrthodontQueueIntentPrompt({ chatId, patientName: selected.name });
      return res.json({ success: true, message: `Family patient selected. Intent prompt sent.` });
    }

    const selectedPurpose = parseOrthodontistVisitPurposeFromText(text);

    if (selectedPurpose) {
      const patientResolution = await resolveTelegramPatientForAction1147({ chatId });
      const linkedUser = patientResolution.patient;

      if (patientResolution.status === "needs_selection") {
        await sendTelegramFamilySelectionPrompt1147({
          chatId,
          patients: patientResolution.patients,
          language: patientResolution.language,
        });
        return res.json({ success: true, message: "Family patient selection required before purpose select" });
      }

      if (!linkedUser) {
        await sendTelegramWebhookReply({
          chatId,
          text:
            `Avval profilingizni sayt orqali Telegram bilan ulang.\n\n` +
            `So‘ng ortodont navbati xizmatidan foydalanishingiz mumkin.`,
          replyMarkup: buildWebsiteLoginButton(),
        });

        return res.json({
          success: true,
          message: "Purpose selected by unlinked user",
        });
      }

      linkedUser.telegram = linkedUser.telegram || {};
      linkedUser.telegram.orthoQueueDraft = {
        ...(linkedUser.telegram.orthoQueueDraft || emptyOrthoQueueDraft()),
        purposeCode: selectedPurpose.code,
        purposeLabel: selectedPurpose.label,
        firstVisit: Boolean(selectedPurpose.firstVisit),
        createdAt: new Date(),
      };
      await linkedUser.save();

      const draft =
        linkedUser.telegram?.orthoQueueDraft || emptyOrthoQueueDraft();

      if (!hasDraftLocation(draft)) {
        await sendTelegramWebhookReply({
          chatId,
          text:
            `Tashrif turi saqlandi: <b>${selectedPurpose.label}</b>.\n\n` +
            `Endi “📍 Joylashuv yuborish” tugmasi orqali joylashuvingizni yuboring.`,
          replyMarkup: buildTelegramLocationReplyKeyboard(),
        });

        return res.json({
          success: true,
          message: "Purpose selected, location still required",
        });
      }

      const joined = await joinOrthodontistQueueFromTelegram({
        patientId: linkedUser._id,
        chatId,
        location: {
          latitude: draft.latitude,
          longitude: draft.longitude,
          accuracy: draft.accuracy ?? null,
        },
        visitPurpose: selectedPurpose.code,
        visitPurposeLabel: selectedPurpose.label,
        firstVisit: selectedPurpose.firstVisit,
      });

      linkedUser.telegram.orthoQueueDraft = emptyOrthoQueueDraft();
      await linkedUser.save();

      if (!joined.ok && joined.code === "TOO_FAR") {
        await sendTelegramWebhookReply({
          chatId,
          text: buildTooFarQueueMessage({
            distanceMeters: joined.distanceMeters,
            nearMeters: joined.nearMeters,
          }),
          replyMarkup: buildTelegramMainReplyKeyboard(),
        });

        return res.json({
          success: true,
          message: "Location too far for orthodontist queue",
        });
      }

      if (!joined.ok && joined.code === "ALREADY_CLOSED_TODAY") {
        await sendTelegramWebhookReply({
          chatId,
          text: buildClosedQueueMessage({
            patientName: linkedUser.name,
            status: joined.entry?.status,
            visitPurposeLabel:
              joined.entry?.visitPurposeLabel ||
              getOrthodontVisitPurposeLabel(joined.entry?.visitPurpose),
          }),
          replyMarkup: buildTelegramMainReplyKeyboard(),
        });

        return res.json({
          success: true,
          message: "Closed orthodontist queue already exists today",
        });
      }

      const view = await buildQueuePatientView({ patientId: linkedUser._id });
      await sendQueueStateMessage({ chatId, linkedUser, view });

      return res.json({
        success: true,
        message: joined.created
          ? "Linked patient added to orthodontist queue after purpose selection"
          : "Linked patient queue state returned after purpose selection",
      });
    }

    if (isOrthodontistQueueIntentYes(text)) {
      const isStart = isOrthodontistQueueShortcut(text);
      const patientResolution = await resolveTelegramPatientForAction1147({ chatId, requireExplicit: isStart });
      const linkedUser = patientResolution.patient;

      if (patientResolution.status === "needs_selection") {
        await sendTelegramFamilySelectionPrompt1147({
          chatId,
          patients: patientResolution.patients,
          language: patientResolution.language,
        });
        return res.json({ success: true, message: "Family patient selection required before queue join" });
      }

      if (!linkedUser) {
        await sendTelegramWebhookReply({
          chatId,
          text:
            `Avval profilingizni sayt orqali Telegram bilan ulang.\n\n` +
            `So‘ng ortodont navbati xizmatidan foydalanishingiz mumkin.`,
          replyMarkup: buildWebsiteLoginButton(),
        });

        return res.json({
          success: true,
          message: "Queue intent yes from unlinked user",
        });
      }

      linkedUser.telegram = linkedUser.telegram || {};
      linkedUser.telegram.orthoQueueDraft = {
        ...(linkedUser.telegram.orthoQueueDraft || emptyOrthoQueueDraft()),
        purposeCode: "",
        purposeLabel: "",
        firstVisit: false,
        createdAt: new Date(),
      };
      await linkedUser.save();

      await sendOrthodontPurposePrompt({
        chatId,
        patientName: linkedUser.name,
      });

      return res.json({
        success: true,
        message: "Linked user asked to join orthodont queue",
      });
    }

    if (isOrthodontistQueueIntentNo(text)) {
      await sendTelegramWebhookReply({
        chatId,
        text:
          `Xo‘p, tushunarli.\n\n` +
          `Kerak bo‘lsa keyinroq “🦷 Ortodont navbati / Breket tortish navbati” tugmasi orqali davom etishingiz mumkin.`,
        replyMarkup: buildTelegramMainReplyKeyboard(),
      });

      return res.json({
        success: true,
        message: "Queue intent declined",
      });
    }

    if (
      text === "🦷 Ortodont navbati" ||
      text === "🦷 Ortodont navbati / Breket tortish navbati" ||
      text === "/ortodont_queue"
    ) {
      const patientResolution = await resolveTelegramPatientForAction1147({ chatId, requireExplicit: true });
      const linkedUser = patientResolution.patient;

      if (patientResolution.status === "needs_selection") {
        await sendTelegramFamilySelectionPrompt1147({
          chatId,
          patients: patientResolution.patients,
          language: patientResolution.language,
        });
        return res.json({ success: true, message: "Family patient selection required before queue state query" });
      }

      if (!linkedUser) {
        await sendTelegramWebhookReply({
          chatId,
          text:
            `Avval profilingizni sayt orqali Telegram bilan ulang.\n\n` +
            `So‘ng ortodont navbati xizmatidan foydalanishingiz mumkin.`,
          replyMarkup: buildWebsiteLoginButton(),
        });

        return res.json({
          success: true,
          message: "Ulanmagan foydalanuvchi navbatni so‘radi",
        });
      }

      const view = await buildQueuePatientView({ patientId: linkedUser._id });
      await sendQueueStateMessage({ chatId, linkedUser, view });

      return res.json({
        success: true,
        message: "Queue state returned",
      });
    }

    if (text === "/start") {
      const startResolution = await resolveTelegramPatientForAction1147({ chatId, requireExplicit: true });

      if (startResolution.status === "needs_selection") {
        await sendTelegramFamilySelectionPrompt1147({
          chatId,
          patients: startResolution.patients,
          language: startResolution.language,
        });
        return res.json({ success: true, message: "Family patient selection shown for /start" });
      }

      const alreadyLinkedUser = startResolution.patient;

      if (alreadyLinkedUser) {
        alreadyLinkedUser.telegram = alreadyLinkedUser.telegram || {};
        alreadyLinkedUser.telegram.orthoQueueDraft = emptyOrthoQueueDraft();
        await alreadyLinkedUser.save();

        await sendOrthodontQueueIntentPrompt({
          chatId,
          patientName: alreadyLinkedUser.name,
        });

        return res.json({
          success: true,
          message: "Already linked user got orthodont yes/no prompt",
        });
      }

      await sendTelegramWebhookReply({
        chatId,
        text:
          `Assalomu alaykum!\n\n` +
          `Telegramdan foydalanish uchun avval veb-saytga kiring yoki profilingizni faollashtiring, so‘ng profilingizdan Telegram'ni ulang.`,
        replyMarkup: buildWebsiteLoginButton(),
      });

      return res.json({
        success: true,
        message: "Plain /start guided to website",
      });
    }

    if (!text.startsWith("/start ")) {
      return res.json({ success: true, message: "Ignored non-start command" });
    }

    const parts = text.split(/\s+/);
    const rawToken = String(parts[1] || "").trim();
    const tokenHash = hashToken(rawToken);

    let user = await userModel.findOne({
      "telegram.pendingLink.tokenHash": tokenHash,
      "telegram.pendingLink.expiresAt": { $gt: new Date() },
    });

    let dentist = null;
    let isDentist = false;

    if (!user) {
      const { default: dentistModel } = await import("../models/dentistModel.js");
      dentist = await dentistModel.findOne({
        "telegram.pendingLink.tokenHash": tokenHash,
        "telegram.pendingLink.expiresAt": { $gt: new Date() },
      });
      if (dentist) {
        isDentist = true;
      }
    }

    if (!user && !dentist) {
      await sendTelegramWebhookReply({
        chatId,
        text: "Ulash tokeni yaroqsiz yoki muddati tugagan. Iltimos, kabinetdan yoki sozlamalardan qayta ulash havolasini oling.",
      });

      return res.json({ success: true, message: "Invalid or expired token" });
    }

    if (isDentist && dentist) {
      dentist.telegram = dentist.telegram || {};
      dentist.telegram.chatId = String(chatId);
      dentist.telegram.username = String(from?.username || "");
      dentist.telegram.firstName = String(from?.first_name || "");
      dentist.telegram.linkedAt = new Date();
      dentist.telegram.isVerified = true;
      dentist.telegram.pendingLink = emptyPendingLink();
      await dentist.save();

      await sendTelegramWebhookReply({
        chatId,
        text: `Assalomu alaykum, Dr. ${dentist.name}!\n\nSizning profilingiz Magic Denta tizimi bilan muvaffaqiyatli bog'landi. Endi siz yangi uchrashuvlar haqida bildirishnomalarni olasiz.`,
      });

      return res.json({
        success: true,
        message: "Telegram account linked to dentist successfully",
      });
    }

    // For patients, we relax the existing owner check to allow multiple children/patient cards per Telegram account.
    user.telegram = user.telegram || {};
    user.telegram.chatId = String(chatId);
    user.telegram.username = String(from.username || "");
    user.telegram.firstName = String(from.first_name || "");
    user.telegram.linkedAt = new Date();
    user.telegram.isVerified = true;
    user.telegram.pendingLink = emptyPendingLink();
    user.telegram.orthoQueueDraft = emptyOrthoQueueDraft();

    await user.save();

    await sendOrthodontQueueIntentPrompt({
      chatId,
      patientName: user.name,
    });

    return res.json({
      success: true,
      message: "Telegram account linked successfully",
    });
  } catch (error) {
    console.error("telegramWebhook error:", error);

    if (fallbackChatId) {
      await sendTelegramWebhookReply({
        chatId: fallbackChatId,
        text: buildReadableTelegramErrorText(error),
        replyMarkup: buildTelegramMainReplyKeyboard(),
      });
    }

    return res.json({
      success: false,
      message: error.message || "Server xatoligi",
    });
  }
};

export const adminCreatePatientTelegramLink = async (req, res) => {
  try {
    const patientId = String(req.params?.id || "").trim();
    if (!patientId) {
      return res.status(400).json({ success: false, message: "Bemor ID-si kerak" });
    }

    let patient;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await userModel.findById(patientId);
    }
    if (!patient) {
      patient = await userModel.findOne({ patientId: patientId });
    }
    if (!patient) {
      return res.status(404).json({ success: false, message: "Bemor topilmadi" });
    }

    if (patient.telegram?.isVerified && patient.telegram?.chatId) {
      return res.json({
        success: true,
        alreadyLinked: true,
        message: "Bemor Telegramga allaqachon ulangan",
        deepLink: "",
        patient: {
          _id: patient._id,
          name: patient.name || "",
          telegram: { isLinked: true },
        },
      });
    }

    let botUsername = await getTelegramBotUsername();
    if (!botUsername) {
      return res.status(400).json({
        success: false,
        message: "Telegram bot sozlanmagan. Telegram sozlamalarida bot tokenini kiriting.",
        notConfigured: true,
      });
    }

    const rawToken = crypto.randomBytes(24).toString("hex");
    const expiresMinutes = Math.max(1, Number(process.env.TELEGRAM_LINK_TOKEN_MINUTES || 30));
    const expiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);

    patient.telegram = patient.telegram || {};
    patient.telegram.pendingLink = {
      token: rawToken,
      tokenHash: hashToken(rawToken),
      expiresAt,
      createdAt: new Date(),
    };
    await patient.save();

    const deepLink = `https://t.me/${botUsername}?start=${rawToken}`;
    const tgDeepLink = `tg://resolve?domain=${botUsername}&start=${rawToken}`;

    return res.json({
      success: true,
      message: "Telegram ulash havolasi yaratildi",
      deepLink,
      tgDeepLink,
      botUsername,
      tokenHash: hashToken(rawToken),
      expiresAt,
      patient: {
        _id: patient._id,
        name: patient.name || "",
        telegram: {
          isLinked: Boolean(patient.telegram?.isVerified && patient.telegram?.chatId),
          pendingExpiresAt: expiresAt,
        },
      },
    });
  } catch (error) {
    console.error("adminCreatePatientTelegramLink error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server xatoligi",
    });
  }
};

export const adminCheckPatientTelegramLink = async (req, res) => {
  try {
    const patientId = String(req.params?.id || "").trim();
    if (!patientId) {
      return res.status(400).json({ success: false, message: "Bemor ID-si kerak" });
    }

    let patient;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await userModel.findById(patientId);
    }
    if (!patient) {
      patient = await userModel.findOne({ patientId: patientId });
    }
    if (!patient) {
      return res.status(404).json({ success: false, message: "Bemor topilmadi" });
    }

    if (patient.telegram?.isVerified && patient.telegram?.chatId) {
      return res.json({
        success: true,
        linked: true,
        patient: {
          _id: patient._id,
          name: patient.name || "",
          telegram: {
            isLinked: true,
            chatId: patient.telegram.chatId,
            username: patient.telegram.username || "",
            firstName: patient.telegram.firstName || "",
          }
        }
      });
    }

    return res.json({
      success: true,
      linked: false,
      message: "Kutilmoqda..."
    });
  } catch (error) {
    console.error("adminCheckPatientTelegramLink error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server xatoligi",
    });
  }
};

export const adminUnlinkPatientTelegram = async (req, res) => {
  try {
    const patientId = String(req.params?.id || "").trim();
    if (!patientId) {
      return res.status(400).json({ success: false, message: "Bemor ID-si kerak" });
    }

    let patient;
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      patient = await userModel.findById(patientId);
    }
    if (!patient) {
      patient = await userModel.findOne({ patientId: patientId });
    }
    if (!patient) {
      return res.status(404).json({ success: false, message: "Bemor topilmadi" });
    }

    patient.telegram = {
      chatId: "",
      username: "",
      firstName: "",
      isVerified: false,
      linkedAt: null,
      pendingLink: emptyPendingLink(),
      registrationState: "AWAITING_START",
      registrationDraft: { name: "", phone: "", DOB: "" },
    };

    await patient.save();

    return res.json({
      success: true,
      message: "Telegram bog'lanishi muvaffaqiyatli uzildi!",
    });
  } catch (error) {
    console.error("adminUnlinkPatientTelegram error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server xatoligi",
    });
  }
};

export const adminSendDebtTelegramReminder = async (req, res) => {
  try {
    const { id } = req.params; // Treatment ID
    const { default: treatmentModel } = await import("../models/treatmentModel.js");
    const treatment = await treatmentModel
      .findById(id)
      .populate("userId", "name phone telegram")
      .populate("dentistId", "name phone");

    if (!treatment) {
      return res.status(404).json({ success: false, message: "Davolash topilmadi" });
    }

    const amount = Math.max(0, Number(treatment.amount || 0));
    const paid = Math.max(0, Number(treatment.paidAmount || 0));
    const debt = Math.max(0, amount - paid);

    if (debt <= 0) {
      return res.status(400).json({ success: false, message: "Bemorning qarzi yo'q." });
    }

    const patient = treatment.userId || {};
    if (!patient?.telegram?.chatId || !patient?.telegram?.isVerified) {
      return res.status(400).json({
        success: false,
        code: "PATIENT_TELEGRAM_NOT_LINKED",
        message: "Bemor Telegramga ulanmagan.",
      });
    }

    const language = String(req.body?.language || "uz").slice(0, 2).toLowerCase();
    const { sendTelegramWebhookReply } = await import("../utils/telegramBot.js");
    const { buildDebtReminderMessage } = await import("../utils/telegramMessageBuilders.js");

    const messageText = buildDebtReminderMessage({
      patient,
      dentist: treatment.dentistId,
      debt,
      language,
    });

    const result = await sendTelegramWebhookReply({
      chatId: patient.telegram.chatId,
      text: messageText,
    });

    return res.json({
      success: true,
      message: "Qarz eslatmasi Telegramga yuborildi!",
      telegramMessageId: result?.message_id || "",
    });
  } catch (error) {
    console.error("adminSendDebtTelegramReminder error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Eslatma yuborishda xatolik yuz berdi",
    });
  }
};

export const adminCreateDentistTelegramLink = async (req, res) => {
  try {
    const dentistId = String(req.params?.id || "").trim();
    if (!dentistId) {
      return res.status(400).json({ success: false, message: "Shifokor ID-si kerak" });
    }

    const { default: dentistModel } = await import("../models/dentistModel.js");
    let dentist;
    if (mongoose.Types.ObjectId.isValid(dentistId)) {
      dentist = await dentistModel.findById(dentistId);
    }
    if (!dentist) {
      dentist = await dentistModel.findOne({ dentistId });
    }
    if (!dentist) {
      return res.status(404).json({ success: false, message: "Shifokor topilmadi" });
    }

    if (dentist.telegram?.isVerified && dentist.telegram?.chatId) {
      return res.json({ success: true, alreadyLinked: true });
    }

    let botUsername = await getTelegramBotUsername();
    if (!botUsername) {
      return res.status(400).json({
        success: false,
        message: "Telegram bot sozlanmagan. Telegram sozlamalarida bot tokenini kiriting.",
        notConfigured: true,
      });
    }

    const rawToken = "dlink_" + crypto.randomBytes(24).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    dentist.telegram = dentist.telegram || {};
    dentist.telegram.pendingLink = {
      token: rawToken,
      tokenHash: tokenHash,
      expiresAt,
      createdAt: new Date(),
    };
    await dentist.save();

    const deepLink = `https://t.me/${botUsername}?start=${rawToken}`;
    const tgDeepLink = `tg://resolve?domain=${botUsername}&start=${rawToken}`;
    return res.json({
      success: true,
      deepLink,
      tgDeepLink,
      botUsername,
      tokenHash,
      rawToken,
    });
  } catch (error) {
    console.error("adminCreateDentistTelegramLink error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server xatoligi" });
  }
};

export const adminCheckDentistTelegramLink = async (req, res) => {
  try {
    const dentistId = String(req.params?.id || "").trim();
    if (!dentistId) {
      return res.status(400).json({ success: false, message: "Shifokor ID-si kerak" });
    }

    const { default: dentistModel } = await import("../models/dentistModel.js");
    let dentist;
    if (mongoose.Types.ObjectId.isValid(dentistId)) {
      dentist = await dentistModel.findById(dentistId).select("telegram name");
    }
    if (!dentist) {
      dentist = await dentistModel.findOne({ dentistId }).select("telegram name");
    }
    if (!dentist) {
      return res.status(404).json({ success: false, message: "Shifokor topilmadi" });
    }

    if (dentist.telegram?.isVerified && dentist.telegram?.chatId) {
      return res.json({ success: true, linked: true, dentist });
    }

    return res.json({ success: true, linked: false });
  } catch (error) {
    console.error("adminCheckDentistTelegramLink error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server xatoligi" });
  }
};

export const adminUnlinkDentistTelegram = async (req, res) => {
  try {
    const dentistId = String(req.params?.id || "").trim();
    if (!dentistId) {
      return res.status(400).json({ success: false, message: "Shifokor ID-si kerak" });
    }

    const { default: dentistModel } = await import("../models/dentistModel.js");
    let dentist;
    if (mongoose.Types.ObjectId.isValid(dentistId)) {
      dentist = await dentistModel.findById(dentistId);
    }
    if (!dentist) {
      dentist = await dentistModel.findOne({ dentistId });
    }
    if (!dentist) {
      return res.status(404).json({ success: false, message: "Shifokor topilmadi" });
    }

    dentist.telegram = {
      chatId: "",
      username: "",
      firstName: "",
      isVerified: false,
      linkedAt: null,
      pendingLink: emptyPendingLink(),
    };

    await dentist.save();

    return res.json({
      success: true,
      message: "Telegram bog'lanishi muvaffaqiyatli uzildi!",
    });
  } catch (error) {
    console.error("adminUnlinkDentistTelegram error:", error);
    return res.status(500).json({ success: false, message: error.message || "Server xatoligi" });
  }
};

export const dentistCreateTelegramLink = async (req, res) => {
  req.params.id = req.dentistId;
  return adminCreateDentistTelegramLink(req, res);
};

export const dentistCheckTelegramLink = async (req, res) => {
  req.params.id = req.dentistId;
  return adminCheckDentistTelegramLink(req, res);
};

export const dentistUnlinkTelegram = async (req, res) => {
  req.params.id = req.dentistId;
  return adminUnlinkDentistTelegram(req, res);
};
