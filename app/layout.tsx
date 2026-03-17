import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Screend — AI Resume Scans for Tech Jobs",
  description:
    "Upload your resume, get scored feedback for tech roles, accept line-level improvements, review a diff, and export a polished PDF or DOCX.",
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
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
