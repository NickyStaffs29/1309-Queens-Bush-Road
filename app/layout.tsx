import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1309 Queens Bush Road | St. Jacobs, Ontario",
  description: "Explore a historic five-bedroom St. Jacobs residence with 6,553 square feet of finished space, five covered porches and two natural swimming pools.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
