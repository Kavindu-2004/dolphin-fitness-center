import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dolphin Fitness Center",
  description: "Gym membership and payment management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}