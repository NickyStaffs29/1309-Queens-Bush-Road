import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1309 Queens Bush Road | Wellesley, Ontario",
  description: "Explore a historic five-bedroom Wellesley residence with 6,553 square feet of measured interior space, five covered porches and two natural swimming pools.",
  icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='8' fill='%234b2d1e'/%3E%3Ctext x='32' y='43' text-anchor='middle' font-size='34' fill='%23f4ead8'%3E13%3C/text%3E%3C/svg%3E" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
