import Layout from "@/components/common/Layout";
import EducationalHero from "@/components/educational/EducationalHero";
import EducationalResources from "@/components/educational/EducationalResources";
import NewsletterSection from "@/components/home/NewsletterSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Educational Resources | The Black History Foundation",
  description: "Access free educational resources, videos, and documents about Black history preservation and education. Download materials for educators, students, and community leaders from The Black History Foundation.",
  keywords: "Black history education, educational resources, Black history documents, Black history videos, history preservation, nonprofit chatbot, AI in education, Black history teaching materials, downloadable resources, cultural preservation",
  openGraph: {
    title: "Educational Resources | The Black History Foundation",
    description: "Access free educational resources, videos, and documents about Black history preservation and education. Download materials for educators, students, and community leaders from The Black History Foundation.",
    url: "/educational",
    siteName: "The Black History Foundation",
    images: [
      {
        url: "/Logos/TBHF_Logo_Full Color.png",
        width: 1200,
        height: 630,
        alt: "The Black History Foundation Logo"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Educational Resources | The Black History Foundation",
    description: "Access free educational resources, videos, and documents about Black history preservation and education. Download materials for educators, students, and community leaders.",
    images: ["/Logos/TBHF_Logo_Full Color.png"],
  },
  alternates: {
    canonical: "https://theblackhistoryfoundation.org/educational",
  },
  authors: [{ name: "The Black History Foundation" }],
  category: "Education",
};

export default function Educational() {
  return (
    <Layout>
      <EducationalHero />
      <EducationalResources />
      <NewsletterSection />
    </Layout>
  );
}
