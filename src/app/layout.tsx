import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RapidMVP - Build Your MVP in Minutes",
  description: "Build production-ready MVPs in minutes with AI. From idea to deployment, faster than ever. Describe what you want to build and watch RapidMVP generate production-ready code.",
  keywords: ["MVP", "AI", "code generation", "startup", "prototype", "Next.js", "React"],
  authors: [{ name: "RapidMVP" }],
  openGraph: {
    title: "RapidMVP - Build Your MVP in Minutes",
    description: "Build production-ready MVPs in minutes with AI. From idea to deployment, faster than ever.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
