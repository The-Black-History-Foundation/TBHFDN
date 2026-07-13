"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { getWikiUrl } from "@/lib/wiki";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const wikiUrl = getWikiUrl();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Educational", path: "/educational" },
    { name: "Volunteer", path: "/volunteer" },
    { name: "Contact", path: "/contact" },
    ...(wikiUrl
      ? [{ name: "Wiki", path: wikiUrl, external: true as const }]
      : []),
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--bg-primary)] bg-opacity-95 shadow-md py-2"
          : "backdrop-blur-md py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src={
              scrolled
                ? "/Logos/TBHF_Logo_Black.png"
                : "/Logos/TBHF_Main_Text.png"
            }
            width={200}
            height={200}
            loading="eager"
            priority={true}
            alt="The Black History Foundation Logo - Protecting and preserving Black history and heritage"
            className="transition-opacity duration-300"
          />
        </Link>

        <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
          <div className="flex items-center justify-center space-x-10">
            {navLinks.map((link) =>
              "external" in link && link.external ? (
                <a
                  key={link.name}
                  href={link.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative font-helvetica font-medium px-2 py-1"
                >
                  <span
                    className={`block transition-all duration-300 ease-in-out ${
                      scrolled ? "text-[var(--text-primary)]" : "text-white"
                    } group-hover:opacity-0`}
                  >
                    {link.name}
                  </span>
                  <span
                    className={`absolute top-0 left-0 right-0 px-2 py-1 block transition-all duration-300 ease-in-out
                  ${scrolled ? "text-[var(--primary)]" : "text-[var(--secondary)]"}
                  opacity-0 filter blur-none
                  group-hover:opacity-100 group-hover:filter group-hover:blur-[2px]
                  group-hover:scale-110`}
                  >
                    {link.name}
                  </span>
                </a>
              ) : (
                <Link
                  key={link.name}
                  href={link.path}
                  className="group relative font-helvetica font-medium px-2 py-1"
                >
                {/* Normal text that fades out on hover */}
                <span
                  className={`block transition-all duration-300 ease-in-out ${
                    scrolled ? "text-[var(--text-primary)]" : "text-white"
                  } ${pathname === link.path ? "text-[var(--primary)]" : ""}
                  group-hover:opacity-0`}
                >
                  {link.name}
                </span>

                {/* Blurred text that appears on hover with animation */}
                <span
                  className={`absolute top-0 left-0 right-0 px-2 py-1 block transition-all duration-300 ease-in-out
                  ${scrolled ? "text-[var(--primary)]" : "text-[var(--secondary)]"}
                  opacity-0 filter blur-none
                  group-hover:opacity-100 group-hover:filter group-hover:blur-[2px]
                  group-hover:scale-110`}
                >
                  {link.name}
                </span>
              </Link>
              )
            )}
          </div>
        </nav>

        <div className="hidden md:block">
          <Link
            href="/donate"
            className={`font-helvetica font-bold px-5 py-2 rounded-full transition-colors ${
              scrolled
                ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] hover:text-white"
                : "bg-[var(--secondary)] text-[var(--text-primary)] hover:bg-[var(--secondary-dark)]"
            }`}
          >
            Donate
          </Link>
        </div>

        <button
          className="md:hidden flex items-center p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <X
              size={24}
              className={scrolled ? "text-[var(--text-primary)]" : "text-white"}
            />
          ) : (
            <Menu
              size={24}
              className={scrolled ? "text-[var(--text-primary)]" : "text-white"}
            />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[var(--bg-primary)] shadow-lg overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navLinks.map((link) =>
                "external" in link && link.external ? (
                  <a
                    key={link.name}
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-helvetica text-[var(--text-primary)] hover:text-[var(--primary)] py-2 px-4 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    href={link.path}
                    className="font-helvetica text-[var(--text-primary)] hover:text-[var(--primary)] py-2 px-4 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                )
              )}
              <Link
                href="/donate"
                className="font-helvetica font-bold py-3 bg-[var(--primary)] text-white rounded-md text-center hover:bg-[var(--primary-dark)] transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Donate
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
