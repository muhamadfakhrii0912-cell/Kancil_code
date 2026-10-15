import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KancilCode - Petualangan Logika & AI Mentor Ramah Anak",
  description:
    "Platform edukasi berpikir komputasional dan coding visual blok untuk siswa SD berbasis fabel Nusantara dan Socratic AI mentor.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col font-body bg-[#F8FAF7] text-[#1A2E26]">
        {children}
      </body>
    </html>
  );
}
