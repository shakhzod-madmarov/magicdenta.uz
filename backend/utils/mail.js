import "dotenv/config";
import nodemailer from "nodemailer";

class MailConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "MailConfigError";
    this.code = "MAIL_CONFIG_ERROR";
    this.statusCode = 503;
  }
}

let transporter = null;
let transporterVerified = false;

const cleanEnv = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const isValidEmail = (value = "") => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
};

const sanitizeHeaderText = (value = "") => {
  return String(value).replace(/[\r\n]+/g, " ").trim();
};

const getMailConfig = () => {
  const host = cleanEnv(process.env.CONTACT_SMTP_HOST);
  const portRaw = cleanEnv(process.env.CONTACT_SMTP_PORT || "587");
  const user = cleanEnv(process.env.CONTACT_SMTP_USER);
  const pass = cleanEnv(process.env.CONTACT_SMTP_PASS);
  const to = cleanEnv(process.env.CONTACT_TO || user);
  const from = cleanEnv(process.env.CONTACT_FROM || user);

  const port = Number(portRaw);

  if (!host || !portRaw || !user || !pass) {
    throw new MailConfigError(
      "Contact email service is not configured. Missing SMTP environment variables.",
    );
  }

  if (!Number.isInteger(port) || port <= 0) {
    throw new MailConfigError("Invalid CONTACT_SMTP_PORT value.");
  }

  if (!isValidEmail(user)) {
    throw new MailConfigError("Invalid CONTACT_SMTP_USER email address.");
  }

  if (!isValidEmail(to)) {
    throw new MailConfigError("Invalid CONTACT_TO email address.");
  }

  if (!isValidEmail(from)) {
    throw new MailConfigError("Invalid CONTACT_FROM email address.");
  }

  return {
    host,
    port,
    user,
    pass,
    to,
    from,
    secure: port === 465,
  };
};

const getTransporter = () => {
  if (transporter) return transporter;

  const config = getMailConfig();

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
  });

  return transporter;
};

const verifyTransporter = async () => {
  if (transporterVerified) return true;

  const mailer = getTransporter();
  await mailer.verify();
  transporterVerified = true;
  console.log("[contact-mail] SMTP transporter verified successfully");

  return true;
};

const buildSmtpErrorLog = (error) => ({
  name: error?.name,
  message: error?.message,
  code: error?.code,
  responseCode: error?.responseCode,
  command: error?.command,
  response: error?.response,
});

export const sendContactEmail = async ({ name, phone, email, message }) => {
  const config = getMailConfig();
  const mailer = getTransporter();

  const safeName = sanitizeHeaderText(name);
  const safePhone = sanitizeHeaderText(phone);
  const safeEmail = sanitizeHeaderText(email || "");
  const safeMessage = String(message || "").trim();

  const replyTo = isValidEmail(safeEmail)
    ? `"${safeName || "Contact form user"}" <${safeEmail}>`
    : undefined;

  const subject = `Yangi kontakt xabari: ${safeName || "Noma'lum foydalanuvchi"}`;

  const text = [
    "Yangi kontakt xabari:",
    "",
    `Ism: ${safeName || "-"}`,
    `Telefon: ${safePhone || "-"}`,
    `Email: ${safeEmail || "-"}`,
    "",
    "Xabar:",
    safeMessage || "-",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2>Yangi kontakt xabari</h2>
      <p><strong>Ism:</strong> ${safeName || "-"}</p>
      <p><strong>Telefon:</strong> ${safePhone || "-"}</p>
      <p><strong>Email:</strong> ${safeEmail || "-"}</p>
      <p><strong>Xabar:</strong></p>
      <p style="white-space: pre-wrap;">${safeMessage || "-"}</p>
    </div>
  `;

  try {
    await verifyTransporter();

    const info = await mailer.sendMail({
      from: `"Magic Denta" <${config.from}>`,
      to: config.to,
      subject,
      text,
      html,
      replyTo,
      envelope: {
        from: config.user,
        to: [config.to],
      },
    });

    console.log("[contact-mail] Email sent", {
      messageId: info?.messageId,
      accepted: info?.accepted,
      rejected: info?.rejected,
      response: info?.response,
    });

    return info;
  } catch (error) {
    console.error("[contact-mail] Failed to send contact email", buildSmtpErrorLog(error));
    throw error;
  }
};

export { MailConfigError };
