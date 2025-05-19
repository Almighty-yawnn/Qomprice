/* ----------------------------------------------------------------
 * Komprice – Home page with Dynamic Header & App Loader
 * - App loader on initial visit.
 * - Header is larger by default, shrinks and sticks on scroll.
 * - Gradient header background.
 * ----------------------------------------------------------------*/
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";
import ProductCard from "@/components/ui/ProductCard"; // Ensure this path is correct
import { searchProducts as originalSearchProducts } from "@/lib/api"; // Ensure this path is correct
import type { Product } from "@/types/product"; // Ensure this path is correct
import Link from "next/link";
import AppLoader from "@/components/ui/AppLoader"; // IMPORT THE LOADER

import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

// Define a type for category data
type Category = {
    label: string;
    slug: string;
};

// --- Mock Data & Constants ---
const MOCK_CATEGORIES: Category[] = [
    { label: "All Categories", slug: "" },
    { label: "Phones & Tablets", slug: "phones-tablets" },
    { label: "Laptops", slug: "laptops" },
    { label: "Fashion", slug: "fashion" },
    { label: "Home & Kitchen", slug: "home-kitchen" },
    { label: "Electronics", slug: "electronics" },
    { label: "Beauty", slug: "beauty" },
    { label: "Groceries", slug: "groceries" },
    { label: "Toys", slug: "toys" },
    { label: "Books", slug: "books" },
    { label: "Sports", slug: "sports" },
];

const POPULAR_CATEGORIES_SLUGS = ["", "phones-tablets", "laptops", "electronics"];
const PRODUCTS_PER_PAGE = 30;
const currentYear = new Date().getFullYear();
const SCROLL_THRESHOLD = 50; // Pixels to scroll before header shrinks

// --- Simulate API with Pagination Support ---
const searchProducts = async ({ q, category, limit, page }: { q: string; category?: string; limit: number; page: number }) => {
    console.log(`Simulating API search: q=${q}, category=${category}, limit=${limit}, page=${page}`);
    await new Promise(resolve => setTimeout(resolve, 700));
    const allResults = await originalSearchProducts({ q, category });
    const offset = (page - 1) * limit;
    const paginatedResults = allResults.slice(offset, offset + limit);
    const total = allResults.length;
    console.log(`API Simulation Results: Found ${allResults.length} total, returning ${paginatedResults.length} for page ${page}`);
    return {
        products: paginatedResults,
        total: total,
    };
};


export default function Home() {
  const [isLoadingApp, setIsLoadingApp] = useState(true); // State for app loader
  const [isScrolled, setIsScrolled] = useState(false);   // State for scroll detection for header

  const router = useRouter();
  const params = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false); // For product loading, distinct from initial app load
  const [error, setError] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const q = params.get("q") ?? "";
  const selectedCategorySlug = params.get("category") ?? "";
  const currentPage = Math.max(1, parseInt(params.get("page") ?? "1", 10));

  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const popularCategories = useMemo(() => {
    return MOCK_CATEGORIES.filter(cat => POPULAR_CATEGORIES_SLUGS.includes(cat.slug));
  }, []);

  // Effect for App Loader Timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingApp(false);
    }, 1500); // Loader visible for 1.5 seconds
    return () => clearTimeout(timer);
  }, []);

  // Effect for Header Scroll Detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect for Fetching Categories
  useEffect(() => {
      const fetchCategories = async () => {
        setCategoriesLoading(true);
          setTimeout(() => { // Simulate network delay
              setCategories(MOCK_CATEGORIES);
              setCategoriesLoading(false);
          }, 500);
      };
      fetchCategories();
  }, []);

  // Effect for Fetching Products
  useEffect(() => {
    // Don't fetch products if the initial app loader is still visible
    if (isLoadingApp) return;

    const fetchProductsData = async () => {
      setLoading(true);
      setError(null);
      setProducts([]);
      setTotalProducts(0);
      try {
        const results = await searchProducts({
            q,
            category: selectedCategorySlug,
            limit: PRODUCTS_PER_PAGE,
            page: currentPage,
        });
        setProducts(results.products);
        setTotalProducts(results.total);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        console.error("❌ Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductsData();
  }, [q, selectedCategorySlug, currentPage, isLoadingApp]); // Added isLoadingApp dependency

  // Effect for Modal Click Outside
  useEffect(() => {
    const handleMousedown = (event: MouseEvent) => {
      if (
        modalContentRef.current && !modalContentRef.current.contains(event.target as Node) &&
        moreButtonRef.current && !moreButtonRef.current.contains(event.target as Node)
      ) {
        setIsCategoryModalOpen(false);
      }
    };
    if (isCategoryModalOpen) {
      document.addEventListener('mousedown', handleMousedown);
    }
    return () => {
      document.removeEventListener('mousedown', handleMousedown);
    };
  }, [isCategoryModalOpen]);


  // --- Handlers ---
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get("q")?.toString() ?? "";
    const currentParams = new URLSearchParams(params.toString());
    if (searchQuery) currentParams.set("q", searchQuery);
    else currentParams.delete("q");
    currentParams.delete("page"); // Reset page on new search
    router.replace(`/?${currentParams.toString()}`);
  };

  const handleCategorySelect = (slug: string) => {
      const currentParams = new URLSearchParams(params.toString());
      if (slug) currentParams.set("category", slug);
      else currentParams.delete("category");
      currentParams.delete("page"); // Reset page on category change
      router.push(`/?${currentParams.toString()}`);
      setIsCategoryModalOpen(false);
  };

  const handlePageChange = (page: number) => {
      if (page < 1) return;
      const calculatedTotalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
      if (page > calculatedTotalPages && calculatedTotalPages > 0) return;
      const currentParams = new URLSearchParams(params.toString());
      currentParams.set("page", page.toString());
      router.push(`/?${currentParams.toString()}`);
  };

  // --- Pagination Calculation ---
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages || totalProducts === 0;

  const generatePageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;
    const halfMaxPages = Math.floor(maxPagesToShow / 2);
    if (totalPages <= maxPagesToShow + 2) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      let startPage = Math.max(2, currentPage - halfMaxPages);
      let endPage = Math.min(totalPages - 1, currentPage + halfMaxPages);
      if (currentPage - halfMaxPages <= 2) endPage = Math.min(totalPages -1, maxPagesToShow);
      if (currentPage + halfMaxPages >= totalPages - 1) startPage = Math.max(2, totalPages - maxPagesToShow + 1);
      if (startPage > 2) pageNumbers.push('...');
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (endPage < totalPages - 1) pageNumbers.push('...');
      if (totalPages > 1) pageNumbers.push(totalPages);
    }
    return pageNumbers.filter((item, index, self) => !(item === '...' && self[index -1] === '...'));
  };

  // --- Conditional Rendering for App Loader ---
  if (isLoadingApp) {
    return <AppLoader />;
  }

  // --- Main Page Content ---
  return (
    <main className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      {/* ====== DYNAMIC HEADER ====== */}
      <header
        className={`bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-gray-100
                   sticky top-0 z-50 shadow-lg rounded-b-2xl transition-all duration-300 ease-in-out`}
      >
        {/* Top bar */}
        <div
          className={`flex items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto transition-all duration-300 ease-in-out ${
            isScrolled ? 'py-2.5' : 'py-4'
          }`}
        >
          <h1
            className={`font-bold tracking-tight transition-all duration-300 ease-in-out ${
              isScrolled ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
            }`}
          >
            <Link href="/" className="hover:text-white">Komprice</Link>
          </h1>
          <nav
            className={`hidden md:flex transition-all duration-300 ease-in-out ${
              isScrolled ? 'gap-6 text-xs sm:text-sm' : 'gap-8 text-sm'
            }`}
          >
            <Link href="/compare" className="hover:underline hover:text-white">Compare</Link>
            <Link href="/about" className="hover:underline hover:text-white">About</Link>
          </nav>
        </div>

        {/* Search bar area */}
        <div
          className={`px-4 sm:px-6 mx-auto transition-all duration-300 ease-in-out ${
            isScrolled ? 'pb-3 max-w-3xl' : 'pb-8 max-w-4xl'
          }`}
        >
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder={isScrolled ? "Search..." : "Search for products, deals, or stores..."}
              className={`w-full border rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300 ease-in-out placeholder-gray-500 text-gray-900 border-gray-300 ${
                isScrolled ? 'pl-3 pr-12 py-2 text-sm' : 'pl-4 pr-16 py-3 text-base'
              }`}
            />
            <button
              type="submit"
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-yellow-400 hover:bg-yellow-500 text-emerald-900 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                isScrolled ? 'h-8 w-8 sm:h-9 sm:w-9 hover:scale-105' : 'h-10 w-10 sm:h-12 sm:w-12 hover:scale-110'
              }`}
              aria-label="Search"
            >
                <MagnifyingGlassIcon
                  className={`transition-all duration-300 ease-in-out stroke-[2.5] ${
                    isScrolled ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-5 w-5 sm:h-6 sm:w-6'
                  }`}
                />
            </button>
          </form>
          <div
            className={`flex flex-wrap justify-center transition-all duration-300 ease-in-out ${
              isScrolled ? 'gap-1.5 sm:gap-2 mt-2.5' : 'gap-2 mt-6'
            }`}
          >
            {popularCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategorySelect(cat.slug)}
                className={`font-medium rounded-full transition-all duration-300 ease-in-out ${
                  selectedCategorySlug === cat.slug ? "bg-amber-300 text-amber-900 shadow-sm" : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                } ${isScrolled ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs sm:text-sm'}`}
              >
                {cat.label}
              </button>
            ))}
            <button
              type="button"
              ref={moreButtonRef}
              onClick={() => setIsCategoryModalOpen(true)}
              className={`font-medium rounded-full transition-all duration-300 ease-in-out flex items-center gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200 ${
                isScrolled ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs sm:text-sm'
              }`}
              aria-label="More categories"
            >
              <span>More</span>
              <ChevronDownIcon
                className={`transition-all duration-300 ease-in-out stroke-[2.5] text-amber-600 ${
                  isScrolled ? 'h-3 w-3' : 'h-3 w-3 sm:h-4 sm:w-4'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ====== MAIN CONTENT AREA ====== */}
      <div className="flex-grow">
        {/* Category Modal */}
        {isCategoryModalOpen && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6" // Ensure modal is above sticky header
            aria-modal="true"
            role="dialog"
            aria-labelledby="categories-modal-title"
          >
            <div
              className="absolute inset-0 bg-black/60 transition-opacity duration-300 ease-in-out"
              aria-hidden="true"
              onClick={() => setIsCategoryModalOpen(false)}
            />
            <div
              ref={modalContentRef}
              className="relative bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto p-6 transform transition-transform duration-300 ease-in-out"
            >
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h2 id="categories-modal-title" className="text-xl font-bold text-gray-800">All Categories</h2>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  aria-label="Close categories modal"
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              {categoriesLoading ? (
                  <div className="flex justify-center py-8">
                      <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
              ) : (
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat.slug}>
                      <button
                        onClick={() => handleCategorySelect(cat.slug)}
                        className={`block w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${selectedCategorySlug === cat.slug ? "bg-emerald-100 text-emerald-700 font-semibold" : "text-gray-700 hover:bg-gray-100"}`}
                      >
                        {cat.label}
                      </button>
                    </li>
                  ))}
                </ul>
             )}
            </div>
          </div>
        )}

        {/* Product Grid Section */}
        <section className="px-4 sm:px-6 py-12 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-16">
               <ArrowPathIcon className="h-10 w-10 animate-spin text-emerald-500" />
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md mx-auto" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          ) : products.length === 0 && totalProducts === 0 && !q && !selectedCategorySlug ? ( // Show only if no search/filter active
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 mb-4">Welcome to Komprice!</p>
              <p className="text-gray-500 text-sm">Use the search bar or categories to find products.</p>
            </div>
          ): products.length === 0 && totalProducts === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 mb-4">No products found.</p>
              <p className="text-gray-500 text-sm">Try a different search term or category.</p>
            </div>
          ) : (
            <>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                 {products.map((p, i) => {
                   try {
                     return <ProductCard key={p.id || `product-${i}`} product={p} />;
                   } catch (err) {
                     console.error(`❌ Error rendering product[${i}]`, p, err);
                     return (
                       <div className="bg-red-50 text-red-700 text-sm p-3 rounded shadow-sm" key={`error-${i}`}>
                         Error loading product details.
                       </div>
                     );
                   }
                 })}
               </div>

               {/* PAGINATION CONTROLS */}
               {totalProducts > 0 && totalPages > 1 && (
                   <div className="mt-10 text-center">
                       <div className="flex justify-center items-center space-x-2 mb-3">
                           <button
                               onClick={() => handlePageChange(currentPage - 1)}
                               disabled={isFirstPage || loading}
                               className={`p-2 border rounded-md text-sm font-medium flex items-center justify-center ${isFirstPage || loading ? "text-gray-400 border-gray-200 cursor-not-allowed" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                               aria-label="Previous page"
                           >
                               <ChevronLeftIcon className="h-5 w-5" />
                               <span className="hidden sm:inline ml-1">Prev</span>
                           </button>
                           <button
                               onClick={() => handlePageChange(currentPage + 1)}
                               disabled={isLastPage || loading}
                               className={`p-2 border rounded-md text-sm font-medium flex items-center justify-center ${isLastPage || loading ? "text-gray-400 border-gray-200 cursor-not-allowed" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                               aria-label="Next page"
                           >
                               <span className="hidden sm:inline mr-1">Next</span>
                               <ChevronRightIcon className="h-5 w-5" />
                           </button>
                       </div>
                       <div className="flex justify-center items-center space-x-1 mt-2">
                           {generatePageNumbers().map((page, index) =>
                               typeof page === 'number' ? (
                                   <button
                                       key={`page-${page}`}
                                       onClick={() => handlePageChange(page)}
                                       disabled={page === currentPage || loading}
                                       className={`min-w-[36px] h-9 px-2 py-1 border rounded-md text-sm font-medium flex items-center justify-center transition-colors duration-150 ${page === currentPage ? "bg-emerald-600 text-white border-emerald-600 cursor-default" : loading ? "text-gray-400 border-gray-200 cursor-not-allowed" : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"}`}
                                       aria-current={page === currentPage ? "page" : undefined}
                                   >
                                       {page}
                                   </button>
                               ) : (
                                   <span
                                       key={`ellipsis-${index}`}
                                       className="px-2 py-1 text-gray-500 text-sm flex items-center justify-center h-9"
                                   >
                                       ...
                                   </span>
                               )
                           )}
                       </div>
                       <div className="text-gray-600 text-xs mt-3">
                           Page {currentPage} of {totalPages}
                       </div>
                   </div>
               )}
               {products.length === 0 && totalProducts > 0 && ( // Show if no products on current page, but products exist in total
                   <div className="text-center py-8">
                      <p className="text-lg text-gray-600">No products found on this page.</p>
                   </div>
               )}
            </>
          )}
        </section>
      </div>

      {/* ====== FOOTER ====== */}
      <footer className="bg-gray-800 text-gray-300 pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm mb-8">
            <div>
              <h4 className="font-bold text-white mb-3">Contact us</h4>
              <a href="mailto:support@komprice.com" className="hover:text-white cursor-pointer">
                support@komprice.com
              </a>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Explore</h4>
              <p><Link href="/compare" className="hover:text-white transition-colors">Compare Prices</Link></p>
              <p><Link href="/products/popular" className="hover:text-white transition-colors">Popular Products</Link></p>
              <p><Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link></p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-3">Support</h4>
              <p><Link href="/help-center#faqs" className="hover:text-white transition-colors">FAQs</Link></p>
              <p>
                <Link href="/help-center" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-xs">
              <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2 mb-4 md:mb-0">
                <Link href="/terms-of-use" className="hover:text-white transition-colors">Terms of Use</Link>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
                <Link href="/accessibility-statement" className="hover:text-white transition-colors">Accessibility</Link>
              </div>
              <p className="text-gray-400 text-center md:text-right">
                &copy; {currentYear} Komprice. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}