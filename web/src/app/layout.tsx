import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Space Debris Risk Model",
  description:
    "Advanced orbital collision risk analysis and visualization platform",
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
