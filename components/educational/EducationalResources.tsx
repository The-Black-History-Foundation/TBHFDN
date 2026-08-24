"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  DEFAULT_COMING_SOON_CARDS,
  type ComingSoonCard,
  type ComingSoonCardIcon,
} from "@/lib/coming-soon-cards";
import { getWikiUrl } from "@/lib/wiki";

const ICON_SVGS: Record<ComingSoonCardIcon, React.ReactNode> = {
  book: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  ),
  video: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  ),
  archive: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    />
  ),
  blockchain: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m0 0l-8-4v8l8 4 8-4V7zm0-6v4l8 4 8-4V1l-8-4-8 4z"
    />
  ),
  default: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  ),
};

const EducationalResources = () => {
  const [activeTab, setActiveTab] = useState<"videos" | "documents">("videos");
  const [comingSoonCards, setComingSoonCards] = useState<
    (ComingSoonCard & { id?: string })[]
  >(DEFAULT_COMING_SOON_CARDS.map((c, i) => ({ ...c, id: `default-${i}` })));
  const wikiUrl = getWikiUrl();

  useEffect(() => {
    const fetchCards = async () => {
      if (!db) {
        setComingSoonCards(DEFAULT_COMING_SOON_CARDS);
        return;
      }
      try {
        const q = query(
          collection(db, "comingSoonCards"),
          orderBy("order", "asc")
        );
        const snapshot = await getDocs(q);
        const cards = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...(data as Omit<ComingSoonCard, "id">),
            order: data.order ?? 0,
          };
        });
        if (cards.length > 0) {
          setComingSoonCards(cards);
        }
      } catch {
        setComingSoonCards(DEFAULT_COMING_SOON_CARDS);
      }
    };
    fetchCards();
  }, []);

  return (
    <>
    <section id="resources" className="py-20 bg-[var(--bg-secondary)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-primary)]">
            Educational Resources
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto mb-4">
            Access our collection of educational materials to learn more about Black history preservation and education.
          </p>
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-10">
            <h3 className="text-xl font-semibold mb-3 text-[var(--primary)]">About Our Resources</h3>
            <p className="text-[var(--text-secondary)] mb-3">
              The educational materials featured on this page are carefully selected to support our mission of preserving Black history. 
              These resources are designed for educators, students, community leaders, and anyone interested in learning about 
              and contributing to the preservation of Black historical narratives.
            </p>
            <p className="text-[var(--text-secondary)]">
              Our current collection includes a comprehensive guide for creating unbiased AI chatbots for nonprofit organizations.
              We regularly update our resources to provide the most relevant and impactful educational tools.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "videos"
                  ? "bg-[var(--primary)] text-white"
                  : "text-gray-600 hover:text-[var(--primary)]"
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "documents"
                  ? "bg-[var(--primary)] text-white"
                  : "text-gray-600 hover:text-[var(--primary)]"
              }`}
            >
              Documents
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-5xl mx-auto">
          {/* Videos Tab */}
          {activeTab === "videos" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6 text-center py-12">
                <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">
                  Videos coming soon
                </h3>
                <p className="text-gray-600 max-w-lg mx-auto">
                  We&apos;re preparing new educational videos. Check back soon, or explore our documents tab for downloadable resources.
                </p>
              </div>
            </motion.div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[var(--primary)] bg-opacity-10">
                        <Image
                          src="/file.svg"
                          alt="PDF Document"
                          width={24}
                          height={24}
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Nonprofit Chatbot Debiasing Template Kit</h3>
                      <p className="text-gray-600 mb-4">
                        A comprehensive guide for creating unbiased AI chatbots for nonprofit organizations focused on Black history education.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <a
                          href="/docs/nonprofit_chatbot_debiasing_template_kit.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-[var(--primary)] hover:text-[var(--primary-dark)] font-medium"
                        >
                          <span>View Document</span>
                          <svg
                            className="ml-2 w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                        <a
                          href="/docs/nonprofit_chatbot_debiasing_template_kit.pdf"
                          download
                          className="inline-flex items-center bg-[var(--primary)] text-white px-3 py-1 rounded-md hover:bg-[var(--primary-dark)] transition-colors"
                        >
                          <svg 
                            className="w-4 h-4 mr-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download PDF
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {wikiUrl && (
          <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
            <h3 className="text-2xl font-bold mb-3 text-[var(--text-primary)]">
              Community Research Wiki
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Explore and contribute to our community-built archive of Black
              history research — biographies, places, events, and sources.
            </p>
            <a
              href={wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-[var(--primary)] text-white px-6 py-3 rounded-md hover:bg-[var(--primary-dark)] transition-colors font-medium"
            >
              Visit the Research Wiki
            </a>
          </div>
        )}
      </div>
    </section>

    {/* Coming Soon Section */}
    <section className="py-16 bg-[var(--bg-primary)]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 text-[var(--text-primary)]">Coming Soon</h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-3xl mx-auto">
            We're constantly developing new educational resources to support our mission of preserving and promoting Black history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {comingSoonCards.map((card, index) => (
            <div
              key={card.id ?? `card-${index}`}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 opacity-75 hover:opacity-100 transition-opacity"
            >
              <div className="p-6">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[var(--primary)] bg-opacity-10 mb-4">
                  <svg
                    className="w-6 h-6 text-[var(--primary)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {ICON_SVGS[card.icon ?? "default"]}
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)]">
                  {card.title}
                </h3>
                <p className="text-[var(--text-secondary)] mb-4">
                  {card.description}
                </p>
                <p className="text-sm text-gray-500 italic">
                  {card.expectedTimeframe ?? "Coming Soon"}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-[var(--text-secondary)] italic">
            Have suggestions for educational resources? <a href="/contact" className="text-[var(--primary)] hover:underline">Contact us</a> with your ideas.
          </p>
        </div>
      </div>
    </section>
    </>
  );
};

export default EducationalResources;
