"use client";

import Link from "next/link";
import { Store, UserPlus, LogIn } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SearchBarWrapper } from "@/components/layout/SearchBarWrapper";
import { BookGrid, type BookWithVendor } from "@/components/books/BookGrid";
import { VendorCard } from "@/components/vendors/VendorCard";
import { useLanguage } from "@/lib/LanguageContext";
import { SITE_NAME } from "@/lib/constants";

interface VendorType {
  id: string;
  companyName: string | null;
  location: string | null;
  books: { id: string }[];
}

interface HomePageClientProps {
  books: BookWithVendor[];
  vendors: VendorType[];
}

export default function HomePageClient({ books, vendors }: HomePageClientProps) {
  const { t } = useLanguage();

  return (
    <h1> alovy aloha ilay 50,000 ar ko de le vidin'ny nom de domaine 80,000 ar Zay vao omeko anao tanteraka n'y site</h1>
  );
}