import warehouseItemModel from "../models/warehouseItemModel.js";
import warehouseLogModel from "../models/warehouseLogModel.js";
import expenseModel from "../models/expenseModel.js";
import dentistModel from "../models/dentistModel.js";
import { logActivity } from "../utils/activityLogger.js";

// 1. Create a new warehouse item profile
export const createWarehouseItem = async (req, res) => {
  try {
    const { name, category, unit, minQty, initialQty, unitPrice } = req.body;

    if (!name || !category || !unit) {
      return res.json({ success: false, message: "Barcha majburiy maydonlarni to'ldiring" });
    }

    const nameTrimmed = String(name).trim();
    const existing = await warehouseItemModel.findOne({ name: nameTrimmed, isActive: true });
    if (existing) {
      return res.json({ success: false, message: "Bunday material allaqachon mavjud" });
    }

    const min = Number(minQty) >= 0 ? Number(minQty) : 5;
    const initQty = Number(initialQty) >= 0 ? Number(initialQty) : 0;
    const price = Number(unitPrice) >= 0 ? Number(unitPrice) : 0;

    const item = await warehouseItemModel.create({
      name: nameTrimmed,
      category,
      quantity: initQty,
      unit: String(unit).trim(),
      unitPrice: price,
      minQty: min,
      isActive: true,
      lastStockedAt: initQty > 0 ? new Date() : null,
    });

    // If initial qty > 0, let's create a warehouse log and an expense!
    if (initQty > 0) {
      const totalPrice = initQty * price;

      let expenseId = null;
      if (totalPrice > 0) {
        const expense = await expenseModel.create({
          category: "Materiallar",
          amount: totalPrice,
          date: new Date(),
          note: `Boshlang'ich ombor kirimi: ${item.name} (${initQty} ${item.unit})`,
          createdBy: "Admin",
        });
        expenseId = expense._id;
      }

      await warehouseLogModel.create({
        itemId: item._id,
        type: "IN",
        qty: initQty,
        pricePerUnit: price,
        totalPrice,
        reason: "Boshlang'ich qoldiq kiritildi",
        expenseId,
        operatorName: "Admin",
      });
    }

    await logActivity("CREATE_WAREHOUSE_ITEM", req, item._id, item.name, `Yangi material ombor ro'yxatiga qo'shildi: ${item.name}. Boshlang'ich qoldiq: ${initQty}.`);

    return res.json({ success: true, message: "Material muvaffaqiyatli qo'shildi", item });
  } catch (error) {
    console.error("createWarehouseItem error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// 2. Get all warehouse items
export const getWarehouseItems = async (req, res) => {
  try {
    const items = await warehouseItemModel.find({ isActive: true }).sort({ name: 1 });
    return res.json({ success: true, items });
  } catch (error) {
    console.error("getWarehouseItems error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// 3. Stock addition (Kirim) + Auto Expense creation
export const stockInItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { qty, pricePerUnit, note } = req.body;

    const item = await warehouseItemModel.findById(id);
    if (!item || !item.isActive) {
      return res.json({ success: false, message: "Material topilmadi" });
    }

    const inputQty = Number(qty);
    const inputPrice = Number(pricePerUnit);

    if (Number.isNaN(inputQty) || inputQty <= 0) {
      return res.json({ success: false, message: "Miqdor noto'g'ri kiritilgan" });
    }
    if (Number.isNaN(inputPrice) || inputPrice < 0) {
      return res.json({ success: false, message: "Narx noto'g'ri kiritilgan" });
    }

    const totalPrice = inputQty * inputPrice;

    // Create Expense entry
    let expenseId = null;
    if (totalPrice > 0) {
      const expense = await expenseModel.create({
        category: "Materiallar",
        amount: totalPrice,
        date: new Date(),
        note: `Ombor kirimi: ${item.name} (${inputQty} ${item.unit})`,
        createdBy: "Admin",
      });
      expenseId = expense._id;
    }

    // Update item stock
    item.quantity = (item.quantity || 0) + inputQty;
    item.unitPrice = inputPrice;
    item.lastStockedAt = new Date();
    await item.save();

    // Create stock-in log
    const logEntry = await warehouseLogModel.create({
      itemId: item._id,
      type: "IN",
      qty: inputQty,
      pricePerUnit: inputPrice,
      totalPrice,
      reason: "Sotib olindi / Omborga kirim qilindi",
      expenseId,
      note: note || "",
      operatorName: req.authRole === "admin" ? "Admin" : "Dentist",
    });

    await logActivity(
      "WAREHOUSE_STOCK_IN",
      req,
      item._id,
      item.name,
      `Kirim: ${inputQty} ${item.unit} qo'shildi. Umumiy xarajat: ${totalPrice} so'm.`
    );

    return res.json({ success: true, message: "Kirim muvaffaqiyatli bajarildi", item, log: logEntry });
  } catch (error) {
    console.error("stockInItem error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// 4. Stock consumption (Chiqim)
export const stockOutItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { qty, reason, dentistID, note } = req.body;

    const item = await warehouseItemModel.findById(id);
    if (!item || !item.isActive) {
      return res.json({ success: false, message: "Material topilmadi" });
    }

    const inputQty = Number(qty);
    if (Number.isNaN(inputQty) || inputQty <= 0) {
      return res.json({ success: false, message: "Miqdor noto'g'ri kiritilgan" });
    }

    if (item.quantity < inputQty) {
      return res.json({
        success: false,
        message: `Omborda yetarli qoldiq yo'q. Hozirda qoldiq: ${item.quantity} ${item.unit}`,
      });
    }

    let dentistName = "";
    let dentistDoc = null;
    if (dentistID) {
      dentistDoc = await dentistModel.findById(dentistID);
      if (dentistDoc) {
        dentistName = dentistDoc.name;
      }
    }

    // Update item stock
    item.quantity = item.quantity - inputQty;
    await item.save();

    // Create stock-out log
    const logEntry = await warehouseLogModel.create({
      itemId: item._id,
      type: "OUT",
      qty: inputQty,
      pricePerUnit: item.unitPrice || 0,
      totalPrice: inputQty * (item.unitPrice || 0),
      reason: reason || "Olib ketildi / Chiqim qilindi",
      dentistID: dentistID || null,
      note: note || "",
      operatorName: req.authRole === "admin" ? "Admin" : "Dentist",
    });

    const denMsg = dentistName ? ` (Mutaxassis: ${dentistName})` : "";
    await logActivity(
      "WAREHOUSE_STOCK_OUT",
      req,
      item._id,
      item.name,
      `Chiqim: ${inputQty} ${item.unit} sarflandi. Sabab: ${reason}${denMsg}.`
    );

    // Notify Dentist via Telegram about warehouse stock-out
    try {
      const { sendTelegramMessage, isTelegramConfigured } = await import("../utils/telegramBot.js");
      const { buildDentistMaterialStockOutMessage } = await import("../utils/telegramMessageBuilders.js");
      if (dentistDoc && isTelegramConfigured() && dentistDoc.telegram?.isVerified && dentistDoc.telegram?.chatId) {
        const denLang = process.env.TELEGRAM_LANGUAGE || "uz";
        const stockText = buildDentistMaterialStockOutMessage({
          itemName: item.name || "",
          qty: inputQty,
          unit: item.unit || "",
          reason: reason || "Olib ketildi / Chiqim qilindi",
          note: note || "",
          language: denLang,
        });
        await sendTelegramMessage({
          chatId: dentistDoc.telegram.chatId,
          text: stockText,
          parseMode: "HTML",
        }).catch(() => {});
      }
    } catch (telegramErr) {
      console.warn("[stockOutItem] Dentist Telegram notify failed:", telegramErr.message);
    }

    return res.json({ success: true, message: "Chiqim muvaffaqiyatli bajarildi", item, log: logEntry });
  } catch (error) {
    console.error("stockOutItem error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// 5. Get all stock movements ledger/history logs
export const getWarehouseLogs = async (req, res) => {
  try {
    const logs = await warehouseLogModel
      .find()
      .populate("itemId", "name category unit")
      .populate("dentistID", "name speciality")
      .sort({ date: -1 })
      .limit(100);

    return res.json({ success: true, logs });
  } catch (error) {
    console.error("getWarehouseLogs error:", error);
    return res.json({ success: false, message: error.message });
  }
};
