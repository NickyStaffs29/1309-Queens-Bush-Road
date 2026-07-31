import type { MetadataRoute } from "next";

// The production origin is supplied at deploy time. Until it exists, every
// URL-derived output stays off rather than guessing at a domain.
export function validateSiteUrl(value: string | undefined): string | null {
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`SITE_URL must be an absolute URL, received: ${value}`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`SITE_URL must use https, received: ${value}`);
  }
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error(`SITE_URL must be a bare origin without path, query or fragment, received: ${value}`);
  }

  return url.origin;
}

export function getSiteUrl(): string | null {
  return validateSiteUrl(process.env.SITE_URL);
}

export function robotsFor(siteUrl: string | null): MetadataRoute.Robots {
  if (!siteUrl) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

export function sitemapFor(siteUrl: string | null): MetadataRoute.Sitemap {
  if (!siteUrl) return [];

  return [{ url: siteUrl, changeFrequency: "monthly", priority: 1 }];
}

// Only owner-confirmed facts are published. The offer hangs off the listing
// rather than the residence: `offers` is a CreativeWork property, and
// SingleFamilyResidence is a Place.
export function propertyGraphFor(siteUrl: string) {
  const listing = `${siteUrl}/#listing`;
  const residence = `${siteUrl}/#residence`;
  const image = `${siteUrl}/#primaryimage`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateListing",
        "@id": listing,
        url: siteUrl,
        name: "Casa Marrone | 1309 Queens Bush Road, Wellesley",
        description: "An 1835 five-bedroom house in Wellesley, Ontario, offered by private sale.",
        mainEntity: { "@id": residence },
        primaryImageOfPage: { "@id": image },
        offers: {
          "@type": "Offer",
          price: 1895000,
          priceCurrency: "CAD",
          availability: "https://schema.org/InStock",
          itemOffered: { "@id": residence },
        },
      },
      {
        "@type": "SingleFamilyResidence",
        "@id": residence,
        name: "Casa Marrone",
        address: {
          "@type": "PostalAddress",
          streetAddress: "1309 Queens Bush Road",
          addressLocality: "Wellesley",
          addressRegion: "ON",
          addressCountry: "CA",
        },
        yearBuilt: 1835,
        numberOfBedrooms: 5,
        numberOfBathroomsTotal: 4,
        floorSize: { "@type": "QuantitativeValue", value: 6553.32, unitCode: "FTK" },
        photo: { "@id": image },
      },
      {
        "@type": "ImageObject",
        "@id": image,
        contentUrl: `${siteUrl}/property/video/property-overview-desktop-poster.webp`,
        width: 1600,
        height: 900,
        caption: "Aerial view of Casa Marrone and its surrounding grounds",
      },
    ],
  };
}
