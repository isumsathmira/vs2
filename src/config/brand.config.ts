export interface BrandConfig {
  name: string;
  tagline: string;
  description: string;
  country: string;
  defaultLocale: string;
  currency: {
    code: string;
    symbol: string;
    label: string;
  };
  contact: {
    supportPhone: string;
    supportEmail: string;
    phonePrefix: string;
  };
  limits: {
    maxAssignedProviders: number;
    maxQuoteSubmissions: number;
    maxRequestImages: number;
  };
  supportedDistricts: string[];
}

export const brandConfig: BrandConfig = {
  name: "Fixora",
  tagline: "Reliable Local Services at Your Fingertips",
  description: "Connect directly with verified Sri Lankan professionals for home and commercial repairs, maintenance, and installations.",
  country: "Sri Lanka",
  defaultLocale: "en-LK",
  currency: {
    code: "LKR",
    symbol: "Rs.",
    label: "LKR (Sri Lankan Rupee)",
  },
  contact: {
    supportPhone: "+94 11 234 5678",
    supportEmail: "support@fixora.lk",
    phonePrefix: "+94",
  },
  limits: {
    maxAssignedProviders: 3,
    maxQuoteSubmissions: 3,
    maxRequestImages: 5,
  },
  supportedDistricts: [
    "Colombo",
    "Gampaha",
    "Kalutara",
    "Kandy",
    "Matale",
    "Nuwara Eliya",
    "Galle",
    "Matara",
    "Hambantota",
    "Jaffna",
    "Kilinochchi",
    "Mannar",
    "Vavuniya",
    "Mullaitivu",
    "Batticaloa",
    "Ampara",
    "Trincomalee",
    "Kurunegala",
    "Puttalam",
    "Anuradhapura",
    "Polonnaruwa",
    "Badulla",
    "Monaragala",
    "Ratnapura",
    "Kegalle",
  ],
};

/**
 * Validates Sri Lankan mobile phone numbers:
 * Accepts +94 7X XXX XXXX, 07X XXX XXXX, or raw 947XXXXXXXX / 07XXXXXXXX
 */
export function isValidSriLankanPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  const slPhoneRegex = /^(?:\+94|0094|0)?7[0-9]{8}$/;
  return slPhoneRegex.test(cleaned);
}

/**
 * Standardizes any valid phone number to international format +947XXXXXXXX
 */
export function formatSriLankanPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+94")) return cleaned;
  if (cleaned.startsWith("0094")) return `+${cleaned.slice(2)}`;
  if (cleaned.startsWith("0")) return `+94${cleaned.slice(1)}`;
  if (cleaned.startsWith("7")) return `+94${cleaned}`;
  return phone;
}

/**
 * Currency formatter for LKR
 */
export function formatLKR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rs. 0";
  return `${brandConfig.currency.symbol} ${Number(amount).toLocaleString("en-LK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
