import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { PageTransition } from "@/components/Motion";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pungo - Dein Finanz-Dashboard",
  description:
    "Plane deine Finanzen basierend auf deiner aktuellen Lebensphase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning className="h-auto overflow-y-auto">
      <head suppressHydrationWarning>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} ${dmMono.variable} antialiased min-h-screen bg-background text-text-primary`}
      >
        <div className="flex flex-col min-h-screen">
          <PageTransition>{children}</PageTransition>
        </div>
      </body>
    </html>
  );
}
