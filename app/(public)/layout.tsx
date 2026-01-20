import type { Metadata, Viewport } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";


export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "TheoLingua - Bible-Based English Learning",
    template: "%s | TheoLingua"
  },
  description: "A Bible-based and theology-focused English curriculum for theological students in India. Integrating biblical texts and Christian literature to enhance language skills while deepening understanding of the Bible.",
  keywords: ["theological education", "Bible-based English", "Christian education", "seminary training", "theological English", "ministry communication", "biblical literature", "English for theology students"],
  authors: [{ name: "TheoLingua" }],
  creator: "TheoLingua",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://theolingua.com",
    title: "TheoLingua - Bible-Based English Learning",
    description: "Bible-based and theology-focused English curriculum for theological students in India.",
    siteName: "TheoLingua",
  },
  twitter: {
    card: "summary_large_image",
    title: "TheoLingua - Bible-Based English Learning",
    description: "Bible-based and theology-focused English curriculum for theological students in India.",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TheoLingua"
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </>
  );
}
