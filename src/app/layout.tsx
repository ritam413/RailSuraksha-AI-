// src/app/layout.tsx
import './globals.css';
import React from 'react';

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
    <html lang="en">
      <body className="bg-[#F0F6FC] text-[#0F172A] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
