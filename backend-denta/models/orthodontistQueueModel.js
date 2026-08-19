import mongoose from "mongoose";

const progressImageSchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
    originalName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    sizeBytes: { type: Number, default: 0 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const requeueHistorySchema = new mongoose.Schema(
  {
    previousQueueNo: { type: Number, default: null },
    previousStatus: { type: String, default: "" },

    previousAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointment",
      default: null,
    },

    previousCalledAt: { type: Date, default: null },
    previousMissedAt: { type: Date, default: null },

    rejoinedAt: { type: Date, default: Date.now },
    reason: { type: String, default: "MISSED_REJOIN" },
  },
  { _id: true },
);

const orthodontistQueueSchema = new mongoose.Schema(
  {
    dayKey: {
      type: String,
      required: true,
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    dentistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dentist",
      required: true,
      index: true,
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "appointment",
      default: null,
      index: true,
    },

    firstVisit: {
      type: Boolean,
      default: false,
    },

    visitPurpose: {
      type: String,
      enum: [
        "REGULAR_CONTROL",
        "FIRST_VISIT",
        "EMERGENCY",
        "WALK_IN",
        "ONLINE_APPOINTMENT",
        "APPLIANCE_CHECK",
        "BRACES_ADJUSTMENT",
      ],
      default: "REGULAR_CONTROL",
    },

    visitPurposeLabel: {
      type: String,
      default: "",
    },

    queueNo: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["WAITING", "CALLED", "IN_PROGRESS", "DONE", "MISSED", "CANCELLED"],
      default: "WAITING",
      index: true,
    },

    source: {
      type: String,
      enum: [
        "TELEGRAM",
        "ONLINE",
        "ADMIN_WALKIN",
        "DENTIST_WALKIN",
        "ADMIN_BOOKING",
        "DENTIST_BOOKING",
      ],
      default: "TELEGRAM",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    arrivedAt: {
      type: Date,
      default: null,
    },

    calledAt: {
      type: Date,
      default: null,
    },

    doneAt: {
      type: Date,
      default: null,
    },

    missedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    followUpDays: {
      type: Number,
      enum: [3, 7, 10, 15, null],
      default: null,
    },

    followUpSelectedAt: {
      type: Date,
      default: null,
    },

    nextPlannedDate: {
      type: String,
      default: "",
    },

    followUpMessageSentAt: {
      type: Date,
      default: null,
    },

    followUpMessageError: {
      type: String,
      default: "",
    },

    followUpReminderPlanCreatedAt: {
      type: Date,
      default: null,
    },

    progressImages: {
      type: [progressImageSchema],
      default: [],
    },

    requeueHistory: {
      type: [requeueHistorySchema],
      default: [],
    },

    lastLocationAt: {
      type: Date,
      default: null,
    },

    distanceMeters: {
      type: Number,
      default: null,
    },

    lastLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      accuracy: { type: Number, default: null },
    },
  },
  { timestamps: true },
);

orthodontistQueueSchema.index(
  { dentistId: 1, dayKey: 1, queueNo: 1 },
  { unique: true },
);

orthodontistQueueSchema.index(
  { patientId: 1, dentistId: 1, dayKey: 1 },
  { unique: true },
);

const orthodontistQueueModel =
  mongoose.models.orthodontistQueue ||
  mongoose.model("orthodontistQueue", orthodontistQueueSchema);

export default orthodontistQueueModel;
