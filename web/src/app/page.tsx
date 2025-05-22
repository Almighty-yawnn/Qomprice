/* ----------------------------------------------------------------
 * Komprice – Home page with All Features
 * - App Loader
 * - Live Search
 * - Dynamic Animated Gradient Header (shrinks on scroll)
 * - "More" Button: Dropdown on Hover, Full Modal on Click
 * - Selectable Products Per Page
 * - Scroll-to-Top Button
 * - Modernized Footer
 * ----------------------------------------------------------------*/
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef, useCallback, ChangeEvent } from "react";
import ProductCard from "@/components/ui/ProductCard"; // Adjust path if needed
import { searchProducts as originalSearchProducts } from "@/lib/api"; // Adjust path if needed
import type { Product } from "@/types/product"; // Adjust path if needed
import Link from "next/link";
import AppLoader from "@/components/ui/AppLoader"; // Adjust path if needed
import CategoryDropdown from "@/components/ui/CategoryDropdown"; // Adjust path if needed

import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";

// Define a type for category data (can also be imported from types/product.ts)
interface Category {
    label: string;
    slug: string;
}

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
const PER_PAGE_OPTIONS = [10, 20, 30, 50, 100];
const DEFAULT_PRODUCTS_PER_PAGE = 30;

const currentYear = new Date().getFullYear();
const HEADER_SCROLL_THRESHOLD = 50;
const SCROLL_TO_TOP_THRESHOLD = 300;
const DEBOUNCE_DELAY = 400;
const DROPDOWN_CLOSE_DELAY = 200;

// --- Simulate API with Pagination Support ---
const searchProducts = async ({ q, category, limit, page }: { q: string; category?: string; limit: number; page: number }) => {
    console.log(`(Live Search) Simulating API search: q=${q}, category=${category}, limit=${limit}, page=${page}`);
    await new Promise(resolve => setTimeout(resolve, 700));
    const allResults = await originalSearchProducts({ q, category }); // Assumes originalSearchProducts can handle q and category
    const offset = (page - 1) * limit;
    const paginatedResults = allResults.slice(offset, offset + limit);
    const total = allResults.length;
    return {
        products: paginatedResults,
        total: total,
    };
};


export default function Home() {
  const router = useRouter();
  const params = useSearchParams();

  // Memoized initial values from URL
  const initialQueryFromUrl = useMemo(() => params.get("q") ?? "", [params]);
  const initialCategoryFromUrl = useMemo(() => params.get("category") ?? "", [params]);
  const initialPageFromUrl = useMemo(() => Math.max(1, parseInt(params.get("page") ?? "1", 10)), [params]);
  const initialLimitFromUrl = useMemo(() => {
    const limitStr = params.get("limit");
    if (limitStr) {
      const limitNum = parseInt(limitStr, 10);
      if (PER_PAGE_OPTIONS.includes(limitNum)) return limitNum;
    }
    return DEFAULT_PRODUCTS_PER_PAGE;
  }, [params]);

  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);

  const [searchInput, setSearchInput] = useState(initialQueryFromUrl);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialQueryFromUrl);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategorySlug, setSelectedCategorySlug] = useState(initialCategoryFromUrl);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [categoriesLoading] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryDropdownVisible, setIsCategoryDropdownVisible] = useState(false);

  const currentLimit = initialLimitFromUrl;
  const currentPage = initialPageFromUrl;

  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const dropdownHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const popularCategories = useMemo(() => {
    return MOCK_CATEGORIES.filter(cat => POPULAR_CATEGORIES_SLUGS.includes(cat.slug));
  }, []);

  // --- Full-Screen Modal Handlers ---
  const openFullScreenModal = useCallback(() => {
    setIsCategoryDropdownVisible(false);
    setIsCategoryModalOpen(true);
  }, []);

  const closeFullScreenModal = useCallback(() => {
    setIsCategoryModalOpen(false);
  }, []);

  // --- Dropdown Visibility Handlers ---
  const handleDropdownContainerMouseEnter = () => {
    if (dropdownHoverTimeoutRef.current) {
      clearTimeout(dropdownHoverTimeoutRef.current);
      dropdownHoverTimeoutRef.current = null;
    }
    setIsCategoryDropdownVisible(true);
  };

  const handleDropdownContainerMouseLeave = () => {
    dropdownHoverTimeoutRef.current = setTimeout(() => {
      setIsCategoryDropdownVisible(false);
    }, DROPDOWN_CLOSE_DELAY);
  };

  // --- Core Effects ---
  useEffect(() => { // App Loader Timeout
    const timer = setTimeout(() => setIsLoadingApp(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { // Scroll Detection
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > HEADER_SCROLL_THRESHOLD);
      setShowScrollToTopButton(currentScrollY > SCROLL_TO_TOP_THRESHOLD);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { // Fetching Categories
      // setCategoriesLoading(true); // If fetching async
      // setTimeout(() => { setCategories(MOCK_CATEGORIES); setCategoriesLoading(false); }, 50);
  }, []);

  useEffect(() => { // Debounce search input
    const timerId = setTimeout(() => setDebouncedSearchTerm(searchInput), DEBOUNCE_DELAY);
    return () => clearTimeout(timerId);
  }, [searchInput]);

  useEffect(() => { // Update URL on debounced search/category/limit change
    const currentQ = params.get("q") ?? "";
    const currentCategory = params.get("category") ?? "";
    const currentLimitParam = params.get("limit") ?? DEFAULT_PRODUCTS_PER_PAGE.toString();

    if (debouncedSearchTerm !== currentQ || selectedCategorySlug !== currentCategory || currentLimit.toString() !== currentLimitParam) {
      const newParams = new URLSearchParams();
      if (debouncedSearchTerm) newParams.set("q", debouncedSearchTerm);
      if (selectedCategorySlug) newParams.set("category", selectedCategorySlug);
      newParams.set("limit", currentLimit.toString());
      // Page is implicitly reset to 1 by not including 'page' if search, category, or limit changed
      router.replace(`/?${newParams.toString()}`, { scroll: false });
    }
  }, [debouncedSearchTerm, selectedCategorySlug, currentLimit, router, params]);

  useEffect(() => { // Fetching Products
    if (isLoadingApp) return;
    const fetchProductsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await searchProducts({ q: debouncedSearchTerm, category: selectedCategorySlug, limit: currentLimit, page: currentPage });
        setProducts(results.products);
        setTotalProducts(results.total);
      } catch (err) { setError("Failed to load products. Please try again later."); console.error("❌ Error loading products:", err); }
      finally { setLoading(false); }
    };
    fetchProductsData();
  }, [debouncedSearchTerm, selectedCategorySlug, currentPage, currentLimit, isLoadingApp]);

  useEffect(() => { // Sync local input states with URL params
    setSearchInput(initialQueryFromUrl);
    setSelectedCategorySlug(initialCategoryFromUrl);
    // currentLimit is already derived via initialLimitFromUrl which depends on params
  }, [initialQueryFromUrl, initialCategoryFromUrl]);

  useEffect(() => { // Full-Screen Modal: Click Outside and Escape Key
    const handleMousedown = (event: MouseEvent) => {
      if (isCategoryModalOpen && modalContentRef.current && !modalContentRef.current.contains(event.target as Node) &&
          moreButtonRef.current && !moreButtonRef.current.contains(event.target as Node)) {
        closeFullScreenModal();
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isCategoryModalOpen) {
        closeFullScreenModal();
      }
    };
    if (isCategoryModalOpen) {
      document.addEventListener('mousedown', handleMousedown);
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleMousedown);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isCategoryModalOpen, closeFullScreenModal]);

  // --- Handlers ---
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => setSearchInput(event.target.value);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDebouncedSearchTerm(searchInput);
    const newParams = new URLSearchParams();
    if (searchInput) newParams.set("q", searchInput);
    if (selectedCategorySlug) newParams.set("category", selectedCategorySlug);
    newParams.set("limit", currentLimit.toString()); // Preserve limit
    // Page will be reset as it's not in newParams
    router.push(`/?${newParams.toString()}`);
  };

  const handleCategorySelect = (slug: string) => {
    setSelectedCategorySlug(slug);
    if (isCategoryModalOpen) closeFullScreenModal();
    setIsCategoryDropdownVisible(false);
  };

  const handlePageChange = (page: number) => {
      const calculatedTotalPages = Math.max(1, Math.ceil(totalProducts / currentLimit));
      if (page < 1 || (page > calculatedTotalPages && page !== 1)) return;
      const newParams = new URLSearchParams();
      if (debouncedSearchTerm) newParams.set("q", debouncedSearchTerm);
      if (selectedCategorySlug) newParams.set("category", selectedCategorySlug);
      newParams.set("limit", currentLimit.toString());
      newParams.set("page", page.toString());
      router.push(`/?${newParams.toString()}`);
  };

  const handleLimitChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    const newParams = new URLSearchParams();
    if (debouncedSearchTerm) newParams.set("q", debouncedSearchTerm);
    if (selectedCategorySlug) newParams.set("category", selectedCategorySlug);
    newParams.set("limit", newLimit.toString());
    newParams.delete("page"); // Reset to page 1 when limit changes
    router.push(`/?${newParams.toString()}`);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // --- Pagination Calculation ---
  const totalPages = Math.max(1, Math.ceil(totalProducts / currentLimit));
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  const generatePageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;
    const halfMaxPages = Math.floor(maxPagesToShow / 2);
    if (totalPages <= 1) return [];
    if (totalPages <= maxPagesToShow + 2) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      let startPage = Math.max(2, currentPage - halfMaxPages);
      let endPage = Math.min(totalPages - 1, currentPage + halfMaxPages);
      if (currentPage - halfMaxPages <= 2) endPage = Math.min(totalPages - 1, maxPagesToShow);
      if (currentPage + halfMaxPages >= totalPages - 1) startPage = Math.max(2, totalPages - maxPagesToShow + 1);
      if (startPage > 2) pageNumbers.push('...');
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (endPage < totalPages - 1) pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }
    return pageNumbers.filter((item, index, self) => {
        if (item === '...') {
            if (self[index - 1] === '...') return false;
            if (typeof self[index - 1] === 'number' && typeof self[index + 1] === 'number' && (self[index + 1] as number) === (self[index - 1] as number) + 1) return false;
        }
        return true;
    });
  };

  // --- Conditional Rendering for App Loader ---
  if (isLoadingApp) {
    return <AppLoader />;
  }

  // --- Main Page Content ---
  return (
    <main className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      {/* ====== DYNAMIC ANIMATED GRADIENT HEADER ====== */}
      <header
        className={`
          text-gray-100 sticky top-0 z-50 shadow-lg rounded-b-2xl 
          transition-all duration-300 ease-in-out
          bg-gradient-to-r from-emerald-700 via-green-500 to-lime-400 
          bg-[length:200%_auto] animate-gradient-flow
        `}
      >
        <div className={`flex items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto transition-all duration-300 ease-in-out ${isScrolled ? 'py-2.5' : 'py-4'}`}>
          <h1 className={`font-bold tracking-tight transition-all duration-300 ease-in-out ${isScrolled ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}>
            <Link href="/" className="hover:text-white">Komprice</Link>
          </h1>
          <nav className={`hidden md:flex transition-all duration-300 ease-in-out ${isScrolled ? 'gap-6 text-xs sm:text-sm' : 'gap-8 text-sm'}`}>
            <Link href="/compare" className="hover:underline hover:text-white">Compare</Link>
            <Link href="/about" className="hover:underline hover:text-white">About</Link>
          </nav>
        </div>
        <div className={`px-4 sm:px-6 mx-auto transition-all duration-300 ease-in-out ${isScrolled ? 'pb-3 max-w-3xl' : 'pb-8 max-w-4xl'}`}>
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <input type="text" name="q_input" value={searchInput} onChange={handleInputChange} placeholder={isScrolled ? "Search..." : "Search for products, deals, or stores..."} className={`w-full border rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-300 ease-in-out placeholder-gray-500 text-gray-900 border-gray-300 ${isScrolled ? 'pl-3 pr-12 py-2 text-sm' : 'pl-4 pr-16 py-3 text-base'}`} />
            <button type="submit" className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-yellow-400 hover:bg-yellow-500 text-emerald-900 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${isScrolled ? 'h-8 w-8 sm:h-9 sm:w-9 hover:scale-105' : 'h-10 w-10 sm:h-12 sm:w-12 hover:scale-110'}`} aria-label="Search">
              <MagnifyingGlassIcon className={`transition-all duration-300 ease-in-out stroke-[2.5] ${isScrolled ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-5 w-5 sm:h-6 sm:w-6'}`} />
            </button>
          </form>
          <div className={`flex flex-wrap justify-center transition-all duration-300 ease-in-out ${isScrolled ? 'gap-1.5 sm:gap-2 mt-2.5' : 'gap-2 mt-6'}`}>
            {popularCategories.map((cat) => (
              <button key={cat.slug} onClick={() => handleCategorySelect(cat.slug)} className={`font-medium rounded-full transition-all duration-300 ease-in-out ${selectedCategorySlug === cat.slug ? "bg-amber-300 text-amber-900 shadow-sm" : "bg-amber-100 text-amber-700 hover:bg-amber-200"} ${isScrolled ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs sm:text-sm'}`}>
                {cat.label}
              </button>
            ))}
            <div className="relative" onMouseEnter={handleDropdownContainerMouseEnter} onMouseLeave={handleDropdownContainerMouseLeave}>
              <button type="button" ref={moreButtonRef} onClick={openFullScreenModal} className={`font-medium rounded-full transition-all duration-300 ease-in-out flex items-center gap-1 bg-amber-100 text-amber-700 hover:bg-amber-200 ${isScrolled ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs sm:text-sm'}`} aria-label="More categories" aria-haspopup="true" aria-expanded={isCategoryDropdownVisible || isCategoryModalOpen}>
                <span>More</span>
                <ChevronDownIcon className={`transition-transform duration-200 ease-in-out stroke-[2.5] text-amber-600 ${isCategoryDropdownVisible ? 'rotate-180' : 'rotate-0'} ${isScrolled ? 'h-3 w-3' : 'h-3 w-3 sm:h-4 sm:w-4'}`} />
              </button>
              {isCategoryDropdownVisible && (
                <CategoryDropdown categories={MOCK_CATEGORIES} onSelectCategory={(slug) => { handleCategorySelect(slug); }} onViewAllClick={() => { setIsCategoryDropdownVisible(false); openFullScreenModal(); }} />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ====== MAIN CONTENT AREA ====== */}
      <div className="flex-grow">
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6" aria-modal="true" role="dialog" aria-labelledby="categories-modal-title">
            <div className="absolute inset-0 bg-black/60 transition-opacity duration-300 ease-in-out" aria-hidden="true" onClick={closeFullScreenModal} />
            <div ref={modalContentRef} className="relative bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto p-6 transform transition-transform duration-300 ease-in-out">
              <div className="flex items-center justify-between mb-6 border-b pb-4"><h2 id="categories-modal-title" className="text-xl font-bold text-gray-800">All Categories</h2><button onClick={closeFullScreenModal} aria-label="Close categories modal" className="p-1 rounded-md hover:bg-gray-100 transition-colors"><XMarkIcon className="w-6 h-6 text-gray-600" /></button></div>
              {categoriesLoading ? (<div className="flex justify-center py-8"><ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" /></div>) : (
                <ul className="space-y-2">{categories.map((cat) => (<li key={cat.slug}><button onClick={() => handleCategorySelect(cat.slug)} className={`block w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${selectedCategorySlug === cat.slug ? "bg-emerald-100 text-emerald-700 font-semibold" : "text-gray-700 hover:bg-gray-100"}`}>{cat.label}</button></li>))}</ul>
              )}
            </div>
          </div>
        )}
        <section className="px-4 sm:px-6 py-12 max-w-7xl mx-auto w-full">
          <div className="mb-6 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              {totalProducts > 0 ? (
                <span>Showing {products.length > 0 ? ((currentPage - 1) * currentLimit) + 1 : 0} - {Math.min(currentPage * currentLimit, totalProducts)} of {totalProducts} results</span>
              ) : (
                <span>&nbsp;</span> // Keep space if no products to avoid layout shift
              )}
            </div>
            <div className="flex items-center">
                <label htmlFor="products-per-page" className="text-sm text-gray-600 mr-2 whitespace-nowrap">Show:</label>
                <select id="products-per-page" value={currentLimit} onChange={handleLimitChange} className="text-sm border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 py-1.5">
                    {PER_PAGE_OPTIONS.map(option => (<option key={option} value={option}>{option}</option>))}
                </select>
            </div>
          </div>
          {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-10 w-10 animate-spin text-emerald-500" /></div>}
          {!loading && error && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md mx-auto" role="alert"><strong className="font-bold">Error!</strong> <span className="block sm:inline">{error}</span></div>)}
          {!loading && !error && products.length === 0 && totalProducts === 0 && !debouncedSearchTerm && !selectedCategorySlug && (<div className="text-center py-16"><p className="text-xl text-gray-600 mb-4">Welcome to Komprice!</p><p className="text-gray-500 text-sm">Use the search bar or categories to find products.</p></div>)}
          {!loading && !error && products.length === 0 && (debouncedSearchTerm || selectedCategorySlug) && (<div className="text-center py-16"><p className="text-xl text-gray-600 mb-4">No products found for your search.</p><p className="text-gray-500 text-sm">Try a different search term or category.</p></div>)}
          {!loading && !error && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {products.map((p, i) => {
                  if (!p || typeof p.id === 'undefined') { console.warn(`Product at index ${i} is invalid`, p); return (<div className="bg-yellow-50 text-yellow-700 text-sm p-3 rounded shadow-sm" key={`invalid-${i}`}>Data issue</div>); }
                  return <ProductCard key={p.id || `product-${i}-${p.name}`} product={p} />;
                })}
              </div>
              {totalProducts > 0 && totalPages > 1 && (
                <div className="mt-10 text-center">
                  <div className="flex justify-center items-center space-x-2 mb-3">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={isFirstPage || loading} className={`p-2 border rounded-md text-sm font-medium flex items-center justify-center ${isFirstPage || loading ? "text-gray-400 border-gray-200 cursor-not-allowed" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`} aria-label="Previous page"><ChevronLeftIcon className="h-5 w-5" /> <span className="hidden sm:inline ml-1">Prev</span></button>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={isLastPage || loading} className={`p-2 border rounded-md text-sm font-medium flex items-center justify-center ${isLastPage || loading ? "text-gray-400 border-gray-200 cursor-not-allowed" : "border-gray-300 text-gray-700 hover:bg-gray-50"}`} aria-label="Next page"><span className="hidden sm:inline mr-1">Next</span> <ChevronRightIcon className="h-5 w-5" /></button>
                  </div>
                  <div className="flex justify-center items-center space-x-1 mt-2">
                    {generatePageNumbers().map((page, index) =>(typeof page === 'number' ? (<button key={`page-${page}`} onClick={() => handlePageChange(page)} disabled={page === currentPage || loading} className={`min-w-[36px] h-9 px-2 py-1 border rounded-md text-sm font-medium flex items-center justify-center transition-colors duration-150 ${page === currentPage ? "bg-emerald-600 text-white border-emerald-600 cursor-default" : loading ? "text-gray-400 border-gray-200 cursor-not-allowed" : "border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400"}`} aria-current={page === currentPage ? "page" : undefined}>{page}</button>) : (<span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-500 text-sm flex items-center justify-center h-9">...</span>)))}
                  </div>
                  <div className="text-gray-600 text-xs mt-3">Page {currentPage} of {totalPages}</div>
                </div>
              )}
            </>
          )}
          {!loading && !error && products.length === 0 && totalProducts > 0 && (currentPage > 1) && (
            <div className="text-center py-8"><p className="text-lg text-gray-600">No products found on this page.</p><button onClick={() => handlePageChange(1)} className="mt-2 text-sm text-emerald-600 hover:underline">Go to first page</button></div>
          )}
        </section>
      </div>

      {/* ====== SCROLL TO TOP BUTTON ====== */}
      <button onClick={scrollToTop} className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg z-40 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${showScrollToTopButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`} aria-label="Scroll to top">
        <ArrowUpIcon className="h-6 w-6" />
      </button>

      {/* ====== FOOTER ====== */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 xl:gap-12">
            <div className="md:col-span-2 lg:col-span-1"><Link href="/" className="inline-block mb-6"><h2 className="text-3xl font-bold text-white">Komprice</h2></Link><p className="text-sm mb-6 leading-relaxed">Komprice helps you find the best deals by comparing prices from thousands of stores. Shop smarter, save bigger, every day.</p><div className="flex space-x-4"><a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200"><span className="sr-only">Facebook</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></a><a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200"><span className="sr-only">Twitter</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a><a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200"><span className="sr-only">Instagram</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.498 3.72c.636-.247 1.363-.416 2.427-.465C8.95 2.013 9.304 2 12.315 2zm-1.161 1.043c-1.061.048-1.685.198-2.226.406A3.897 3.897 0 006.17 4.715a3.897 3.897 0 00-1.256 2.226c-.208.54-.358 1.165-.406 2.226-.048 1.052-.059 1.363-.059 3.803 0 2.44.011 2.751.059 3.803.048 1.061.198 1.685.406 2.226a3.897 3.897 0 001.256 2.226 3.897 3.897 0 002.226 1.256c.54.208 1.165.358 2.226.406 1.052.048 1.363.059 3.803.059 2.44 0 2.751-.011 3.803-.059.975-.045 1.704-.19 2.299-.403a3.742 3.742 0 001.316-1.261 3.739 3.739 0 001.261-1.316c.213-.595.358-1.324.403-2.299.045-1.052.056-1.363.056-3.803 0-2.44-.011-2.751-.056-3.803-.045-.975-.19-1.704-.403-2.299a3.742 3.742 0 00-1.261-1.316 3.739 3.739 0 00-1.316-1.261c-.595-.213-1.324-.358-2.299-.403C15.08 3.056 14.769 3.045 12.315 3.045zm0 2.427a6.36 6.36 0 110 12.72 6.36 6.36 0 010-12.72zM12 15.06a3.06 3.06 0 100-6.12 3.06 3.06 0 000 6.12z" clipRule="evenodd" /></svg></a></div></div>
            <div><h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase mb-5">Explore</h3><ul className="space-y-3"><li><Link href="/about" className="hover:text-emerald-400 transition-colors duration-200">About Us</Link></li><li><Link href="/how-it-works" className="hover:text-emerald-400 transition-colors duration-200">How It Works</Link></li><li><Link href="/categories" className="hover:text-emerald-400 transition-colors duration-200">Browse All Categories</Link></li><li><Link href="/blog" className="hover:text-emerald-400 transition-colors duration-200">Our Blog</Link></li><li><Link href="/deals" className="hover:text-emerald-400 transition-colors duration-200">Today's Deals</Link></li></ul></div>
            <div><h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase mb-5">Support</h3><ul className="space-y-3"><li><Link href="/help-center" className="hover:text-emerald-400 transition-colors duration-200">Help Center</Link></li><li><Link href="/help-center#faqs" className="hover:text-emerald-400 transition-colors duration-200">FAQs</Link></li><li><Link href="/contact" className="hover:text-emerald-400 transition-colors duration-200">Contact Us</Link></li><li><Link href="/sitemap" className="hover:text-emerald-400 transition-colors duration-200">Sitemap</Link></li></ul></div>
            <div><h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase mb-5">Legal</h3><ul className="space-y-3"><li><Link href="/terms-of-use" className="hover:text-emerald-400 transition-colors duration-200">Terms of Use</Link></li><li><Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors duration-200">Privacy Policy</Link></li><li><Link href="/cookie-policy" className="hover:text-emerald-400 transition-colors duration-200">Cookie Policy</Link></li><li><Link href="/accessibility-statement" className="hover:text-emerald-400 transition-colors duration-200">Accessibility</Link></li></ul></div>
          </div>
          <div className="mt-16 border-t border-gray-700 pt-8 text-center"><p className="text-sm">&copy; {currentYear} Komprice Technologies. All Rights Reserved.</p></div>
        </div>
      </footer>
    </main>
  );
}
