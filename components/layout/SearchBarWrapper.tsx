"use client";

import { Suspense } from "react";
import { SearchBar } from "./SearchBar";

interface SearchBarWrapperProps {
  defaultValue?: string;
  placeholder?: string;
}

export function SearchBarWrapper(props: SearchBarWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="h-12 w-full animate-pulse rounded-xl bg-amber-100" />
      }
    >
      <SearchBar {...props} />
    </Suspense>
  );
}
