import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dentistModel from "../models/dentistModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_DB = process.env.MONGODB_DB || "magicdenta_dev";

const mongoUri = MONGODB_URI.includes("/" + MONGODB_DB)
  ? MONGODB_URI
  : `${MONGODB_URI.replace(/\/$/, "")}/${MONGODB_DB}`;

// Adjust path to sitemap.xml in the patient frontend public directory
const SITEMAP_PATH = path.resolve(__dirname, "../../front-denta/public/sitemap.xml");

async function generate() {
  let dentists = [];
  try {
    console.log("Connecting to MongoDB for sitemap generation...");
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log("Successfully connected to database!");
    dentists = await dentistModel.find({ isArchived: { $ne: true } }).select("_id name").lean();
    console.log(`Found ${dentists.length} active dentists in the database.`);
    await mongoose.disconnect();
  } catch (dbErr) {
    console.warn("Notice: Generating static sitemap without live DB connection:", dbErr.message);
  }

  const todayStr = new Date().toISOString().split("T")[0];

  const staticUrls = [
    { loc: "https://magicdenta.uz/", changefreq: "daily", priority: "1.0", hasImage: true },
    { loc: "https://magicdenta.uz/dentists", changefreq: "weekly", priority: "0.9" },
    { loc: "https://magicdenta.uz/about", changefreq: "monthly", priority: "0.8" },
    { loc: "https://magicdenta.uz/contact", changefreq: "monthly", priority: "0.8" },
    { loc: "https://magicdenta.uz/services/breket-davolash", changefreq: "weekly", priority: "0.9" },
    { loc: "https://magicdenta.uz/services/tish-implantatsiyasi", changefreq: "weekly", priority: "0.9" },
    { loc: "https://magicdenta.uz/services/bolalar-stomatologiyasi", changefreq: "weekly", priority: "0.9" },
    { loc: "https://magicdenta.uz/services/estetik-stomatologiya", changefreq: "weekly", priority: "0.9" },
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  // Add static URLs
  for (const url of staticUrls) {
    xml += "  <url>\n";
    xml += `    <loc>${url.loc}</loc>\n`;
    xml += `    <lastmod>${todayStr}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="uz" href="${url.loc}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="ru" href="${url.loc}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${url.loc}" />\n`;
    if (url.hasImage) {
      xml += "    <image:image>\n";
      xml += "      <image:loc>https://magicdenta.uz/logo.png</image:loc>\n";
      xml += '      <image:title>Magic Denta Stomatologiya Klinikasi</image:title>\n';
      xml += "      <image:caption>Zamonaviy stomatologiya klinikasi — Dental Orthopedics</image:caption>\n";
      xml += "    </image:image>\n";
    }
    xml += "  </url>\n";
  }

  // Add dynamic dentist URLs
  for (const dentist of dentists) {
    xml += "  <url>\n";
    xml += `    <loc>https://magicdenta.uz/appointment/${dentist._id}</loc>\n`;
    xml += `    <lastmod>${todayStr}</lastmod>\n`;
    xml += "    <changefreq>weekly</changefreq>\n";
    xml += "    <priority>0.7</priority>\n";
    xml += "  </url>\n";
  }

  xml += "</urlset>\n";

  fs.writeFileSync(SITEMAP_PATH, xml, "utf8");
  console.log(`Successfully generated sitemap with ${staticUrls.length + dentists.length} URLs!`);
}

generate().catch((err) => {
  console.error("Error generating sitemap:", err);
  process.exit(1);
});
