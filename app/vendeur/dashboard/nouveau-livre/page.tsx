import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { AddBookForm } from "@/components/forms/AddBookForm";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function VendorBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "VENDOR") redirect("/inscription/vendeur");
  if (!isSubscriptionValid(user)) redirect("/vendeur/dashboard/abonnement");

  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header user={user} />
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="mb-2 text-center text-2xl font-bold text-stone-900">
          Ampidiro ny bokinao
        </h1>
        <p className="mb-8 text-center text-stone-500">
          Manampy boky
        </p>

        {params.success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-center text-sm text-green-800">
            Ampidiro ny bokinao izao.
          </div>
        )}

        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <AddBookForm />
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/vendeur"
            className="text-sm text-amber-700 hover:underline"
          >
            Mandeha any amin&apos;ny dashboard →
          </Link>
        </p>
      </main>
    </div>
  );
}
