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
    name: "1 boky",
    price: 0,
    description: "Partagez 1 livre sur la plateforme",
    features: [
      "Mandafo boky 1",
      "Dashboard mpivarotra"
    ],
    buttonText: "Safidio maimaimpoana",
    buttoncolor: "bg-gray-700 hover:bg-gray-800"
  },
  TWENTY_BOOKS: {
    name: "20 Boky",
    price: 25000,
    maxBooks: 20,
    description: "Partagez jusqu'à 20 livres sur la plateforme",
    buttonText: "Mandoa amin'ny stripe",
    buttoncolor: "bg-red-600 hover:bg-red-700"
  },
  UNLIMITED: {
    name: "Illimité",
    price: 50000,
    maxBooks: Infinity,
    description: "Partagez un nombre illimité de livres",
    buttonText: "Mandoa amin'ny stripe",
    buttoncolor: "bg-red-600 hover:bg-red-700"
    
  },
} as const;

export const MOBILE_MONEY_PHONE =
  process.env.MOBILE_MONEY_PHONE || "+261 34 21 746 39";
