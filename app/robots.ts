import type { MetadataRoute } from "next";
import { getSiteUrl, robotsFor } from "./site-url";

export default function robots(): MetadataRoute.Robots {
  return robotsFor(getSiteUrl());
}
