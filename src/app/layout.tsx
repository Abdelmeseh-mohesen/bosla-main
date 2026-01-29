import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "@/styles/globals.css";
import Providers from "./providers";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo"
});

export const metadata: Metadata = {
  title: "المنصة التعليمية | Educational Platform",
  description: "Advanced Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${cairo.variable} font-sans antialiased bg-[#0b0c10] text-gray-100 min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
