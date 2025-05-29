// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Game Wiki Admin",
  description: "Admin panel for the game wiki",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-900 text-gray-100 min-h-screen`}>
        {children}
      </body>
      {/* Similarly, ensure NO WHITESPACE OR NEWLINES here, directly between 
        the closing '>' of the </body> tag and the opening '<' of the </html> tag.
      */}
    </html>
  );
}