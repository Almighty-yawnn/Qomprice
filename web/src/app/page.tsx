// src/app/page.tsx
"use client";
import FilterSidebar from "@/components/ui/FilterSidebar";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
  ChangeEvent
} from "react";
import ProductCard from "@/components/ui/ProductCard";
import {
  searchProducts as originalSearchProducts,
  fetchCategoryTree,
  fetchMarketplaces
} from "@/lib/api";
import type { Product, Category, MarketplaceInfo } from "@/types/product";
import Link from "next/link";
import AppLoader from "@/components/ui/AppLoader";
import CategoryDropdown from "@/components/ui/CategoryDropdown";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";

const currentYear = new Date().getFullYear();

// --- Helper: Fisher–Yates shuffle ---
function shuffleArray<T>(a: T[]): T[] {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Client-side wrapper for pagination + shuffling + all filters ---
const searchProducts = async ({
  q,
  category,
  limit,
  page,
  site_id,
  minPrice,
  maxPrice,
}: {
  q: string;
  category?: string | string[];
  limit: number;
  page: number;
  site_id?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<{ products: Product[]; total: number }> => {
  const catParam = Array.isArray(category)
    ? category.join(",")
    : category ?? "";
  const all: Product[] = await originalSearchProducts({
    q,
    category: catParam,
    site_id,
    minPrice,
    maxPrice,
  });
  const shuffled = shuffleArray(all);
  const offset = (page - 1) * limit;
  return {
    products: shuffled.slice(offset, offset + limit),
    total: all.length
  };
};

// --- Constants ---
const POPULAR_CATEGORIES_SLUGS = [
  "",
  "phones-tablets",
  "laptops",
  "electronics",
  "fashion-beauty",
  "home-garden",
  "sports-outdoors",
  "books-media",
  "automotive",
  "health-wellness"
];
const PER_PAGE_OPTIONS = [10, 20, 30, 50, 100];
const DEFAULT_PRODUCTS_PER_PAGE = 30;
const HEADER_SCROLL_THRESHOLD = 10;
const SCROLL_TO_TOP_THRESHOLD = 300;
const DEBOUNCE_DELAY = 1500;
const DROPDOWN_CLOSE_DELAY = 200;
const SIDEBAR_WIDTH_CLASSES = "w-64 sm:w-72";

export default function Home() {
  const router = useRouter();
  const params = useSearchParams();

  // --- URL-derived initial values ---
  const initialQ = useMemo(() => params.get("q") ?? "", [params]);
  const initialCat = useMemo(() => params.get("category") ?? "", [params]);
  const initialSiteId = useMemo(() => params.get("site_id") ?? "", [params]);
  const initialMinPrice = useMemo(() => params.get("min_price") ?? "", [params]);
  const initialMaxPrice = useMemo(() => params.get("max_price") ?? "", [params]);
  const initialPage = useMemo(
    () => Math.max(1, parseInt(params.get("page") ?? "1", 10)),
    [params]
  );
  const initialLimit = useMemo(() => {
    const l = parseInt(params.get("limit") ?? "", 10);
    return PER_PAGE_OPTIONS.includes(l) ? l : DEFAULT_PRODUCTS_PER_PAGE;
  }, [params]);

  // --- UI state ---
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const [searchInput, setSearchInput] = useState(initialQ);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialQ);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [applyFilterTrigger, setApplyFilterTrigger] = useState(0);


  // --- Sidebar & Filter States ---
  const [isSiteFilterSidebarOpen, setIsSiteFilterSidebarOpen] = useState(false);
  const [isSiteFilterDropdownOpen, setIsSiteFilterDropdownOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<Record<string, string[]>>({});
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(initialCat);
  const [expandedCategorySlugs, setExpandedCategorySlugs] = useState<string | string[]>(initialCat || "");
  const [marketplaces, setMarketplaces] = useState<MarketplaceInfo[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState(initialSiteId);
  const [isLoadingMarketplaces, setIsLoadingMarketplaces] = useState(true);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(initialMinPrice);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(initialMaxPrice);

  // --- Modal/dropdown state & refs ---
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategoryDropdownVisible, setIsCategoryDropdownVisible] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const dropdownHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const siteFilterDropdownRef = useRef<HTMLDivElement>(null);

  // --- Derived for rendering ---
  const currentLimit = initialLimit;
  const currentPage = initialPage;
  // If you want to support extra client-side filtering, define hasActiveFilters and filteredProducts here.
  // For now, just use products directly.
  const displayProducts = useMemo(() => {
    return products || [];
  }, [products]);
  const popularCategories = useMemo(
    () => categories.filter((cat: Category) => POPULAR_CATEGORIES_SLUGS.includes(cat.slug)),
    [categories]
  );
  const selectedMarketplaceName = useMemo(() => {
    const selected = marketplaces.find(m => m.site_id === selectedSiteId);
    return selected ? selected.name : "All Sites";
  }, [marketplaces, selectedSiteId]);

  // --- Pagination helpers defined in component scope ---
  const totalPages = Math.max(1, Math.ceil(totalProducts / currentLimit));
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  // --- Handlers ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value);
  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); setDebouncedSearchTerm(searchInput); };
  const handleCategorySelect = (slug: string) => { setSelectedCategorySlug(slug); if (!slug || !categoryTree) { setExpandedCategorySlugs(""); } else { const parent = Object.keys(categoryTree).find(label => label.toLowerCase().replace(/\s+/g, "-") === slug); setExpandedCategorySlugs(parent ? categoryTree[parent] : []); } closeFullScreenModal(); setIsCategoryDropdownVisible(false); };
  const handleSiteIdSelect = (siteId: string) => { setSelectedSiteId(siteId); setIsSiteFilterDropdownOpen(false); };
  const handlePageChange = (newPage: number) => { if (newPage < 1 || newPage > totalPages || newPage === currentPage) return; const p = new URLSearchParams(params.toString()); p.set("page", newPage.toString()); router.push(`/?${p.toString()}`); };
  const handleLimitChange = (e: ChangeEvent<HTMLSelectElement>) => { const l = parseInt(e.target.value, 10); const p = new URLSearchParams(params.toString()); p.set("limit", l.toString()); p.delete("page"); router.push(`/?${p.toString()}`); };
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const openFullScreenModal = useCallback(() => setIsCategoryModalOpen(true), []);
  const closeFullScreenModal = useCallback(() => setIsCategoryModalOpen(false), []);
  const handleDropdownContainerMouseEnter = () => { if (dropdownHoverTimeoutRef.current) clearTimeout(dropdownHoverTimeoutRef.current); setIsCategoryDropdownVisible(true); };
  const handleDropdownContainerMouseLeave = () => { dropdownHoverTimeoutRef.current = setTimeout(() => setIsCategoryDropdownVisible(false), DROPDOWN_CLOSE_DELAY); };
  const toggleSiteFilterSidebar = () => { setIsSiteFilterSidebarOpen(prev => !prev); if (isSiteFilterDropdownOpen) setIsSiteFilterDropdownOpen(false); };
  const toggleSiteFilterDropdown = () => setIsSiteFilterDropdownOpen(prev => !prev);
  const generatePageNumbers = () => {
    const nums: (number | string)[] = [];
    const maxShow = 5;
    const half = Math.floor(maxShow / 2);
    if (totalPages <= maxShow + 2) {
      for (let i = 1; i <= totalPages; i++) nums.push(i);
    } else {
      nums.push(1);
      let start = Math.max(2, currentPage - half);
      let end = Math.min(totalPages - 1, currentPage + half);
      if (currentPage - half <= 2) end = maxShow;
      if (currentPage + half >= totalPages - 1) start = totalPages - maxShow + 1;
      if (start > 2) nums.push("...");
      for (let i = start; i <= end; i++) nums.push(i);
      if (end < totalPages - 1) nums.push("...");
      nums.push(totalPages);
    }
    return nums;
  };

  // --- Effects ---
  useEffect(() => { const t = setTimeout(() => setIsLoadingApp(false), 1500); return () => clearTimeout(t); }, []);

  useEffect(() => { const onScroll = () => { const y = window.scrollY; setIsScrolled(y > HEADER_SCROLL_THRESHOLD); setShowScrollToTopButton(y > SCROLL_TO_TOP_THRESHOLD); }; window.addEventListener("scroll", onScroll); onScroll(); return () => window.removeEventListener("scroll", onScroll); }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchInput);
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(handler);
  }, [searchInput, minPrice, maxPrice]);

  useEffect(() => { (async () => { try { const tree = await fetchCategoryTree(); setCategoryTree(tree); const parents: Category[] = Object.keys(tree).map(name => ({ label: name, slug: name.toLowerCase().replace(/\s+/g, "-") })); setCategories([{ label: "All Categories", slug: "" }, ...parents]); } catch (e) { console.error("Error loading category tree", e); setCategories([{ label: "All Categories", slug: "" }]); } })(); }, []);

  useEffect(() => {
    (async () => {
      setIsLoadingMarketplaces(true);
      try {
        const fetchedMarketplacesFromAPI = await fetchMarketplaces();
        const CORE_STYLED_SITE_DEFINITIONS = [
          { site_id: "get4lessghana", defaultName: "GET4LESSGHANA" },
          { site_id: "telefonika", defaultName: "Telefonika" },
          { site_id: "myghmarket", defaultName: "MyGHMarket" },
          { site_id: "shopwice", defaultName: "Shopwice" },
        ];
        const finalSiteList: MarketplaceInfo[] = [];
        const processedSiteIds = new Set<string>();
        CORE_STYLED_SITE_DEFINITIONS.forEach(coreDef => { const apiMatch = fetchedMarketplacesFromAPI.find(apiSite => apiSite.site_id && apiSite.site_id.toLowerCase() === coreDef.site_id.toLowerCase()); finalSiteList.push(apiMatch || { name: coreDef.defaultName, site_id: coreDef.site_id }); processedSiteIds.add(coreDef.site_id.toLowerCase()); });
        fetchedMarketplacesFromAPI.forEach(apiSite => { if (apiSite.site_id && !processedSiteIds.has(apiSite.site_id.toLowerCase())) { finalSiteList.push(apiSite); } });
        finalSiteList.sort((a, b) => a.name.localeCompare(b.name));
        setMarketplaces([{ name: "All Sites", site_id: "" }, ...finalSiteList]);
      } catch (e) { console.error("Error loading marketplaces", e); setMarketplaces([{ name: "All Sites", site_id: "" }, { name: "GET4LESSGHANA", site_id: "get4lessghana" }, { name: "Telefonika", site_id: "telefonika" }, { name: "MyGHMarket", site_id: "myghmarket" }, { name: "Shopwice", site_id: "shopwice" }].sort((a,b)=>a.name.localeCompare(b.name))); }
      finally { setIsLoadingMarketplaces(false); }
    })();
  }, []);

  useEffect(() => {
    const newParams = new URLSearchParams();
    if (debouncedSearchTerm) newParams.set("q", debouncedSearchTerm);
    // if (selectedCategorySlug) newParams.set("category", selectedCategorySlug);
    // if (selectedSiteId) newParams.set("site_id", selectedSiteId);
    if (selectedTypes.length > 0) {
    newParams.set("category", selectedTypes.join(","));
    } else if (selectedCategorySlug) {
      newParams.set("category", selectedCategorySlug);
    }

    if (selectedBrands.length > 0) {
      newParams.set("site_id", selectedBrands.join(","));
    } else if (selectedSiteId) {
      newParams.set("site_id", selectedSiteId);
    }

    if (debouncedMinPrice) newParams.set("min_price", debouncedMinPrice);
    if (debouncedMaxPrice) newParams.set("max_price", debouncedMaxPrice);
    newParams.set("limit", currentLimit.toString());
    const hasCriticalChange = (debouncedSearchTerm || "") !== (params.get("q") ?? "") || (selectedCategorySlug || "") !== (params.get("category") ?? "") || (selectedSiteId || "") !== (params.get("site_id") ?? "") || (debouncedMinPrice || "") !== (params.get("min_price") ?? "") || (debouncedMaxPrice || "") !== (params.get("max_price") ?? "") || currentLimit.toString() !== (params.get("limit") ?? DEFAULT_PRODUCTS_PER_PAGE.toString());
    if (!hasCriticalChange && currentPage > 1) { newParams.set("page", currentPage.toString()); }
    if (newParams.toString() !== params.toString()) { router.replace(`/?${newParams.toString()}`, { scroll: false }); }
  }, [debouncedSearchTerm, selectedCategorySlug, selectedSiteId, debouncedMinPrice, debouncedMaxPrice, currentLimit, currentPage, router, params]);

    useEffect(() => {
        if (isLoadingApp || initialLimit === undefined) return;
        (async () => {
          setLoading(true);
          setError(null);

          try {
            let actualQuery    = debouncedSearchTerm.trim();
            let actualCategory = selectedTypes.length > 0 ? selectedTypes : expandedCategorySlugs;


            const term = actualQuery.toLowerCase();
            if (["phone","phones","mobile","mobiles"].includes(term)) {
              actualCategory = [
                "mobile-phones",
                "phones-accessories",  // <- corrected slug
                "phones-tablets",
              ];
              actualQuery = "";
            }

            // only parse price if non‐empty
            const min = debouncedMinPrice !== "" && !isNaN(+debouncedMinPrice)
              ? +debouncedMinPrice
              : undefined;
            const max = debouncedMaxPrice !== "" && !isNaN(+debouncedMaxPrice)
              ? +debouncedMaxPrice
              : undefined;

            const { products, total } = await searchProducts({
              q:        actualQuery,
              category: actualCategory,
              limit:    currentLimit,
              page:     currentPage,
              site_id: selectedBrands.length > 0 ? selectedBrands.join(',') : selectedSiteId,
              minPrice: min,
              maxPrice: max,
            });

            setProducts(products);
            setTotalProducts(total);

          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            setError("Failed to load products: " + msg);
            setProducts([]);
            setTotalProducts(0);
          } finally {
            setLoading(false);
          }
        })();
      }, [
        debouncedSearchTerm,
        expandedCategorySlugs,
        selectedSiteId,
        debouncedMinPrice,
        debouncedMaxPrice,
        currentPage,
        currentLimit,
        isLoadingApp,
        initialLimit,
        applyFilterTrigger,
      ]);

  useEffect(() => { setSearchInput(initialQ); setSelectedCategorySlug(initialCat); setExpandedCategorySlugs(initialCat || ""); setSelectedSiteId(initialSiteId); setMinPrice(initialMinPrice); setMaxPrice(initialMaxPrice); }, [initialQ, initialCat, initialSiteId, initialMinPrice, initialMaxPrice]);





  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (siteFilterDropdownRef.current && !siteFilterDropdownRef.current.contains(event.target as Node)) { setIsSiteFilterDropdownOpen(false); }
      if (isCategoryModalOpen && modalContentRef.current && !modalContentRef.current.contains(event.target as Node) && moreButtonRef.current && !moreButtonRef.current.contains(event.target as Node)) { setIsCategoryModalOpen(false); }
    };
    const handleEscapeKey = (event: KeyboardEvent) => { if (event.key === "Escape") { if (isSiteFilterDropdownOpen) setIsSiteFilterDropdownOpen(false); if (isCategoryModalOpen) setIsCategoryModalOpen(false); if (isSiteFilterSidebarOpen) setIsSiteFilterSidebarOpen(false); } };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    return () => { document.removeEventListener("mousedown", handleClickOutside); document.removeEventListener("keydown", handleEscapeKey); };
  }, [isSiteFilterDropdownOpen, isCategoryModalOpen, isSiteFilterSidebarOpen]);

  const getSiteDropdownItemStyles = (siteButtonId?: string, currentSelectedSiteId?: string): string => { const isActive = siteButtonId === currentSelectedSiteId; const baseStyle = "w-full text-left px-4 py-2 text-sm transition-colors duration-150 "; const siteIdLower = siteButtonId?.toLowerCase(); if (isActive) { switch (siteIdLower) { case "get4lessghana": return baseStyle + "bg-orange-500 text-white font-semibold"; case "telefonika": return baseStyle + "bg-blue-500 text-white font-semibold"; case "myghmarket": return baseStyle + "bg-purple-500 text-white font-semibold"; case "shopwice": return baseStyle + "bg-green-500 text-white font-semibold"; default: return baseStyle + "bg-emerald-600 text-white font-semibold"; } } else { switch (siteIdLower) { case "get4lessghana": return baseStyle + "text-orange-700 hover:bg-orange-100"; case "telefonika": return baseStyle + "text-blue-700 hover:bg-blue-100"; case "myghmarket": return baseStyle + "text-purple-700 hover:bg-purple-100"; case "shopwice": return baseStyle + "text-green-700 hover:bg-green-100"; default: return baseStyle + "text-gray-700 hover:bg-gray-100"; } } };

  if (isLoadingApp) return <AppLoader />;

  const sidebarMarginPx = isSiteFilterSidebarOpen ? (SIDEBAR_WIDTH_CLASSES.includes('sm:w-72') ? 288 : 256) : 0;


    // 1. Figure out when *any* filter is active:
  const hasActiveFilters = Boolean(
    debouncedSearchTerm ||
    selectedCategorySlug ||
    selectedSiteId ||
    (debouncedMinPrice !== "" && !isNaN(+debouncedMinPrice)) ||
    (debouncedMaxPrice !== "" && !isNaN(+debouncedMaxPrice))
  );

  // 2. Reset-all handler:
  const handleClearFilters = () => {
    setSearchInput("");
    setDebouncedSearchTerm("");
    setSelectedCategorySlug("");
    setExpandedCategorySlugs("");
    setSelectedSiteId("");
    setMinPrice("");
    setMaxPrice("");
    setDebouncedMinPrice("");
    setDebouncedMaxPrice("");
    setSelectedBrands([]);
    setSelectedTypes([]);

    // Delay router.replace slightly to allow state to settle
    setTimeout(() => {
      router.replace("/", { scroll: false });
    }, 50); // small enough delay to wait for React state updates
  };


  //
  // === 1. define your *allowed* price‐range from the server/API
  //
  // Replace these 0 & 100000 with whatever your backend says:
// define your “allowed” min/max from API
  const apiMin = 0
  const apiMax = 100000
  const pagePriceRange = { min: apiMin, max: apiMax }

  

  const handleBrandChange = (brands: string[]) => {
    setSelectedBrands(brands);
    setApplyFilterTrigger((prev) => prev + 1);
  };

  const handleTypeChange = (types: string[]) => {
    setSelectedTypes(types);
    setApplyFilterTrigger((prev) => prev + 1);
  };

  const handlePriceChange = ({ min, max }: { min: number; max: number }) => {
    setMinPrice(String(min));
    setMaxPrice(String(max));
    setDebouncedMinPrice(String(min));
    setDebouncedMaxPrice(String(max));
    setApplyFilterTrigger((prev) => prev + 1);
  };








  return (
    <main className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      <button onClick={toggleSiteFilterSidebar} className={`fixed top-1/3 transform -translate-y-1/2 z-[75] p-2 bg-emerald-600 text-white rounded-r-lg shadow-lg hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition-all duration-300 ease-in-out`} style={{ left: isSiteFilterSidebarOpen ? `${sidebarMarginPx}px` : '0px' }} aria-label={isSiteFilterSidebarOpen ? "Close site filters" : "Open site filters"} aria-expanded={isSiteFilterSidebarOpen} aria-controls="site-filter-sidebar">
        {isSiteFilterSidebarOpen ? <ChevronLeftIcon className="h-5 w-5 sm:h-6 sm:w-6" /> : <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
      </button>
      


      
      {isSiteFilterSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[65] md:hidden"
          onClick={toggleSiteFilterSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        id="site-filter-sidebar"
        className={`fixed top-1/2 transform -translate-y-1/2 z-[75] p-2 bg-emerald-600 rounded-r-lg shadow-lg hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition-all duration-300 ease-in-out ${
          isSiteFilterSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <FilterSidebar
          filters={{
            brands: selectedBrands,
            productTypes: selectedTypes,
            priceRange: {
              min: debouncedMinPrice === '' ? pagePriceRange.min : Number(debouncedMinPrice),
              max: debouncedMaxPrice === '' ? pagePriceRange.max : Number(debouncedMaxPrice),
            },
          }}
          availableBrands={marketplaces.map((m) => m.name)}
          availableTypes={categories.map((c) => c.slug)}
          priceRange={pagePriceRange}
          onBrandChange={handleBrandChange}
          onTypeChange={handleTypeChange}
          onPriceChange={handlePriceChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          productCount={totalProducts}
        />
      </aside>



      <div className={`flex flex-col flex-grow transition-all duration-300 ease-in-out ${isSiteFilterSidebarOpen ? `md:ml-${SIDEBAR_WIDTH_CLASSES.split(' ')[1].substring(3)}` : ''}`}>
        <header
          className={`text-gray-100 sticky top-0 z-50 shadow-lg rounded-b-2xl transition-all duration-300 ease-in-out bg-gradient-to-r from-emerald-700 via-green-500 to-lime-400 bg-[length:200%_auto] animate-gradient-flow`}
        >
          <div className={`flex items-center justify-between px-4 sm:px-6 max-w-7xl mx-auto transition-all duration-300 ease-in-out ${isScrolled ? 'py-2.5' : 'py-4'}`}>
            <h1 className={`font-bold tracking-tight transition-all duration-300 ease-in-out ${isScrolled ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}>
              <Link href="/" className="hover:text-white">QomPrice</Link>
            </h1>
            <nav className={`flex items-center transition-all duration-300 ease-in-out ${isScrolled ? 'gap-4 text-xs sm:text-sm' : 'gap-6 text-sm'}`}>
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
            <div className={`flex flex-wrap items-center justify-center transition-all duration-300 ease-in-out ${isScrolled ? 'gap-1.5 sm:gap-2 mt-2.5' : 'gap-2 mt-6'}`}>
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
                  <CategoryDropdown categories={categories} onSelectCategory={(slug) => { handleCategorySelect(slug); }} onViewAllClick={() => { setIsCategoryDropdownVisible(false); openFullScreenModal(); }} />
                )}
              </div>
            </div>
          </div>
        </header>
        
        <div className={`flex-grow w-full`}>
            {isCategoryModalOpen && (
              <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6" aria-modal="true" role="dialog" aria-labelledby="categories-modal-title">
                <div className="absolute inset-0 bg-black/60 transition-opacity duration-300 ease-in-out" aria-hidden="true" onClick={closeFullScreenModal} />
                <div ref={modalContentRef} className="relative bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto p-6 transform transition-transform duration-300 ease-in-out">
                  <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                    <h2 id="categories-modal-title" className="text-xl font-bold text-gray-800">All Categories</h2>
                    <button onClick={closeFullScreenModal} aria-label="Close categories modal" className="p-1 rounded-md hover:bg-gray-100 transition-colors"><XMarkIcon className="w-6 h-6 text-gray-600" /></button>
                  </div>
                  { !categories || categories.length === 0 ? (<div className="flex justify-center py-8"><ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" /></div>) : (
                    <ul className="space-y-2">{categories.map((cat) => (<li key={cat.slug}><button onClick={() => handleCategorySelect(cat.slug)} className={`block w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${selectedCategorySlug === cat.slug ? "bg-emerald-100 text-emerald-700 font-semibold" : "text-gray-700 hover:bg-gray-100"}`}>{cat.label}</button></li>))}</ul>
                  )}
                </div>
              </div>
            )}
            <section className="px-4 sm:px-6 py-12 max-w-7xl mx-auto w-full">
              <div className="mb-6 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  {totalProducts > 0 && displayProducts.length > 0 ? (
                    <span>Showing {((currentPage - 1) * currentLimit) + 1} - {Math.min(currentPage * currentLimit, totalProducts)} of {totalProducts} results</span>
                  ) : totalProducts === 0 && !loading ? (
                    <span>No products found. { (debouncedSearchTerm || selectedCategorySlug || selectedSiteId || minPrice || maxPrice) && "Try adjusting your filters."}</span>
                  ): (
                    <span>&nbsp;</span>
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
              {!loading && !error && displayProducts.length === 0 && products.length === 0 && totalProducts === 0 && !debouncedSearchTerm && !selectedCategorySlug && !selectedSiteId && !minPrice && !maxPrice && (<div className="text-center py-16"><p className="text-xl text-gray-600 mb-4">Welcome to Qomprice!</p><p className="text-gray-500 text-sm">Use the search bar or categories to find products.</p></div>)}
              {!loading && !error && displayProducts.length === 0 && (debouncedSearchTerm || selectedCategorySlug || selectedSiteId || minPrice || maxPrice) && (<div className="text-center py-16"><p className="text-xl text-gray-600 mb-4">No products found for your current selection.</p><p className="text-gray-500 text-sm">Try a different search term or adjusting your filters.</p></div>)}

              {!loading && !error && displayProducts.length > 0 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-5">
                    {displayProducts.map((p) => {
                      if (!p || typeof p.id === 'undefined') {
                        console.warn(`Product object is invalid`, p);
                        return (<div className="bg-yellow-50 text-yellow-700 text-sm p-3 rounded shadow-sm" key={`invalid-product-${Math.random()}`}>Data issue</div>);
                      }

                      let determinedImageUrl: string | undefined = p.imageUrl;
                      if (!determinedImageUrl && p.listings && p.listings.length > 0 && p.listings[0].image_url) {
                        determinedImageUrl = p.listings[0].image_url;
                      }

                      const productForCard: Product = { ...p, imageUrl: determinedImageUrl };
                      return <ProductCard key={productForCard.id} product={productForCard} />;
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
              {!loading && !error && displayProducts.length === 0 && products.length > 0 && currentPage > 1 && (
                <div className="text-center py-8"><p className="text-lg text-gray-600">No products found on this page.</p><button onClick={() => handlePageChange(1)} className="mt-2 text-sm text-emerald-600 hover:underline">Go to first page</button></div>
              )}
          </section>
        </div>

        <button onClick={scrollToTop} className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg z-40 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${showScrollToTopButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`} aria-label="Scroll to top">
          <ArrowUpIcon className="h-6 w-6" />
        </button>

        <footer className="bg-gray-900 text-gray-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 xl:gap-12">
              <div className="md:col-span-2 lg:col-span-1"><Link href="/" className="inline-block mb-6"><h2 className="text-3xl font-bold text-white">Qomprice</h2></Link><p className="text-sm mb-6 leading-relaxed">Qomprice helps you find the best deals by comparing prices from thousands of stores. Shop smarter, save bigger, every day.</p><div className="flex space-x-4"><a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200"><span className="sr-only">Facebook</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></a><a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200"><span className="sr-only">Twitter</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a><a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200"><span className="sr-only">Instagram</span><svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.498 3.72c.636-.247 1.363.416 2.427.465C8.95 2.013 9.304 2 12.315 2zm-1.161 1.043c-1.061.048-1.685.198-2.226.406A3.897 3.897 0 006.17 4.715a3.897 3.897 0 00-1.256 2.226c-.208.54-.358 1.165-.406 2.226-.048 1.052-.059 1.363-.059 3.803 0 2.44.011 2.751.059 3.803.048 1.061.198 1.685.406 2.226a3.897 3.897 0 001.256 2.226 3.897 3.897 0 002.226 1.256c.54.208 1.165.358 2.226.406 1.052.048 1.363.059 3.803.059 2.44 0 2.751-.011 3.803-.059.975-.045 1.704-.19 2.299-.403a3.742 3.742 0 001.316-1.261 3.739 3.739 0 001.261-1.316c.213-.595.358-1.324.403-2.299.045-1.052.056-1.363.056-3.803 0-2.44-.011-2.751-.056-3.803-.045-.975-.19-1.704-.403-2.299a3.742 3.742 0 00-1.261-1.316 3.739 3.739 0 00-1.316-1.261c-.595-.213-1.324-.358-2.299-.403C15.08 3.056 14.769 3.045 12.315 3.045zm0 2.427a6.36 6.36 0 110 12.72 6.36 6.36 0 010-12.72zM12 15.06a3.06 3.06 0 100-6.12 3.06 3.06 0 000 6.12z" clipRule="evenodd" /></svg></a></div></div>
              <div><h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase mb-5">Explore</h3><ul className="space-y-3"><li><Link href="/about" className="hover:text-emerald-400 transition-colors duration-200">About Us</Link></li><li><Link href="/how-it-works" className="hover:text-emerald-400 transition-colors duration-200">How It Works</Link></li><li><Link href="/categories" className="hover:text-emerald-400 transition-colors duration-200">Browse All Categories</Link></li><li><Link href="/blog" className="hover:text-emerald-400 transition-colors duration-200">Our Blog</Link></li><li><Link href="/deals" className="hover:text-emerald-400 transition-colors duration-200">Today's Deals</Link></li></ul></div>
              <div><h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase mb-5">Support</h3><ul className="space-y-3"><li><Link href="/help-center" className="hover:text-emerald-400 transition-colors duration-200">Help Center</Link></li><li><Link href="/help-center#faqs" className="hover:text-emerald-400 transition-colors duration-200">FAQs</Link></li><li><Link href="/contact" className="hover:text-emerald-400 transition-colors duration-200">Contact Us</Link></li><li><Link href="/sitemap" className="hover:text-emerald-400 transition-colors duration-200">Sitemap</Link></li></ul></div>
              <div><h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase mb-5">Legal</h3><ul className="space-y-3"><li><Link href="/terms-of-use" className="hover:text-emerald-400 transition-colors duration-200">Terms of Use</Link></li><li><Link href="/privacy-policy" className="hover:text-emerald-400 transition-colors duration-200">Privacy Policy</Link></li><li><Link href="/cookie-policy" className="hover:text-emerald-400 transition-colors duration-200">Cookie Policy</Link></li><li><Link href="/accessibility-statement" className="hover:text-emerald-400 transition-colors duration-200">Accessibility</Link></li></ul></div>
            </div>
            <div className="mt-16 border-t border-gray-700 pt-8 text-center"><p className="text-sm">&copy; {currentYear} Qomprice Technologies. All Rights Reserved.</p></div>
          </div>
        </footer>
      </div>
    </main>
  );
}
