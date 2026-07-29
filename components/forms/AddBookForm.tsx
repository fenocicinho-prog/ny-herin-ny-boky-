"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Upload } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { addBookAction } from "@/app/actions/books";
import { CATEGORY_LIST, CATEGORY_LABELS } from "@/lib/constants";


export function AddBookForm() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; redirect?: string } | null, formData: FormData) => {
      if (imageUrl) formData.set("imageUrl", imageUrl);
      const result = await addBookAction(formData);
      return result ?? null;
    },
    null
  );

  // L'action redirige automatiquement vers le dashboard après succès
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700">
          Anaran&apos;ny boky
        </label>
        <input
          name="name"
          required
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          Famaritana
        </label>
        <textarea
          name="description"
          rows={3}
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-stone-700">
            Vidiny hividy (Ar)
          </label>
          <input
            name="buyPrice"
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">
            Vidiny hiray (Ar)
          </label>
          <input
            name="rentPrice"
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          Sokajy
        </label>
        <select
          name="category"
          required
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        >
          {CATEGORY_LIST.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          Sary
        </label>
        <div className="mt-2">
          {imageUrl ? (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
              <Check className="h-4 w-4" />
              Sary voafafy
            </div>
          ) : (
            <UploadButton
              endpoint="bookImage"
              onClientUploadComplete={(res) => {
                const file = res?.[0];
                if (file?.url) setImageUrl(file.url);
                else if (file?.ufsUrl) setImageUrl(file.ufsUrl);
              }}
              onUploadError={(error) => {
                console.error("Upload error:", error);
              }}
              appearance={{
                button:
                  "bg-amber-700 text-white px-4 py-2 rounded-lg text-sm ut-uploading:opacity-50",
                allowedContent: "text-stone-400 text-xs",
              }}
              content={{
                button({ ready }) {
                  return ready ? (
                    <span className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Ampidiro sary
                    </span>
                  ) : (
                    "Miandry..."
                  );
                },
              }}
            />
          )}
        </div>
      </div>

      {/* Les erreurs sont gérées par les redirections ou les alertes globales */}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-700 py-3 font-medium text-white hover:bg-amber-800 disabled:opacity-50"
      >
        {pending ? "Miandry..." : "Ampidiro ny boky"}
      </button>
    </form>
  );
}
