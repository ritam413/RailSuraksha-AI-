// src/app/layout.tsx
import './globals.css';
import React from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'RailSuraksha AI — National Railway Safety & Incident Intelligence Platform',
  description: 'National-grade railway command center with AI multi-agent safety ecosystem and RDSO Kavach braking physics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#F0F6FC] text-[#0F172A] antialiased min-h-screen font-sans selection:bg-[#2B7FFF]/20 selection:text-[#0F172A]">
        {children}
      </body>
    </html>
  );
}

