import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { Nav } from "@/components/nav";
import "./globals.css";

const plexThai = IBM_Plex_Sans_Thai({
  variable: "--font-plex-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ผังงาน Workload",
  description:
    "ผังงานรูปแบบ Organization chart แสดงภาระงานของพนักงานในแต่ละโปรเจค",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${plexThai.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Nav />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}
