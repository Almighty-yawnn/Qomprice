// src/pages/index.tsx   (or src/app/page.tsx if you’re on the App router)

"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { searchProducts } from "@/lib/api";
import type { Product } from "@/types/product";
import {
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  const params = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Read URL params
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? undefined;

  // Use the same slugs you defined in your selectors & categories table
  const chips = [
    { label: "Phones & Tablets", slug: "phones-tablets" },
    { label: "Home & Kitchen",   slug: "home-office"     },
    { label: "Electronics",      slug: "electronics"    },
    // …etc
  ];

  // Fetch whenever q or category changes
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        // omit limit to get all results, or pass limit if you want to cap
        const results = await searchProducts({ q, category });
        setProducts(results);
      } catch (err) {
        console.error("❌ Error loading products:", err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [q, category]);

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* HEADER */}
      <header className="bg-green-700 text-white relative z-20">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">Komprice</h1>
          <nav className="hidden md:flex gap-8 text-sm">
            <a href="#" className="hover:underline">Compare</a>
            <a href="#" className="hover:underline">About</a>
          </nav>
          <button
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="md:hidden p-1 -mr-1"
          >
            <Bars3Icon className="h-7 w-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Search + Chips */}
        <div className="px-6 pb-8 max-w-7xl mx-auto">
          <form className="max-w-3xl mx-auto">
            <div className="relative shadow-sm">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search for deals"
                className="w-full rounded-lg pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </form>

          <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
            {chips.map(({ label, slug }) => (
              <Link
                    key={slug}
                    href={{ pathname: "/", query: { q, category: slug } }}
                    shallow
                    className={
                      `bg-yellow-400 text-green-900 font-semibold px-5 py-2 rounded-full text-sm ` +
                      (category === slug ? "ring-2 ring-green-700" : "")
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="bg-yellow-400 text-green-900 font-bold px-4 py-2 rounded-full text-lg leading-none"
            >
              …
            </button>
          </div>
        </div>
      </header>

      {/* SIDE DRAWER (mobile) */}
      <aside
        className={`fixed inset-0 z-40 flex transition ${
          menuOpen ? "" : "pointer-events-none"
        }`}
        aria-label="Category drawer"
      >
        <div
          className={`flex-1 bg-black/40 ${
            menuOpen ? "opacity-100" : "opacity-0 transition-opacity duration-200"
          }`}
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={`w-72 max-w-[80%] bg-white shadow-xl p-6 overflow-y-auto transform transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Categories
            </h2>
            <button onClick={() => setMenuOpen(false)} aria-label="Close">
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          <ul className="space-y-3">
            {chips.map(({ label, slug }) => (
              <li key={slug}>
              <Link
                    key={slug}
                    href={{ pathname: "/", query: { q, category: slug } }}
                    shallow
                    className={
                      `bg-yellow-400 text-green-900 font-semibold px-5 py-2 rounded-full text-sm ` +
                      (category === slug ? "ring-2 ring-green-700" : "")
                    }
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
              </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* PRODUCT GRID */}
      <section className="px-6 py-10">
        {loading ? (
          <p className="text-gray-600">Loading…</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-gray-600">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Contact us</h4>
            <p>support@komprice.com</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Compare prices</h4>
            <p>Popular products</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Customer service</h4>
            <p>FAQs • Help center</p>
          </div>
        </div>
      </footer>
    </main>
  );
}











// /* ----------------------------------------------------------------
//  *  Komprice – Home page
//  *  Matches the 03-May-2025 mock-up (full-width grid, hamburger menu,
//  *  search pill, yellow chips, off-canvas category drawer).
//  * ----------------------------------------------------------------*/
// "use client";

// import { useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import ProductCard from "@/components/ui/ProductCard";
// import { searchProducts } from "@/lib/api";
// import type { Product } from "@/types/product";

// import {
//   Bars3Icon,
//   XMarkIcon,
//   MagnifyingGlassIcon,
// } from "@heroicons/react/24/outline"; //  npm i @heroicons/react

// export default function Home() {
//   const params = useSearchParams();
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [menuOpen, setMenuOpen] = useState(false); // ← hamburger state

//   const q        = params.get("q") ?? "";
//   const category = params.get("category") ?? undefined;

//   // inside Home()
// // const chips = [
// //   { label: "Phones & Tablets", slug: "phones-tablets" },
// //   { label: "Home & Kitchen",   slug: "home-office"    },
// //   { label: "Electronics",      slug: "electronics"   },
// //   // …etc
// // ];


//   /* --- fetch products ---------------------------------------------------- */
//   useEffect(() => {
//     const fetch = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const results = await searchProducts({ q, category, limit: 500 });
//         setProducts(results);
//       } catch (err) {
//         setError("Failed to load products.");
//         console.error("❌ Error loading products:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetch();
//   }, [q, category]);

//   /* --- view -------------------------------------------------------------- */
//   return (
//     <main className="min-h-screen bg-white text-gray-900">
//       {/* ───────────── HEADER ───────────── */}
//       <header className="bg-green-700 text-white relative z-20">
//         {/* top bar */}
//         <div className="flex items-center justify-between px-6 py-4">
//           <h1 className="text-2xl font-bold">Komprice</h1>

//           {/* desktop nav */}
//           <nav className="hidden md:flex gap-8 text-sm">
//             <a href="#" className="hover:underline">Compare</a>
//             <a href="#" className="hover:underline">About</a>
//           </nav>

//           {/* hamburger (mobile only) */}
//           <button
//             aria-label="Open menu"
//             onClick={() => setMenuOpen(true)}
//             className="md:hidden p-1 -mr-1"
//           >
//             <Bars3Icon className="h-7 w-7 stroke-[2.5]" />
//           </button>
//         </div>

//         {/* search + chips */}
//         <div className="px-6 pb-8 max-w-7xl mx-auto">
//           {/* search field */}
//           <form className="max-w-3xl mx-auto">
//             <div className="relative shadow-sm">
//               <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
//               <input
//                 type="text"
//                 name="q"
//                 defaultValue={q}
//                 placeholder="Search for deals"
//                 className="w-full rounded-lg pl-12 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
//               />
//             </div>
//           </form>

//           {/* category chips */}
//           <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
//             {["Phones", "Laptops", "Fashion"].map((lbl) => (
//               <a
//                 key={lbl}
//                 href={`/?category=${encodeURIComponent(lbl.toLowerCase())}`}
//                 className="bg-yellow-400 text-green-900 font-semibold px-5 py-2 rounded-full text-sm"
//               >
//                 {lbl}
//               </a>
//             ))}

//             {/* “more” → open drawer */}
//             <button
//               type="button"
//               onClick={() => setMenuOpen(true)}
//               className="bg-yellow-400 text-green-900 font-bold px-4 py-2 rounded-full text-lg leading-none"
//             >
//               …
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* ───────────── SIDE DRAWER ───────────── */}
//       <aside
//         className={`fixed inset-0 z-40 flex transition ${menuOpen ? "" : "pointer-events-none"}`}
//         aria-label="Category drawer"
//       >
//         {/* backdrop */}
//         <div
//           className={`flex-1 bg-black/40 ${menuOpen ? "opacity-100" : "opacity-0 transition-opacity duration-200"}`}
//           onClick={() => setMenuOpen(false)}
//         />

//         {/* panel */}
//         <div
//           className={`w-72 max-w-[80%] bg-white shadow-xl p-6 overflow-y-auto transform transition-transform duration-300 ${
//             menuOpen ? "translate-x-0" : "translate-x-full"
//           }`}
//         >
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-lg font-semibold text-gray-800">Categories</h2>
//             <button onClick={() => setMenuOpen(false)} aria-label="Close">
//               <XMarkIcon className="w-6 h-6 text-gray-600" />
//             </button>
//           </div>

//           {/* hard-coded list for now – replace with API when ready */}
//           <ul className="space-y-3">
//             {[
//               "Phones & Tablets",
//               "Laptops",
//               "Fashion",
//               "Home & Kitchen",
//               "Electronics",
//               "Beauty",
//               "Groceries",
//               "Toys",
//             ].map((c) => (
//               <li key={c}>
//                 <a
//                   href={`/?category=${encodeURIComponent(c.toLowerCase())}`}
//                   className="block px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700"
//                   onClick={() => setMenuOpen(false)}
//                 >
//                   {c}
//                 </a>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </aside>

//       {/* ───────────── PRODUCT GRID ───────────── */}
//       <section className="px-6 py-10">
//         {loading ? (
//           <p className="text-gray-600">Loading…</p>
//         ) : error ? (
//           <p className="text-red-500">{error}</p>
//         ) : products.length === 0 ? (
//           <p className="text-gray-600">No products found.</p>
//         ) : (
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
//             {products.map((p, i) => {
//               try {
//                 return <ProductCard key={p.id} product={p} />;
//               } catch (err) {
//                 console.error(`❌ Error rendering product[${i}]`, p, err);
//                 return (
//                   <div className="text-red-500 text-sm" key={i}>
//                     ❌ Error rendering product card.
//                   </div>
//                 );
//               }
//             })}
//           </div>
//         )}
//       </section>

//       {/* ───────────── FOOTER ───────────── */}
//       <footer className="bg-gray-900 text-white py-10">
//         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
//           <div>
//             <h4 className="font-semibold mb-2">Contact us</h4>
//             <p>support@komprice.com</p>
//           </div>
//           <div>
//             <h4 className="font-semibold mb-2">Compare prices</h4>
//             <p>Popular products</p>
//           </div>
//           <div>
//             <h4 className="font-semibold mb-2">Customer service</h4>
//             <p>FAQs • Help center</p>
//           </div>
//         </div>
//       </footer>
//     </main>
//   );
// }
