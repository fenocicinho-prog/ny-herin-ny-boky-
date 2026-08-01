import Stripe from "stripe";

let  stripeInstance: Stripe | null = null;

export function getStripe() {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not defined in the environnement variables");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    });
  }
  return stripeInstance;
}

export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: "FREE",
    nameKey: "plan_1_book", // Clé de traduction
    price: 0,
    descriptionKey: "plan_1_book_desc", // Clé de traduction
    featuresKeys: [
      "feature_1_book",
      "feature_dashboard"
    ],
    buttonTextKey: "btn_choose_free",
    buttonColor: "bg-gray-700 hover:bg-gray-800"
  },
  TWENTY_BOOKS: {
    id: "TWENTY_BOOKS",
    nameKey: "plan_20_books",
    price: 25000,
    maxBooks: 20,
    descriptionKey: "plan_20_books_desc",
    buttonTextKey: "btn_pay_stripe",
    buttonColor: "bg-red-600 hover:bg-red-700"
  },
  UNLIMITED: {
    id: "UNLIMITED",
    nameKey: "plan_unlimited",
    price: 50000,
    maxBooks: Infinity,
    descriptionKey: "plan_unlimited_desc",
    buttonTextKey: "btn_pay_stripe",
    buttonColor: "bg-red-600 hover:bg-red-700"
  },
} as const;

export const MOBILE_MONEY_PHONE =
  process.env.MOBILE_MONEY_PHONE || "+261 34 21 746 39";
