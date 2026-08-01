"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Upload } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { addBookAction } from "@/app/actions/books";
import { CATEGORY_LIST } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";

type FormState = {
  error?: string;
  redirect?: string;
} | null;

const COMMISSION_RATE = 0.10;

export function AddBookForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const [rentPrice, setRentPrice] = useState<number>(0);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (prev, formData: FormData) => {
      if (imageUrl) formData.set("imageUrl", imageUrl);
      const result = await addBookAction(formData);
      return result ?? null;
    },
    null
  );
  useEffect(() => {
    // 3. Maintenant TypeScript sait que state peut avoir .redirect
    if (state?.redirect) {
      router.push(state.redirect);
    }
  }, [state, router]);

  const buyCommission = buyPrice * COMMISSION_RATE;
  const buyGain = buyPrice - buyCommission;
  const rentCommission = rentPrice * COMMISSION_RATE;
  const rentGain = rentPrice - rentCommission;

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700">
          {t("book.title")}
        </label>
        <input
          name="title"
          required
          placeholder={t("book.titlePlaceholder")}
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          {t("book.description")}
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder={t("book.descriptionPlaceholder")}
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-stone-700">
            {t("book.buyPrice")}
          </label>
          <input
            name="buyPrice"
            type="number"
            min={0}
            onChange={(e) => setBuyPrice(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
          />
          {buyPrice > 0 && (
            <div className="mt-2 text-xs text-stone-500 bg-stone-50 p-2 rounded">
              <div>{t("admin.commission")}: {buyCommission.toLocaleString()} Ar</div>
              <div className="font-bold text-green-700">Hazo: {buyGain.toLocaleString()} Ar</div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">
            {t("book.rentPrice")}
          </label>
          <input
            name="rentPrice"
            type="number"
            min={0}
            onChange={(e) => setRentPrice(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
          />
          {rentPrice > 0 && (
            <div className="mt-2 text-xs text-stone-500 bg-stone-50 p-2 rounded">
              <div>{t("admin.commission")}: {rentCommission.toLocaleString()} Ar</div>
              <div className="font-bold text-green-700">Hazo: {rentGain.toLocaleString()} Ar</div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          {t("book.category")}
        </label>
        <select
          name="category"
          required
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        >
          {CATEGORY_LIST.map((cat) => (
            <option key={cat} value={cat}>
              {t(`categories.${cat}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          {t("book.imageUrl")}
        </label>
        <div className="mt-2">
          {imageUrl ? (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800">
              <Check className="h-4 w-4" />
              ✓ {t("book.submit")}
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
                      {t("book.imageUrl")}
                    </span>
                  ) : (
                    t("payment.loading")
                  );
                },
              }}
            />
          )}
        </div>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-700 py-3 font-medium text-white hover:bg-amber-800 disabled:opacity-50"
      >
        {pending ? t("book.submitLoading") : t("book.submit")}
      </button>
    </form>
  );
}
