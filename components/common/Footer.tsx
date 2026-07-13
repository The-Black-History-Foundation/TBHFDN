"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { getWikiUrl } from "@/lib/wiki";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const wikiUrl = getWikiUrl();

  const footerLinks = {
    aboutUs: [
      { name: "Our Mission", path: "/about#mission" },
      { name: "Our Team", path: "/about#team" },
      { name: "History", path: "/about#history" },
      { name: "FAQs", path: "/about#faqs" },
    ],
    getInvolved: [
      { name: "Volunteer", path: "/volunteer" },
      { name: "Donate", path: "/donate" },
      ...(wikiUrl
        ? [{ name: "Research Wiki", path: wikiUrl, external: true as const }]
        : []),
    ],
    contact: [
      { name: "Contact Us", path: "/contact" },
      { name: "Newsletter", path: "/contact#newsletter" },
      { name: "Social Media", path: "/contact#social" },
    ],
  };

  return (
    <footer className="bg-[var(--accent-black)] text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/Logos/TBHF_Main_Text.png"
                width={256}
                height={256}
                alt="The Black History Foundation Logo - Preserving Black history and heritage"
                loading="lazy"
              />
            </Link>
            <p className="font-helvetica mb-6 text-gray-300 max-w-md">
              The Black History Foundation is dedicated to empowering the
              African diaspora by preserving and promoting African history,
              culture, and heritage.
            </p>
            <motion.div whileHover={{ y: -3 }} className="inline-block">
              <Link href="/donate" className="btn btn-secondary">
                Donate Now
              </Link>
            </motion.div>
          </div>

          {/* Three equal columns for links */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About Us Column */}
            <div>
              <h4 className="font-neue-kabel text-[var(--secondary)] mb-4">
                About Us
              </h4>
              <ul className="space-y-2">
                {footerLinks.aboutUs.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.path}
                      className="font-helvetica text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get Involved Column */}
            <div>
              <h4 className="font-neue-kabel text-[var(--secondary)] mb-4">
                Get Involved
              </h4>
              <ul className="space-y-2">
                {footerLinks.getInvolved.map((link) => (
                  <li key={link.name}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-helvetica text-gray-300 hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.path}
                        className="font-helvetica text-gray-300 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="font-neue-kabel text-[var(--secondary)] mb-4">
                Contact
              </h4>
              <ul className="space-y-2">
                {footerLinks.contact.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.path}
                      className="font-helvetica text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="font-helvetica text-sm text-gray-400 mb-4 md:mb-0">
            &copy; {currentYear} The Black History Foundation. All rights
            reserved.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link
              href="/privacy-policy"
              className="font-helvetica text-sm text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-use"
              className="font-helvetica text-sm text-gray-400 hover:text-white transition-colors"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
