"use client";

import { useState, useTransition } from "react";
import { addBookAction } from "@/app/actions/books";
import { ALL_CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";
import { Header } from "@/components/ui/Header";
import { UploadButton } from "@/lib/uploadthing";
import { Plus, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface VendorBooksFormProps {
  vendorId: string;
}

export function VendorBooksForm({ vendorId }: VendorBooksFormProps) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [addedBooks, setAddedBooks] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAddBook(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (imageUrl) formData.set("imageUrl", imageUrl);

    startTransition(async () => {
      try {
        await addBookAction(formData);
        // Note: Si addBookAction redirige, le code suivant ne sera pas exécuté
        setAddedBooks((prev) => [...prev, formData.get("name") as string]);
        form.reset();
        setImageUrl("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Une erreur est survenue");
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <Header />
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-200 text-sm font-medium text-emerald-800">1</span>
          <span className="h-0.5 w-12 bg-emerald-300" />
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-200 text-sm font-medium text-emerald-800">2</span>
          <span className="h-0.5 w-12 bg-emerald-300" />
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">3</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-stone-900">Ampiana boky</h1>
          <p className="mt-2 text-sm text-stone-500">Dingana 3: Mamorona catalogue</p>

          {addedBooks.length > 0 && (
            <div className="mt-4 rounded-lg bg-emerald-50 p-3">
              <p className="text-sm font-medium text-emerald-800">Boky voampiana:</p>
              <ul className="mt-1 space-y-1">
                {addedBooks.map((name) => (
                  <li key={name} className="flex items-center gap-2 text-sm text-emerald-700">
                    <Check className="h-3 w-3" /> {name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleAddBook} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">Anaran&apos;ny boky</label>
              <input
                name="name"
                required
                className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Vidiny (Ar)</label>
                <input
                  name="buyPrice"
                  type="number"
                  required
                  min={0}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Fanofana (Ar)</label>
                <input
                  name="rentPrice"
                  type="number"
                  required
                  min={0}
                  className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">Karazana</label>
              <select
                name="category"
                required
                className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">Famariparitana</label>
              <textarea
                name="description"
                rows={3}
                className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700">Sary</label>
              <div className="mt-2">
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt="Preview" className="mb-2 h-32 rounded-lg object-cover" />
                )}
                <UploadButton
                  endpoint="bookImage"
                  onClientUploadComplete={(res) => {
                    if (res?.[0]?.url) setImageUrl(res[0].url);
                  }}
                  onUploadError={(err) => setError(err.message)}
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-emerald-700 py-3 font-medium text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {isPending ? "Miandry..." : "Ampiana boky"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => router.push("/vendeur")}
            className="mt-4 w-full rounded-xl bg-emerald-700 py-3 font-medium text-white hover:bg-emerald-800 transition-colors"
          >
            Vitaina sy hiditra dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
