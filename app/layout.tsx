import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const vazir = localFont({
  src: [
    {
      path: "../node_modules/vazirmatn/fonts/webfonts/Vazirmatn-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../node_modules/vazirmatn/fonts/webfonts/Vazirmatn-ExtraLight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../node_modules/vazirmatn/fonts/webfonts/Vazirmatn-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../node_modules/vazirmatn/fonts/webfonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/vazirmatn/fonts/webfonts/Vazirmatn-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../node_modules/vazirmatn/fonts/webfonts/Vazirmatn-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../node_modules/vazirmatn/fonts/webfonts/Vazirmatn-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../node_modules/vazirmatn/fonts/webfonts/Vazirmatn-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../node_modules/vazirmatn/fonts/webfonts/Vazirmatn-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-vazir",
  display: "swap",
});

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "پنل مدیریت SmartClass",
  description: "مدیریت و برنامه‌ریزی سیستم‌های تعبیه‌شده",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazir.variable} ${dmSans.variable}`}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-vazir antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
