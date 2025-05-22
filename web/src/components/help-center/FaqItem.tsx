// components/help-center/FaqItem.tsx
"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import type { FAQ } from "@/lib/faqData"; // Adjust path as needed

interface FaqItemProps {
  faq: FAQ;
}

export default function FaqItem({ faq }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-6">
      <dt>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-start justify-between text-left text-gray-900"
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${faq.id}`}
        >
          <span className="text-base font-semibold leading-7">{faq.question}</span>
          <span className="ml-6 flex h-7 items-center">
            {isOpen ? (
              <ChevronUpIcon className="h-6 w-6" aria-hidden="true" />
            ) : (
              <ChevronDownIcon className="h-6 w-6" aria-hidden="true" />
            )}
          </span>
        </button>
      </dt>
      {isOpen && (
        <dd className="mt-2 pr-12" id={`faq-answer-${faq.id}`}>
          <p className="text-base leading-7 text-gray-600">{faq.answer}</p>
        </dd>
      )}
    </div>
  );
}