import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import DynamicFavicon from "@/components/DynamicFavicon";
import { SessionProvider } from "@/components/auth/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "TheoLingua - Theological English Education Excellence",
    template: "%s | TheoLingua"
  },
  description: "Equipping theology students and ministers with essential English skills for reading, understanding, and discussing theological texts. Specialized training for academic excellence and ministry effectiveness.",
  keywords: ["theological education", "theological English", "seminary training", "biblical communication", "ministry English", "theological writing"],
  authors: [{ name: "TheoLingua" }],
  creator: "TheoLingua",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://theolingua.com",
    title: "TheoLingua - Theological English Education Excellence",
    description: "Specialized training programs for theology students focusing on English communication skills and academic development.",
    siteName: "TheoLingua",
  },
  twitter: {
    card: "summary_large_image",
    title: "TheoLingua - Theological English Education Excellence",
    description: "Specialized training programs for theology students focusing on English communication skills and academic development.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TheoLingua"
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#3b82f6" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        
        {/* Font Awesome CDN */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-body antialiased min-h-screen flex flex-col bg-white text-gray-900`}>
        <SessionProvider>
          <DynamicFavicon />
          <main className="flex-1">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
