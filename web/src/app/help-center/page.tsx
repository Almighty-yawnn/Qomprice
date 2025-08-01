// app/help-center/page.tsx
"use client";

import { useState, useMemo, Suspense } from "react";
import Head from "next/head"; // For Schema
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { faqData, faqCategories } from "@/lib/faqData"; // Adjust path as needed
import FaqItem from "@/components/help-center/FaqItem";     // Adjust path as needed
import { useSearchParams, useRouter } from "next/navigation";

// Helper component to manage search and category filtering from URL
function HelpCenterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialSearchQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "All";

  const [searchTerm, setSearchTerm] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    updateUrlParams(newSearchTerm, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    updateUrlParams(searchTerm, category);
  };

  const updateUrlParams = (query: string, category: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category && category !== "All") params.set("category", category);
    router.push(`/help-center?${params.toString()}`, { scroll: false });
  };


  const filteredFaqs = useMemo(() => {
    return faqData.filter((faq) => {
      const matchesCategory =
        selectedCategory === "All" || faq.category === selectedCategory;
      const matchesSearch =
        searchTerm.toLowerCase() === "" ||
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  // For FAQPage Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: filteredFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <Head>
        <title>Help Center | Komprice</title>
        <meta name="description" content="Find answers to frequently asked questions about Komprice." />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Head>

      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
          {/* Header and Search */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Help Center
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              How can we help you today?
            </p>
          </div>

          <div className="mb-10 max-w-2xl mx-auto">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="search"
                name="search"
                id="search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm sm:leading-6"
                placeholder="Search for answers..."
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mb-10 flex flex-wrap justify-center gap-2 sm:gap-3">
            {faqCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150
                  ${selectedCategory === category
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="divide-y divide-gray-900/10">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <FaqItem key={faq.id} faq={faq} />
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">
                No questions found matching your criteria. Try a different search or category.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


// Wrap with Suspense for useSearchParams
export default function HelpCenterPage() {
  return (
    <Suspense fallback={<div>Loading help center...</div>}>
      <HelpCenterContent />
    </Suspense>
  );
}