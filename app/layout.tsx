import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import { Manrope, Source_Serif_4, JetBrains_Mono } from "next/font/google"

const fontSans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Screend — AI Resume Scans for Tech Jobs",
  description:
    "Upload your resume, get scored feedback for tech roles, accept line-level improvements, edit in the workbench, and export a polished PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorBackground: '#111113',
          colorInputBackground: '#18181b',
          colorInputText: '#fafafa',
          colorText: '#fafafa',
          colorTextSecondary: '#a1a1aa',
          colorPrimary: '#3b82f6',
          colorDanger: '#f87171',
          borderRadius: '0.5rem',
        },
        elements: {
          card: {
            background: '#111113',
            border: '0.5px solid #27272a',
            boxShadow: 'none',
          },
          rootBox: {
            width: '100%',
          },
        },
      }}
    >
      <html lang="en" className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
