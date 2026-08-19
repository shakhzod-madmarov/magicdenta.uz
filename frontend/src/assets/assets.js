import header_img from "./header_img.png";
import header_doctor from "./header_doctor.jpg";
import about_img from "./about_img.jpg";
import upload_img from "./upload_area.svg";
import logo from "./logo-horizontal.svg";
import logoVertical from "./logo-vertical.svg";
import logoWhite from "./logo-white.svg";
import favicon from "./favicon.svg";

import Therapeutic_dentistry from "./Therapeutic-dentistry.png";
import Orthodontist_dentistry from "./orthodontist-dentistry.png";
import Orthopedic_dentistry from "./orthopedic-dentistry.png";
import Surgery_denistry from "./surgery_denistry.png";
import Aesthetic_dentistry from "./Aesthetic_dentistry.png";

export const assets = {
  header_img,
  header_doctor,
  about_img,
  logo,
  logoVertical,
  logoWhite,
  logo_white: logoWhite,
  logo_horizontal: logo,
  favicon,
  upload_img,
};

export const specialityData = [
  {
    speciality: "Ortodontiya",
    image: Orthodontist_dentistry,
    displayName: { uz: "Ortodontiya", ru: "Ортодонтия", en: "Orthodontics" },
    badge: { uz: "TISH QATORI", ru: "ЗУБНОЙ РЯД", en: "DENTAL ROW" }
  },
  {
    speciality: "Terapevtik stomatologiya",
    image: Therapeutic_dentistry,
    displayName: { uz: "Terapevtik stomatologiya", ru: "Терапевтическая стоматология", en: "Therapeutic Dentistry" },
    badge: { uz: "ASOSIY DAVOLASH", ru: "ОСНОВНОЕ ЛEЧЕНИЕ", en: "PRIMARY TREATMENT" }
  },
  {
    speciality: "Ortopedik stomatologiya",
    image: Orthopedic_dentistry,
    displayName: { uz: "Ortopedik stomatologiya", ru: "Ортопедическая стоматология", en: "Orthopedic Dentistry" },
    badge: { uz: "TIKLASH & PROTEZLASH", ru: "ВОССТАНОВЛЕНИЕ", en: "RESTORATION" }
  },
  {
    speciality: "Estetik stomatologiya",
    image: Aesthetic_dentistry,
    displayName: { uz: "Estetik stomatologiya", ru: "Эстетическая стоматология", en: "Aesthetic Dentistry" },
    badge: { uz: "TABASSUM DIZAYNI", ru: "ДИЗАЙН УЛЫБКИ", en: "SMILE DESIGN" }
  },
  {
    speciality: "Stomatologiya Jarrohligi",
    image: Surgery_denistry,
    displayName: { uz: "Jarrohlik stomatologiyasi", ru: "Хирургическая стоматология", en: "Surgical Dentistry" },
    badge: { uz: "XAVFSIZ JARROHLIK", ru: "ХИРУРГИЯ", en: "SURGICAL CARE" }
  }
];
