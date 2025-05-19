/* ----------------------------------------------------------------
 * Komprice – Home page Revamped with Pagination
 * Shows products in pages, improving user experience for large lists.
 * ----------------------------------------------------------------*/
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react"; // <-- Import useRef
import ProductCard from "@/components/ui/ProductCard";
// Import the searchProducts function - we'll simulate it returning total count
import { searchProducts as originalSearchProducts } from "@/lib/api";
import type { Product } from "@/types/product";

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


// --- Pagination Constant ---
const PRODUCTS_PER_PAGE = 50;

// --- Simulate API with Pagination Support ---
const searchProducts = async ({ q, category, limit, page }: { q: string; category?: string; limit: number; page: number }) => {
    console.log(`Simulating API search: q=${q}, category=${category}, limit=${limit}, page=${page}`);
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 700));
    const allResults = await originalSearchProducts({ q, category });
    const offset = (page - 1) * limit;
    const paginatedResults = allResults.slice(offset, offset + limit);
    const total = allResults.length;

    console.log(`API Simulation Results: Found ${allResults.length} total, returning ${paginatedResults.length} for page ${page}`);

    // Return results and total count, like a real paginated API would
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

  // Memoized initial values from URL to avoid re-evaluating on every render
  const initialQueryFromUrl = useMemo(() => params.get("q") ?? "", [params]);
  const initialCategoryFromUrl = useMemo(() => params.get("category") ?? "", [params]);
  const initialPageFromUrl = useMemo(() => Math.max(1, parseInt(params.get("page") ?? "1", 10)), [params]);

  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const [searchInput, setSearchInput] = useState(initialQueryFromUrl);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialQueryFromUrl);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0); // State for total count
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State to control the full category list modal visibility
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const q = params.get("q") ?? "";
  const selectedCategorySlug = params.get("category") ?? "";
  // Get page number from URL, default to 1, ensure it's a positive integer
  const currentPage = Math.max(1, parseInt(params.get("page") ?? "1", 10));

  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const popularCategories = useMemo(() => {
    return MOCK_CATEGORIES.filter(cat => POPULAR_CATEGORIES_SLUGS.includes(cat.slug));
  }, []);


  /* --- Fetch Categories (Mock or API) -------------------------------------- */
  useEffect(() => {
      const fetchCategories = async () => {
        setCategoriesLoading(true);
          // Using mock data:
          setTimeout(() => { // Simulate network delay
              setCategories(MOCK_CATEGORIES);
              setCategoriesLoading(false);
          }, 500); // 500ms delay
      };
      fetchCategories();
  }, []);

  /* --- Fetch Products based on q, selectedCategorySlug, and currentPage ---- */
  useEffect(() => {
    const fetchProductsData = async () => {
      setLoading(true);
      setError(null);
      setProducts([]); // Clear previous products immediately
      setTotalProducts(0); // Clear total count

      try {
        const results = await searchProducts({
            q: debouncedSearchTerm,
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
  }, [q, selectedCategorySlug, currentPage]); // Re-run effect when q, category, OR page changes

  /* --- Close modal on click outside --- */
  useEffect(() => {
    const handleMousedown = (event: MouseEvent) => {
      // Check if the click is outside the modal content AND outside the button that opened it
      if (
        modalContentRef.current && !modalContentRef.current.contains(event.target as Node) &&
        moreButtonRef.current && !moreButtonRef.current.contains(event.target as Node)
      ) {
        setIsCategoryModalOpen(false);
      }
    };

    // Only add listener if modal is open
    if (isCategoryModalOpen) {
      document.addEventListener('mousedown', handleMousedown);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleMousedown);
    };
  }, [isCategoryModalOpen]); // Dependency array includes the state


  /* --- Handlers ---------------------------------------------------------- */

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const searchQuery = formData.get("q")?.toString() ?? "";

    const currentParams = new URLSearchParams(params.toString());

    if (searchQuery) {
      currentParams.set("q", searchQuery);
    } else {
      currentParams.delete("q");
    }

    // Category is handled by clicking the chips or modal items

    // Reset page to 1 when search query changes
    currentParams.delete("page");

    router.replace(`/?${currentParams.toString()}`);
    // No need to close modal here, search is separate from modal open state
  };

  const handleCategorySelect = (slug: string) => {
      const currentParams = new URLSearchParams(params.toString());
      if (slug) {
          currentParams.set("category", slug);
      } else {
          currentParams.delete("category");
      }
      // Reset page to 1 when category changes
      currentParams.delete("page");

      router.push(`/?${currentParams.toString()}`);
      setIsCategoryModalOpen(false); // Close modal after selection (if opened via modal)
  };

  const handlePageChange = (page: number) => {
      if (page < 1) return; // Prevent going below page 1
      const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
      if (page > totalPages && totalPages > 0) return; // Prevent going beyond last page (if total known)

      const currentParams = new URLSearchParams(params.toString());
      currentParams.set("page", page.toString());
      router.push(`/?${currentParams.toString()}`); // Use push for pagination history
  };


  /* --- Pagination Calculation --- */
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages || totalProducts === 0; // Also last page if total is 0

  /* --- view -------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-gray-100 text-gray-800">
      {/* ───────────── HEADER ───────────── */}
      <header className="bg-emerald-700 text-gray-100 relative z-20 shadow-md">
        {/* top bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <a href="/" className="hover:text-white">Komprice</a>
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

        {/* search bar area */}
        <div className="px-4 sm:px-6 pb-8 max-w-4xl mx-auto"> {/* Removed relative here */}
          {/* search form */}
          {/* Adjusted form layout to accommodate the round button */}
          <form onSubmit={handleSearchSubmit} className="flex items-center relative"> {/* Use relative for positioning the input */}
             {/* Input field takes up most space */}
             <input
               type="text"
               name="q"
               defaultValue={q}
               placeholder="Search for products, deals, or stores..."
               // Style input to integrate with the rounded search button
               className="w-full pl-4 pr-16 py-3 text-base text-gray-900 placeholder-gray-500 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
             />

             {/* Search Button - positioned absolutely inside the form, overlapping the input's right side */}
             <button
               type="submit"
               className="absolute right-0 top-1/2 transform -translate-y-1/2
                          bg-yellow-400 hover:bg-yellow-500 text-emerald-900
                          h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center
                          shadow-md hover:shadow-lg
                          transition-all duration-200 ease-in-out
                          hover:scale-110 hover:z-10 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2" // Styling for big, round, yellow, isolated hover
               aria-label="Search"
             >
                 <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />
             </button>
           </form>

           {/* category chips - Brought back and restyled */}
           <div className="flex flex-wrap gap-2 mt-6 justify-center"> {/* Smaller gap, centered */}
             {popularCategories.map((cat) => (
               <button
                 key={cat.slug}
                 onClick={() => handleCategorySelect(cat.slug)}
                 className={`
                   font-semibold px-4 py-1.5 rounded-full text-xs sm:text-sm transition-colors duration-200
                   ${selectedCategorySlug === cat.slug
                     ? "bg-amber-300 text-amber-900 shadow-sm" // Slightly less bright selected
                     : "bg-amber-200 text-amber-800 hover:bg-amber-300" // Less bright default
                   }
                 `}
               >
                 {cat.label}
               </button>
             ))}

             {/* “More” button → open MODAL */}
             <button
               type="button"
               ref={moreButtonRef} // Attach ref
               onClick={() => setIsCategoryModalOpen(true)} // Opens the modal
               className="bg-amber-200 text-amber-800 font-semibold px-4 py-1.5 rounded-full text-xs sm:text-sm leading-none hover:bg-amber-300 transition-colors flex items-center gap-1"
               aria-label="More categories"
             >
               <span>More</span>
               <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4 stroke-[2] text-amber-700" /> {/* Slightly smaller icon */}
             </button>
           </div>
        </div>
      </header>

      {/* ───────────── FULL CATEGORY LIST MODAL ───────────── */}
      {/* Use conditional rendering based on isCategoryModalOpen state */}
      {isCategoryModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center px-4 py-6" // Center the modal
          aria-modal="true"
          role="dialog"
          aria-labelledby="categories-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out"
            aria-hidden="true"
            onClick={() => setIsCategoryModalOpen(false)} // Click backdrop to close
          />

          {/* Modal Panel */}
          {/* Attach ref to the actual modal content div */}
          <div
            ref={modalContentRef}
            className="relative bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto p-6 transform transition-transform duration-300 ease-in-out"
          >
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 id="categories-modal-title" className="text-xl font-bold text-gray-800">All Categories</h2> {/* Changed title */}
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                aria-label="Close categories modal"
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Category list */}
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
                      className={`
                        block w-full text-left px-3 py-2 rounded-md transition-colors duration-200
                        ${selectedCategorySlug === cat.slug
                          ? "bg-emerald-100 text-emerald-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                      // role="menuitem" // Removed role=menuitem as this is a dialog, not a menu dropdown
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

      {/* ───────────── PRODUCT GRID ───────────── */}
      {/* ... (rest of the product grid and pagination remains the same) ... */}
      <section className="px-4 sm:px-6 py-12 max-w-7xl mx-auto">
        {loading ? (
          // Loading state with spinner
          <div className="flex justify-center py-16">
             <ArrowPathIcon className="h-10 w-10 animate-spin text-emerald-500" />
             {/* Consider a skeleton grid here for better UX during loading */}
          </div>
        ) : error ? (
          // Error state with styled message
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md mx-auto" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : products.length === 0 && totalProducts === 0 ? (
          // Empty state message when no products found at all
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">No products found.</p>
            <p className="text-gray-500 text-sm">Try a different search term or category.</p>
          </div>
        ) : (
          // Product Grid
          <>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
               {products.map((p, i) => {
                 try {
                   return <ProductCard key={p.id || i} product={p} />;
                 } catch (err) {
                   console.error(`❌ Error rendering product[${i}]`, p, err);
                   return (
                     <div className="bg-red-50 text-red-700 text-sm p-3 rounded shadow-sm" key={i}>
                       Error loading product details.
                     </div>
                   );
                 }
               })}
             </div>

             {/* ───────────── PAGINATION CONTROLS ───────────── */}
             {/* Only show pagination if there are products or total count is known */}
             {totalProducts > 0 && (
                 <div className="flex justify-center items-center space-x-4 mt-10">
                     <button
                         onClick={() => handlePageChange(currentPage - 1)}
                         disabled={isFirstPage || loading} // Disable if first page or loading
                         className={`
                             px-4 py-2 border rounded-md text-sm font-medium
                             ${isFirstPage || loading ? "text-gray-400 border-gray-200 cursor-not-allowed" : "border-gray-300 text-gray-700 hover:bg-gray-50"}
                         `}
                         aria-label="Previous page"
                     >
                         <ChevronLeftIcon className="h-5 w-5" />
                     </button>

                     {/* Page Info */}
                     <span className="text-gray-700 text-sm">
                         Page {currentPage} of {totalPages}
                     </span>

                     <button
                         onClick={() => handlePageChange(currentPage + 1)}
                         disabled={isLastPage || loading} // Disable if last page or loading
                         className={`
                             px-4 py-2 border rounded-md text-sm font-medium
                             ${isLastPage || loading ? "text-gray-400 border-gray-200 cursor-not-allowed" : "border-gray-300 text-gray-700 hover:bg-gray-50"}
                         `}
                          aria-label="Next page"
                     >
                         <ChevronRightIcon className="h-5 w-5" />
                     </button>
                 </div>
             )}

             {/* Show "No products found" message specifically for the current page */}
             {products.length === 0 && totalProducts > 0 && (
                 <div className="text-center py-8">
                    <p className="text-lg text-gray-600">No products found on this page.</p>
                 </div>
             )}
          </>
        )}
      </section>


      {/* ───────────── FOOTER ───────────── */}
      <footer className="bg-gray-800 text-gray-300 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <h4 className="font-bold text-white mb-3">Contact us</h4>
            <p className="hover:text-white cursor-pointer">support@komprice.com</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Explore</h4>
            <p><a href="#" className="hover:text-white transition-colors">Compare Prices</a></p>
            <p><a href="#" className="hover:text-white transition-colors">Popular Products</a></p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Support</h4>
            <p><a href="#" className="hover:text-white transition-colors">FAQs</a></p>
            <p><a href="#" className="hover:text-white transition-colors">Help Center</a></p>
          </div>
        </div>
      </footer>
    </main>
  );
}