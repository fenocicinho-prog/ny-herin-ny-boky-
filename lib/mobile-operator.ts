export type MobileOperator = "TELMA" | "ORANGE" | "AIRTEL" | "UNKNOWN";

const PREFIX_MAP: Record<string, MobileOperator> = {
  "034": "TELMA",
  "038": "TELMA",
  "032": "ORANGE",
  "037": "ORANGE",
  "033": "AIRTEL",
};

function normalize(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("261")) return "0" + digits.slice(3);
  if (digits.startsWith("0")) return digits;
  return "0" + digits;
}

export function detectOperator(phone: string): MobileOperator {
  const local = normalize(phone);
  const prefix = local.slice(0, 3);
  return PREFIX_MAP[prefix] ?? "UNKNOWN";
}

/**
 * ⚠️ Codes USSD à VÉRIFIER avec un vrai téléphone avant mise en prod.
 */
export function buildUssdLink(operator: MobileOperator, recipientNumber: string, amount: number): string {
  const recipient = normalize(recipientNumber);
  const amt = Math.round(amount);

  switch (operator) {
    case "TELMA":
      return `tel:*111*1*1*${recipient}*${amt}%23`;
    case "ORANGE":
      return `tel:%23144*1*${recipient}*${amt}%23`;
    case "AIRTEL":
      return `tel:*436*${recipient}*${amt}%23`;
    default:
      return `tel:${recipient}`;
  }
}

export function operatorLabel(operator: MobileOperator): string {
  return {
    TELMA: "Telma (Mvola)",
    ORANGE: "Orange Money",
    AIRTEL: "Airtel Money",
    UNKNOWN: "Opérateur non reconnu",
  }[operator];
}

export function operatorTheme(operator: MobileOperator) {
  switch (operator) {
    case "TELMA":
      return { from: "from-amber-500", to: "to-amber-700", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300" };
    case "ORANGE":
      return { from: "from-orange-500", to: "to-orange-700", text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-300" };
    case "AIRTEL":
      return { from: "from-red-500", to: "to-red-700", text: "text-red-700", bg: "bg-red-50", border: "border-red-300" };
    default:
      return { from: "from-stone-400", to: "to-stone-600", text: "text-stone-700", bg: "bg-stone-50", border: "border-stone-300" };
  }
}