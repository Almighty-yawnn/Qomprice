// app/layout.tsx
import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "Komprice",
  description: "Your amazing Komprice website",
  // Add other common meta tags here if needed, e.g., viewport if not automatically handled
  // viewport: 'width=device-width, initial-scale=1', (Though Next.js usually adds this)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={sora.variable}>
      {/*
        Ensure there are NO spaces, newlines, or comments directly here.
        Next.js will automatically manage the <head> contents based on your metadata
        and its own requirements.
        If you absolutely need to add specific tags to the <head> here,
        do it carefully without extra whitespace around the <head> element itself.
        However, for most cases, relying on `metadata` is preferred.
      */}
      <body className={sora.className}>
        {children}
      </body>
    </html>
  );
}
