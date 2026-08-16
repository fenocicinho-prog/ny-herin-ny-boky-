"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-amber-800 p-4">
        <Image
          src="/icon.png"
          alt="Ny Herin' ny Boky Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="mt-8 flex space-x-2">
        <div className="h-2 w-2 animate-bounce rounded-full bg-amber-800 [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-amber-600 [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 animate-bounce rounded-full bg-amber-400"></div>
      </div>
    </div>
  );
}