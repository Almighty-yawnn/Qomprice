import Image from "next/image";
import type { Product } from "@/types/product";

export default function ProductCard({ product }: { product: Product }) {
  const firstListing = product.listings[0];

  return (
    <a
    href={
     firstListing?.affiliate_url
             ? `${firstListing.affiliate_url}`
             : "#"
         }
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition"
    >
      {/* 1️⃣ square wrapper guarantees height before the Image mounts */}
      <div className="relative w-full h-0 pb-[100%] rounded-md overflow-hidden bg-white">
        {firstListing?.image_url ? (
        <Image
            src={firstListing.image_url}
            alt={product.title}
            fill
            unoptimized
            referrerPolicy="no-referrer"
        />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        )}
      </div>

      <h3 className="text-xs font-medium text-gray-900 mt-3 line-clamp-2 min-h-[2.8rem]">
        {product.title}
      </h3>

      <p className="text-sm font-bold text-gray-800 mt-1">
        {(firstListing?.currency ?? "GH₵") +
          " " +
          (typeof firstListing?.price === "number"
            ? firstListing.price.toLocaleString()
            : "N/A")}
      </p>
    </a>
  );
}
