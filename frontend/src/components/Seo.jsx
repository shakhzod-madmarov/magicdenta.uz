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
  breadcrumbs,
}) => {
  useEffect(() => {
    const canonicalUrl = canonicalPath.startsWith("http")
      ? canonicalPath
      : `${SITE_URL}${canonicalPath === "/" ? "" : canonicalPath}`;

    const formattedTitle = title?.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    document.title = formattedTitle;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description || "",
    });

    upsertMeta('meta[name="keywords"]', {
      name: "keywords",
      content: keywords || DEFAULT_KEYWORDS,
    });

    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    });

    upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: canonicalUrl || SITE_URL,
    });

    // Open Graph
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });

    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: `${SITE_NAME} Stomatologiya Klinikasi`,
    });

    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: formattedTitle,
    });

    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description || "",
    });

    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonicalUrl,
    });

    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: image || DEFAULT_IMAGE,
    });

    upsertMeta('meta[property="og:image:secure_url"]', {
      property: "og:image:secure_url",
      content: image || DEFAULT_IMAGE,
    });

    upsertMeta('meta[property="og:image:width"]', {
      property: "og:image:width",
      content: "1200",
    });

    upsertMeta('meta[property="og:image:height"]', {
      property: "og:image:height",
      content: "630",
    });

    // Twitter Card
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });

    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: formattedTitle,
    });

    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description || "",
    });

    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: image || DEFAULT_IMAGE,
    });

    // Clean up old scripts
    const oldJsonLd = document.getElementById("page-jsonld");
    if (oldJsonLd) oldJsonLd.remove();
    const oldBreadcrumbJsonLd = document.getElementById("page-breadcrumbs-jsonld");
    if (oldBreadcrumbJsonLd) oldBreadcrumbJsonLd.remove();

    // Inject JSON-LD
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "page-jsonld";
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    // Inject Breadcrumb Schema if provided
    if (Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: crumb.name,
          item: crumb.path.startsWith("http") ? crumb.path : `${SITE_URL}${crumb.path}`,
        })),
      };
      const bScript = document.createElement("script");
      bScript.type = "application/ld+json";
      bScript.id = "page-breadcrumbs-jsonld";
      bScript.text = JSON.stringify(breadcrumbData);
      document.head.appendChild(bScript);
    }

    return () => {
      const pageJsonLd = document.getElementById("page-jsonld");
      if (pageJsonLd) pageJsonLd.remove();
      const pageBreadcrumbs = document.getElementById("page-breadcrumbs-jsonld");
      if (pageBreadcrumbs) pageBreadcrumbs.remove();
    };
  }, [title, description, keywords, canonicalPath, image, noindex, jsonLd, breadcrumbs]);

  return null;
};

export default Seo;
