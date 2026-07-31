import type { MetadataRoute } from "next";
import { getSiteUrl, sitemapFor } from "./site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapFor(getSiteUrl());
}
