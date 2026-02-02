import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; 
import BackgroundParticles from "@/components/BackgroundParticles";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oyunİncele | Oyun Dünyasına Göz At",
  description: "En güncel oyun incelemeleri ve puanlamaları.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth"> 
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#020617] text-white overflow-x-hidden selection:bg-purple-500/30`}
      >
     
        <BackgroundParticles /> 

        <Navbar />
        
    
        <main className="min-h-screen pt-4 relative z-10"> 
          {children}
        </main>
      </body>
    </html>
  );
}