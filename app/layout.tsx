import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casa Marrone | 1309 Queens Bush Road, Wellesley",
  description: "Casa Marrone is an 1835 five-bedroom house in Wellesley, Ontario, offered by private sale at CAD $1,895,000 with 6,553.32 sq. ft. measured, five covered porches and two natural swimming pools.",
  icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='8' fill='%234b2d1e'/%3E%3Ctext x='32' y='43' text-anchor='middle' font-size='30' fill='%23f4ead8'%3ECM%3C/text%3E%3C/svg%3E" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
