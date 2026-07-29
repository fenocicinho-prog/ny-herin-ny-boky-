"use client";
import { useState } from "react";
import { CreditCard, Smartphone } from "lucide-react";
import { createOrderAction } from "@/app/actions/orders";
import { MOBILE_MONEY_PHONE } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";
import type { BookWithVendor } from "./BookGrid";

interface BookActionsProps {
  book: BookWithVendor;
}

export function BookActions({ book }: BookActionsProps) {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [orderType, setOrderType] = useState<"BUY" | "BORROW">("BUY");
  const [paymentMethod, setPaymentMethod] = useState<"STRIPE" | "MOBILE_MONEY">(
    "MOBILE_MONEY"
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const openModal = (type: "BUY" | "BORROW") => {
    setOrderType(type);
    setShowModal(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (paymentMethod === "STRIPE") {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bookId: book.id,
          type: orderType,
          price: orderType === "BUY" ? book.buyPrice : book.rentPrice
         }),
      });
      const { url, error } = await res.json();
      if (error) setError(error);
      if (url) window.location.href = url;
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.set("bookId", book.id);
    formData.set("type", orderType);
    formData.set("paymentMethod", paymentMethod);
    if (phoneNumber) formData.set("phoneNumber", phoneNumber);

    const result = await createOrderAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-4 flex gap-2">
        {book.buyPrice != null && book.buyPrice > 0 && (
          <button
            onClick={() => openModal("BUY")}
            className="flex-1 rounded-lg bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-800"
          >
            {t("bookCard.buy")}
          </button>
        )}
        {book.rentPrice != null && book.rentPrice > 0 && (
          <button
            onClick={() => openModal("BORROW")}
            className="flex-1 rounded-lg border border-amber-300 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50"
          >
            {t("bookCard.borrow")}
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-stone-900">
              {orderType === "BUY" ? t("payment.title") : t("payment.borrowTitle")} — {book.title}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-700">
                  {t("payment.mobileMoney")}
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("MOBILE_MONEY")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm ${
                      paymentMethod === "MOBILE_MONEY"
                        ? "border-amber-500 bg-amber-50 text-amber-900"
                        : "border-stone-200 text-stone-600"
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    {t("payment.mobileMoney")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("STRIPE")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm ${
                      paymentMethod === "STRIPE"
                        ? "border-amber-500 bg-amber-50 text-amber-900"
                        : "border-stone-200 text-stone-600"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    {t("payment.online")}
                  </button>
                </div>
              </div>

              {paymentMethod === "MOBILE_MONEY" && (
                <>
                  <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                    {t("order.sendTo")}: <strong>{MOBILE_MONEY_PHONE}</strong>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-700">
                      {t("order.phone")}
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+261 34 XX XXX XX"
                      required
                      className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-50"
                >
                  {t("payment.cancelled")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-50"
                >
                  {loading ? t("payment.loading") : t("payment.confirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
