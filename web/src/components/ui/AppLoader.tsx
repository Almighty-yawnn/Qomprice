// src/components/ui/AppLoader.tsx
import React from 'react';

const AppLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 backdrop-blur-sm transition-opacity duration-300 ease-in-out">
      <h1 className="mb-6 text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight">
        <span className="bg-gradient-to-r from-lime-400 via-green-500 to-emerald-700 bg-clip-text text-transparent">
          Komprice
        </span>
      </h1>
      <div className="w-3/4 sm:w-1/2 md:w-1/3 max-w-xs h-2.5 sm:h-3 bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-lime-400 via-green-500 to-emerald-700 bg-[length:300%_300%] animate-gradient-flow animate-loader-fill"
          style={{
            // animationDelay: '0.1s', // Optional small delay for the bar fill
          }}
        ></div>
      </div>
      <p className="mt-5 text-sm text-emerald-300">Loading your experience...</p>
    </div>
  );
};

export default AppLoader;