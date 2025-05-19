// lib/faqData.ts
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

export const faqData: FAQ[] = [
  {
    id: "q1",
    question: "How do I reset my password?",
    answer:
      "To reset your password, go to the login page and click on the 'Forgot Password' link. Follow the instructions sent to your email address. If you don't receive an email, please check your spam folder or contact support.",
    category: "Account Management",
    keywords: ["password", "reset", "forgot", "account", "login"],
  },
  {
    id: "q2",
    question: "What payment methods do you accept?",
    answer:
      "We accept Visa, MasterCard, American Express, and PayPal. For some regions, local payment methods may also be available. You can see all available options at checkout.",
    category: "Billing",
    keywords: ["payment", "billing", "credit card", "paypal", "checkout"],
  },
  {
    id: "q3",
    question: "How can I track my order?",
    answer:
      "Once your order is shipped, you will receive an email with a tracking number and a link to the carrier's website. You can also find tracking information in your order history on your account page.",
    category: "Orders",
    keywords: ["track", "order", "shipping", "delivery", "status"],
  },
  {
    id: "q4",
    question: "What is your return policy?",
    answer:
      "We offer a 30-day return policy for most items. Items must be in new, unused condition with original packaging. Some exclusions apply. Please visit our 'Returns & Exchanges' page for full details.",
    category: "Returns & Exchanges",
    keywords: ["return", "exchange", "refund", "policy"],
  },
  {
    id: "q5",
    question: "How do I update my account information?",
    answer:
      "You can update your account information, such as your shipping address or email, by logging into your account and navigating to the 'Account Settings' or 'Profile' section.",
    category: "Account Management",
    keywords: ["update", "account", "profile", "address", "email"],
  },
  {
    id: "q6",
    question: "Do you offer international shipping?",
    answer:
      "Yes, we ship to many countries worldwide. Shipping costs and delivery times vary by destination. You can get an estimate during checkout or by contacting our support team.",
    category: "Orders",
    keywords: ["international", "shipping", "worldwide", "delivery"],
  },
  {
    id: "q7",
    question: "How do I contact customer support?",
    answer:
      "You can contact our customer support team via email at support@example.com, by phone at 1-800-KOMPRICE, or through our live chat service available on our website during business hours.",
    category: "Support",
    keywords: ["contact", "support", "customer service", "help", "phone", "email", "chat"],
  },
  {
    id: "q8",
    question: "My discount code isn't working. What should I do?",
    answer:
      "Please ensure your discount code is entered correctly and hasn't expired. Some codes are case-sensitive or have specific terms and conditions (e.g., for new customers only, minimum spend). If it still doesn't work, contact support for assistance.",
    category: "Billing",
    keywords: ["discount", "coupon", "promo code", "offer", "billing"],
  }
];

export const faqCategories = [
    "All",
    ...new Set(faqData.map(faq => faq.category))
];