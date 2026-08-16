import type { Metadata } from "next";
import { getSiteUrl } from "./site-url";
import "./globals.css";

const title = "Casa Serenita | 1309 Queens Bush Road, Wellesley";
const description = "Casa Serenita is an 1835 six-bedroom house on a secluded 3.05-acre property in Wellesley, Ontario, offered by private sale at CAD $1,895,000, with 4,956 sq. ft. of finished space, five covered porches, a natural swimming pond and a separate lower pond.";
const socialImage = "/property/video/property-overview-desktop-poster.webp";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title,
  description,
  icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='8' fill='%234b2d1e'/%3E%3Ctext x='32' y='43' text-anchor='middle' font-size='30' fill='%23f4ead8'%3ECS%3C/text%3E%3C/svg%3E" },
  // Canonical and social metadata need the real origin, so they wait for launch.
  ...(siteUrl
    ? {
        metadataBase: new URL(siteUrl),
        alternates: { canonical: "/" },
        openGraph: {
          type: "website",
          siteName: "Casa Serenita",
          title,
          description,
          url: siteUrl,
          locale: "en_CA",
          images: [{
            url: `${siteUrl}${socialImage}`,
            width: 1600,
            height: 900,
            alt: "Aerial view of Casa Serenita and its surrounding grounds",
          }],
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: [`${siteUrl}${socialImage}`],
        },
      }
    : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: "history.scrollRestoration='manual';" }} />
        {children}
      </body>
    </html>
  );
}
