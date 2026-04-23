import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DuckFitnessPal",
  description: "Macro tracking for Stevens dining — Pierce Dining Hall",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white font-sans antialiased pb-16">
        {children}
        <NavBar />
      </body>
    </html>
  );
}
