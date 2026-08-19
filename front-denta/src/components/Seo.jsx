import { useEffect } from "react";

const SITE_NAME = 'Magic Denta';
const SITE_URL = "https://magicdenta.uz";
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;
const DEFAULT_KEYWORDS =
  "magic denta, magicdenta, stomatologiya, stomatolog, tish davolash, breket, tish implant, bolalar stomatologi, estetik stomatologiya, vinirlar, dental orthopedics, dental clinic, tish klinikasi";

const upsertMeta = (selector, attrs) => {
  let el = document.head.querySelector(selector);

  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }

  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
};

const upsertLink = (selector, attrs) => {
  let el = document.head.querySelector(selector);

  if (!el) {
    el = document.createElement("link");
    document.head.appendChild(el);
  }

  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
};

const Seo = ({
  title,
  description,
  keywords = DEFAULT_KEYWORDS,
  canonicalPath = "/",
  image = DEFAULT_IMAGE,
  noindex = false,
  jsonLd,
}) => {
  useEffect(() => {
    const canonicalUrl = canonicalPath.startsWith("http")
      ? canonicalPath
      : `${SITE_URL}${canonicalPath}`;

    document.title = title;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description,
    });

    upsertMeta('meta[name="keywords"]', {
      name: "keywords",
      content: keywords,
    });

    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: noindex ? "noindex, nofollow" : "index, follow",
    });

    upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: canonicalUrl,
    });

    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });

    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: SITE_NAME,
    });

    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: title,
    });

    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });

    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonicalUrl,
    });

    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: image,
    });

    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });

    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: title,
    });

    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });

    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: image,
    });

    const oldJsonLd = document.getElementById("page-jsonld");
    if (oldJsonLd) oldJsonLd.remove();

    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "page-jsonld";
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const pageJsonLd = document.getElementById("page-jsonld");
      if (pageJsonLd) pageJsonLd.remove();
    };
  }, [title, description, keywords, canonicalPath, image, noindex, jsonLd]);

  return null;
};

export default Seo;
