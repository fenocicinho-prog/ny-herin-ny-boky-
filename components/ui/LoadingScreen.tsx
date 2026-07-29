"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // On simule un temps de chargement ou on attend que l'app soit prête
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // 2 secondes comme sur beaucoup d'apps

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#4a0404]">
      <div className="relative h-40 w-40 animate-pulse">
        <Image
          src="/logo-ny-herin-ny-boky.png"
          alt="Ny Herin' ny Boky Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="mt-8 flex space-x-2">
        <div className="h-2 w-2 animate-bounce rounded-full bg-yellow-400 [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-green-500 [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-white"></div>
      </div>
    </div>
  );
}
