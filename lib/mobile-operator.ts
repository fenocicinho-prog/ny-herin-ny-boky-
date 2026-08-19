export type MobileOperator = "TELMA" | "ORANGE" | "AIRTEL" | "UNKNOWN";

/** Normalise un numéro malgache en format local 0XXXXXXXXX */
function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("261")) digits = digits.slice(3);
  if (!digits.startsWith("0")) digits = `0${digits}`;
  return digits;
}

/** 034/038 = Telma (MVola) · 032/037 = Orange Money · 033 = Airtel Money */
export function detectOperator(rawPhone: string): MobileOperator {
  const prefix = normalizePhone(rawPhone).slice(0, 3);
  if (prefix === "034" || prefix === "038") return "TELMA";
  if (prefix === "032" || prefix === "037") return "ORANGE";
  if (prefix === "033") return "AIRTEL";
  return "UNKNOWN";
}

export function operatorLabel(operator: MobileOperator): string {
  switch (operator) {
    case "TELMA": return "MVola (Telma)";
    case "ORANGE": return "Orange Money";
    case "AIRTEL": return "Airtel Money";
    default: return "votre opérateur";
  }
}

export function operatorTheme(operator: MobileOperator) {
  switch (operator) {
    case "TELMA": return { from: "from-red-600", to: "to-orange-600" };
    case "ORANGE": return { from: "from-orange-500", to: "to-orange-700" };
    case "AIRTEL": return { from: "from-red-700", to: "to-red-900" };
    default: return { from: "from-stone-500", to: "to-stone-700" };
  }
}

/**
 * Construit le lien tel: avec le code USSD pré-rempli (destinataire + montant).
 * Le client appuie sur "Appeler" (ou ça se lance tout seul) puis tape SON code
 * secret sur l'écran natif du téléphone — cette étape ne peut pas et ne doit
 * jamais transiter par le web, pour sa sécurité.
 *
 * ⚠️ Ces chemins de menu sont ceux publiés par les opérateurs mi-2026. Ils
 * changent parfois de structure — teste avec un vrai petit transfert avant
 * de mettre en prod, et ajuste si besoin.
 */
export function buildUssdLink(
  operator: MobileOperator,
  destinationNumber: string,
  amount: number
): string | null {
  const dest = normalizePhone(destinationNumber);
  const amt = Math.round(amount);
  let code: string | null = null;

  switch (operator) {
    case "TELMA":  // MVola: #111*1*2*numero*montant#
      code = `#111*1*2*${dest}*${amt}#`;
      break;
    case "ORANGE": // Orange Money: #144*1*3*numero*montant#
      code = `#144*1*3*${dest}*${amt}#`;
      break;
    case "AIRTEL": // Airtel Money: *436*2*1*numero*montant#
      code = `*436*2*1*${dest}*${amt}#`;
      break;
    default:
      return null;
  }

  return `tel:${encodeURIComponent(code)}`; // encode les # pour le lien tel:
}