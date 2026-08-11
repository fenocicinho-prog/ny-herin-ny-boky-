import { searchBooksAction, getVendors } from "@/app/actions/orders"; // ajuste le chemin selon où sont réellement ces fonctions
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  const [books, vendors] = await Promise.all([
    searchBooksAction(""),
    getVendors(),
  ]);

  return <HomePageClient books={books} vendors={vendors} />;
}