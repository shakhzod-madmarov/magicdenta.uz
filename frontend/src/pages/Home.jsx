import Header from "../components/Header";
import Specialities from "../components/Specialities";
import SmileQuiz from "../components/SmileQuiz";
import BeforeAfterGallery from "../components/BeforeAfterGallery";
import TechFeatures from "../components/TechFeatures";
import ReviewsTrust from "../components/ReviewsTrust";
import Banner from "../components/Banner";
import Seo from "../components/Seo";

const Home = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Dentist", "MedicalBusiness", "LocalBusiness"],
    name: "Magic Denta",
    alternateName: ["Magic Denta", "MagicDenta", "Magic Denta Dental Orthopedics"],
    url: "https://magicdenta.uz/",
    logo: "https://magicdenta.uz/logo.png",
    image: "https://magicdenta.uz/logo.png",
    telephone: ["+998912891514", "+998905429303"],
    email: "magicdenta.uz@gmail.com",
    priceRange: "10000 UZS - 1400000 UZS",
    openingHours: "Mo-Sa 08:00-20:00",
    medicalSpecialty: [
      "Orthodontics",
      "Prosthodontics",
      "CosmeticDentistry",
      "OralSurgery",
      "RestorativeDentistry"
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "520",
      bestRating: "5",
      worstRating: "1"
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bobur shoh koʻchasi, 1B",
      addressLocality: "Andijon",
      addressRegion: "Andijon",
      postalCode: "170126",
      addressCountry: "UZ"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 40.749296,
      longitude: 72.360242
    },
    hasMap: "https://yandex.uz/maps/-/CTsybHos",
    sameAs: [
      "https://yandex.uz/maps/-/CTsybHos",
      "https://www.instagram.com/magic.denta/",
      "https://t.me/+998912891514"
    ]
  };

  return (
    <>
      <Seo
        title="Magic Denta | Zamonaviy stomatologiya klinikasi"
        description="Magic Denta — 5 ta asosiy mutaxassislik (Ortodontiya, Terapiya, Ortopediya, Estetika, Jarrohlik), sifatli tish davolash va zamonaviy uskunalar. Manzil: Bobur shoh koʻchasi, 1B."
        canonicalPath="/"
        jsonLd={jsonLd}
      />
      <Header />
      <div className="w-full">
        <Specialities />
        <SmileQuiz />
        <BeforeAfterGallery />
        <TechFeatures />
        <ReviewsTrust />
        <Banner />
      </div>
    </>
  );
};

export default Home;
