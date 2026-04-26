import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { DarkModeProvider } from "@/components/DarkModeProvider";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DuckFitnessPal",
  description: "Macro tracking for Stevens dining — Pierce Dining Hall",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body
        className="min-h-full flex flex-col bg-white dark:bg-black font-sans antialiased pb-16"
        suppressHydrationWarning
      >
        <DarkModeProvider>
          {children}
          <NavBar />
        </DarkModeProvider>
      </body>
    </html>
  );
}
