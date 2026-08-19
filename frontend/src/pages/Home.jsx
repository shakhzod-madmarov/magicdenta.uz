import Header from "../components/Header";
import Specialities from "../components/Specialities";
import TechFeatures from "../components/TechFeatures";
import TopDentists from "../components/TopDentists";
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
    openingHours: "Mo-Su 00:00-23:59",
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
        description="Magic Denta — tajribali stomatologlar, sifatli tish davolash, zamonaviy uskunalar va qulay onlayn xizmatlar. Manzil: Bobur shoh koʻchasi, 1B."
        canonicalPath="/"
        jsonLd={jsonLd}
      />
      <Header />
      <main>
        <Specialities />
        <TechFeatures />
        <TopDentists />
        <Banner />
      </main>
    </>
  );
};

export default Home;
