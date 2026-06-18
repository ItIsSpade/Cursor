import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: 'swap',
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "DESKED | Curated Workspace Bundles",
  description: "Elevate your setup with premium, hand-picked desktop and gaming bundles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${manrope.variable}`}>
      <body className="font-body antialiased selection:bg-accent selection:text-background flex flex-col min-h-screen">
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}
