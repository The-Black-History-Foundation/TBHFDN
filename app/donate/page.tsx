import Layout from "@/components/common/Layout";
import DonateHero from "@/components/donate/DonateHero";
import DonateImpact from "@/components/donate/DonateImpact";
import DonateForm from "@/components/donate/DonateForm";
import DonateVehicleSection from "@/components/donate/DonateVehicleSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donate | The Black History Foundation",
  description: "Support our mission to preserve Black history and culture for future generations through your generous donations to The Black History Foundation.",
  keywords: "donate to Black History Foundation, support Black culture, history preservation donation, Black education funding, cultural preservation",
  openGraph: {
    title: "Donate | The Black History Foundation",
    description: "Support our mission to preserve Black history and culture for future generations through your generous donations to The Black History Foundation.",
    url: "/donate",
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
    title: "Donate | The Black History Foundation",
    description: "Support our mission to preserve Black history and culture for future generations through your generous donations to The Black History Foundation.",
    images: ["/Logos/TBHF_Logo_Full Color.png"],
  },
};

export default function Donate() {
  return (
    <Layout>
      <DonateHero />
      <DonateImpact />
      <DonateVehicleSection />
      <DonateForm />
      <NewsletterSection />
    </Layout>
  );
}