// src/components/ui/ProductCard.tsx
import Image from "next/image";
import type { Product, VendorListing } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onCompareClick?: (product: Product) => void;
}

export default function ProductCard({ product, onCompareClick }: ProductCardProps) {
  const firstListing: VendorListing | null =
    product.listings && product.listings.length > 0 ? product.listings[0] : null;

  const productName = product.title || product.name || "Product";
  const displayPrice = firstListing?.price ?? product.price;
  const displayCurrency = firstListing?.currency ?? "GH₵";

  let storeInfo = "N/A";
  if (firstListing?.store_name) {
    storeInfo = firstListing.store_name;
  } else if (product.seller) {
    storeInfo = product.seller;
  } else if (firstListing?.site_id) {
    storeInfo = `Site ID: ${firstListing.site_id}`;
  }

  const siteIdBadge = firstListing?.site_id;

  const mainImageSrc = product.imageUrl || firstListing?.image_url || null;
  const listingImageSrc = firstListing?.image_url || null;
  const showListingThumbnail =
    mainImageSrc && listingImageSrc && mainImageSrc !== listingImageSrc;

  const handleCompareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onCompareClick) {
      onCompareClick(product);
    }
  };

  let productUrl = "#";
  if (firstListing?.affiliate_url) {
    if (
      firstListing.affiliate_url.startsWith("http://") ||
      firstListing.affiliate_url.startsWith("https://")
    ) {
      productUrl = firstListing.affiliate_url;
    } else {
      const baseUrl = "https://www.jumia.com.gh"; // Example, adjust
      productUrl = `${baseUrl}${
        firstListing.affiliate_url.startsWith("/") ? "" : "/"
      }${firstListing.affiliate_url}`;
    }
  }

  // Function to determine badge color based on site ID
  const getSiteIdStyles = (siteId: string | undefined) => {
    switch (siteId?.toLowerCase()) {
      case "jumia":
        return "bg-orange-100 text-orange-700";
      case "telefonika":
        return "bg-blue-100 text-blue-700";
      case "myghmarket":
        return "bg-purple-100 text-purple-700";
      case "shopwice":
        return "bg-green-100 text-green-700";
      case "get4lessghana":
        return "bg-yellow-100 text-yellow-800";
      case "shaqexpress":
        return "bg-red-100 text-red-800";
      case "ishtari":
        return "bg-violet-100 text-green-800";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-lg transition-all duration-200 h-full">
      {siteIdBadge && (
        <div className="mb-2">
          <span
            className={`inline-block text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full ${getSiteIdStyles(siteIdBadge)}`}
          >
             {siteIdBadge}
          </span>
        </div>
      )}

      <a
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col flex-grow"
        aria-label={`View ${productName} from ${storeInfo}`}
      >
        <div className="w-full rounded-md overflow-hidden bg-gray-100 mb-3 relative">
          <div style={{ paddingTop: "100%" }} />
          <div className="absolute inset-0">
            {mainImageSrc ? (
              <Image
                src={mainImageSrc}
                alt={productName}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width:1024px) 22vw, 18vw"
                className="object-contain transition-transform duration-300 group-hover:scale-105"
                unoptimized
                referrerPolicy="no-referrer"
                onError={(e) =>
                  console.error(
                    `Error loading main image for product ${product.id} ('${productName}'): ${mainImageSrc}`,
                    e.currentTarget.naturalWidth === 0
                      ? "Image not found or zero dimensions"
                      : "Other image error"
                  )
                }
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                No Image
              </div>
            )}

            {showListingThumbnail && listingImageSrc && (
              <div
                title={`Image from listing: ${firstListing?.store_name || firstListing?.site_id}`}
                className="absolute bottom-1.5 right-1.5 w-10 h-10 sm:w-12 sm:h-12 border-2 border-white rounded-md overflow-hidden shadow-md z-10 transition-opacity duration-200 group-hover:opacity-75"
              >
                <Image
                  src={listingImageSrc}
                  alt={`Listing image from ${
                    firstListing?.store_name || firstListing?.site_id || "vendor"
                  }`}
                  fill
                  className="object-cover"
                  unoptimized
                  referrerPolicy="no-referrer"
                  onError={(e) =>
                    console.error(
                      `Error loading listing thumbnail for product ${product.id}: ${listingImageSrc}`,
                      e.target
                    )
                  }
                />
              </div>
            )}
          </div>
        </div>

        <h3 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] leading-tight group-hover:text-emerald-600">
          {productName}
        </h3>

        <p className="text-sm sm:text-base font-bold text-gray-900 mt-1">
          {displayCurrency}
          {displayPrice !== undefined && displayPrice !== null
            ? ` ${displayPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : " N/A"}
        </p>

  
      </a>

      {onCompareClick && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={handleCompareClick}
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold py-2 px-3 rounded-md transition-colors duration-150 border border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
            aria-label={`Compare ${productName}`}
          >
            Compare
          </button>
        </div>
      )}
    </div>
  );
}
