import Header from "../components/Header";
import Specialities from "../components/Specialities";
import BeforeAfterGallery from "../components/BeforeAfterGallery";
import SmileQuiz from "../components/SmileQuiz";
import TechFeatures from "../components/TechFeatures";
import TopDentists from "../components/TopDentists";
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
        description="Magic Denta — tajribali stomatologlar, 5 ta asosiy mutaxassislik (Ortodontiya, Terapiya, Ortopediya, Estetika, Jarrohlik), sifatli tish davolash va zamonaviy uskunalar. Manzil: Bobur shoh koʻchasi, 1B."
        canonicalPath="/"
        jsonLd={jsonLd}
      />
      <Header />
      <main>
        <Specialities />
        <BeforeAfterGallery />
        <SmileQuiz />
        <TechFeatures />
        <TopDentists />
        <ReviewsTrust />
        <Banner />
      </main>
    </>
  );
};

export default Home;
