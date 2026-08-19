import Header from "../components/Header";
import Specialities from "../components/Specialities";
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
      addressLocality: "Toshkent",
      addressRegion: "Toshkent",
      postalCode: "170126",
      addressCountry: "UZ"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 40.749296,
      longitude: 72.360242
    },
    hasMap: "https://yandex.uz/maps/-/CTgrvSoY",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "43",
      bestRating: "5",
      worstRating: "1"
    },
    sameAs: [
      "https://yandex.uz/maps/-/CTgrvSoY",
      "https://www.instagram.com/magic.denta/",
      "https://www.instagram.com/nodirbek8884/",
      "https://t.me/magicdenta",
      "https://api.whatsapp.com/send/?phone=998979908884",
      "https://viber.click/998979908884"
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+998979908884",
        contactType: "customer service",
        areaServed: "UZ",
        availableLanguage: ["uz", "ru", "en"]
      }
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
        <TopDentists />
        <Banner />
      </main>
    </>
  );
};

export default Home;
