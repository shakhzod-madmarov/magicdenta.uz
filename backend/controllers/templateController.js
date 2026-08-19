import templateModel from "../models/templateModel.js";

const clean = (value = "") => String(value || "").replace(/\r/g, "").trim();

const escapeRegex = (value = "") =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const mapTemplate = (doc) => ({
  _id: doc._id,
  title: doc.title || "",
  diagnosis: doc.diagnosis || "",
  teeth: doc.teeth || "",
  procedures: doc.procedures || "",
  nextStep: doc.nextStep || "",
  medicines: doc.medicines || "",
  notes: doc.notes || "",
  isFavorite: Boolean(doc.isFavorite),
  price: Number(doc.price || 0),
  useCount: Number(doc.useCount || 0),
  lastUsedAt: doc.lastUsedAt || null,
  createdAt: doc.createdAt || null,
  updatedAt: doc.updatedAt || null,
});

export const dentistTemplates = async (req, res) => {
  try {
    const rows = await templateModel
      .find({ dentistId: req.dentistId })
      .sort({ isFavorite: -1, useCount: -1, title: 1, createdAt: -1 })
      .lean();

    return res.json({ success: true, templates: rows.map(mapTemplate) });
  } catch (error) {
    console.error("dentistTemplates error:", error);
    return res.json({ success: false, message: "Shablonlarni yuklab bo‘lmadi" });
  }
};

export const dentistCreateTemplate = async (req, res) => {
  try {
    const payload = {
      title: clean(req.body?.title),
      diagnosis: clean(req.body?.diagnosis),
      teeth: clean(req.body?.teeth),
      procedures: clean(req.body?.procedures),
      nextStep: clean(req.body?.nextStep),
      medicines: clean(req.body?.medicines),
      notes: clean(req.body?.notes),
      isFavorite: Boolean(req.body?.isFavorite),
      price: Math.max(0, Number(req.body?.price || 0)),
    };

    if (!payload.title) {
      return res.json({ success: false, message: "Shablon nomi majburiy" });
    }

    if (
      !payload.diagnosis &&
      !payload.teeth &&
      !payload.procedures &&
      !payload.nextStep &&
      !payload.medicines &&
      !payload.notes
    ) {
      return res.json({
        success: false,
        message: "Kamida bitta mazmunli maydonni to‘ldiring",
      });
    }

    const existing = await templateModel.findOne({
      dentistId: req.dentistId,
      title: {
        $regex: `^${escapeRegex(payload.title)}$`,
        $options: "i",
      },
    });

    if (existing) {
      return res.json({
        success: false,
        message: "Shu nomdagi shablon allaqachon mavjud",
      });
    }

    const created = await templateModel.create({
      dentistId: req.dentistId,
      ...payload,
    });

    return res.json({
      success: true,
      message: "Shablon saqlandi",
      template: mapTemplate(created.toObject()),
    });
  } catch (error) {
    console.error("dentistCreateTemplate error:", error);
    return res.json({ success: false, message: "Shablonni saqlab bo‘lmadi" });
  }
};

export const dentistUpdateTemplate = async (req, res) => {
  try {
    const id = String(req.params?.id || "").trim();
    if (!id) return res.json({ success: false, message: "Shablon topilmadi" });

    const template = await templateModel.findOne({
      _id: id,
      dentistId: req.dentistId,
    });
    if (!template) return res.json({ success: false, message: "Shablon topilmadi" });

    const payload = {
      title: clean(req.body?.title),
      diagnosis: clean(req.body?.diagnosis),
      teeth: clean(req.body?.teeth),
      procedures: clean(req.body?.procedures),
      nextStep: clean(req.body?.nextStep),
      medicines: clean(req.body?.medicines),
      notes: clean(req.body?.notes),
      isFavorite: Boolean(req.body?.isFavorite),
      price: Math.max(0, Number(req.body?.price || 0)),
    };

    if (!payload.title) {
      return res.json({ success: false, message: "Shablon nomi majburiy" });
    }

    if (
      !payload.diagnosis &&
      !payload.teeth &&
      !payload.procedures &&
      !payload.nextStep &&
      !payload.medicines &&
      !payload.notes
    ) {
      return res.json({
        success: false,
        message: "Kamida bitta mazmunli maydonni to‘ldiring",
      });
    }

    const dup = await templateModel.findOne({
      dentistId: req.dentistId,
      _id: { $ne: template._id },
      title: {
        $regex: `^${escapeRegex(payload.title)}$`,
        $options: "i",
      },
    });

    if (dup) {
      return res.json({
        success: false,
        message: "Shu nomdagi shablon allaqachon mavjud",
      });
    }

    Object.assign(template, payload);
    await template.save();

    return res.json({
      success: true,
      message: "Shablon yangilandi",
      template: mapTemplate(template.toObject()),
    });
  } catch (error) {
    console.error("dentistUpdateTemplate error:", error);
    return res.json({ success: false, message: "Shablonni yangilab bo‘lmadi" });
  }
};

export const dentistDeleteTemplate = async (req, res) => {
  try {
    const id = String(req.params?.id || "").trim();
    if (!id) return res.json({ success: false, message: "Shablon topilmadi" });

    const deleted = await templateModel.findOneAndDelete({
      _id: id,
      dentistId: req.dentistId,
    });

    if (!deleted) {
      return res.json({ success: false, message: "Shablon topilmadi" });
    }

    return res.json({ success: true, message: "Shablon o‘chirildi" });
  } catch (error) {
    console.error("dentistDeleteTemplate error:", error);
    return res.json({ success: false, message: "Shablonni o‘chirib bo‘lmadi" });
  }
};

export const markTemplateUsed = async ({ dentistId, templateId }) => {
  if (!dentistId || !templateId) return null;

  try {
    const template = await templateModel.findOne({ _id: templateId, dentistId });
    if (!template) return null;

    template.useCount = Number(template.useCount || 0) + 1;
    template.lastUsedAt = new Date();
    await template.save();

    return mapTemplate(template.toObject());
  } catch (error) {
    console.error("markTemplateUsed error:", error);
    return null;
  }
};
