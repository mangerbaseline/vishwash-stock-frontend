"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StockCard {
  name: string;
  value: number;
  change: number;
}

export default function PortfolioCarousel({ topCards }: { topCards: StockCard[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
  });

  return (
<div className="relative py-4">
  <div ref={emblaRef} className="overflow-hidden">
    <div className="flex gap-4">
      {topCards.map((item, i) => (
        <div
          key={i}
          className="flex-[0_0_240px] flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
                       <h3 className="text-lg font-semibold dark:text-white">{item.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">Total Share</p>
              <p className="text-xl font-bold dark:text-white">${item.value}</p>
              <div
                className={`inline-flex items-center mt-2 px-2 py-1 rounded text-xs font-medium ${
                  item.change > 0
                    ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                    : "text-red-500 bg-red-50 dark:bg-red-900/20"
                }`}
              >
                {item.change > 0 ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {Math.abs(item.change)}%
              </div>
        </div>
      ))}
    </div>
  </div>

  {/* Left Arrow */}
  <button
    onClick={() => emblaApi?.scrollPrev()}
    className="absolute -left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow z-10"
  >
    <ArrowLeft className="w-4 h-4" />
  </button>

  {/* Right Arrow */}
  <button
    onClick={() => emblaApi?.scrollNext()}
    className="absolute -right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow z-10"
  >
    <ArrowRight className="w-4 h-4" />
  </button>
</div>



//     <div className="relative">
//       {/* Slider viewport */}
//       <div ref={emblaRef} className="overflow-hidden">
//         {/* Embla container */}
//         <div className="flex gap-4">
//           {topCards.map((item, i) => (
//             <div
//               key={i}
//               className="flex-[0_0_240px] flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
//             >
//               <h3 className="text-lg font-semibold dark:text-white">{item.name}</h3>
//               <p className="text-sm text-gray-500 dark:text-gray-300 mt-2">Total Share</p>
//               <p className="text-xl font-bold dark:text-white">${item.value}</p>
//               <div
//                 className={`inline-flex items-center mt-2 px-2 py-1 rounded text-xs font-medium ${
//                   item.change > 0
//                     ? "text-green-500 bg-green-50 dark:bg-green-900/20"
//                     : "text-red-500 bg-red-50 dark:bg-red-900/20"
//                 }`}
//               >
//                 {item.change > 0 ? (
//                   <ArrowUpRight className="w-3 h-3 mr-1" />
//                 ) : (
//                   <ArrowDownRight className="w-3 h-3 mr-1" />
//                 )}
//                 {Math.abs(item.change)}%
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Left Arrow */}
//       <button
//         onClick={() => emblaApi?.scrollPrev()}
//         className="absolute -left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow"
//       >
//         <ArrowLeft className="w-4 h-4" />
//       </button>

//       {/* Right Arrow */}
//       <button
//         onClick={() => emblaApi?.scrollNext()}
//         className="absolute -right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow"
//       >
//         <ArrowRight className="w-4 h-4" />
//       </button>
//     </div>
  );
}
