// Talks to the Slash KHQR payment API (the one served from the admin panel) SERVER-SIDE,
// so the API key never reaches the browser (Week 12: secrets stay on the server).
// Configure with env: KHQR_API_BASE, KHQR_API_KEY, MERCHANT_ACCOUNT, MERCHANT_NAME.

const BASE = process.env.KHQR_API_BASE || "https://chat.slashaiagent.xyz/api/khqr";
const KEY = process.env.KHQR_API_KEY || "";
const MERCHANT_ACCOUNT = process.env.MERCHANT_ACCOUNT || "hengsokpanhasun@aclebank1";
const MERCHANT_NAME = process.env.MERCHANT_NAME || "CampusShop";
const MERCHANT_CITY = process.env.MERCHANT_CITY || "Siem Reap";

async function call(path: string, method: "POST" | "GET", body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", "X-KHQR-Key": KEY },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json() as Promise<any>;
}

/** Generate a KHQR for an amount (USD) tied to an order reference. */
export function khqrGenerate(amountUsd: number, ref: string) {
  return call("/generate", "POST", {
    account: MERCHANT_ACCOUNT,
    name: MERCHANT_NAME,
    city: MERCHANT_CITY,
    amount: amountUsd,
    currency: "USD",
    store: ref,
  });
}

/** Sandbox: mark a QR paid (classroom testing, no real money). */
export function khqrSimulate(md5: string) {
  return call("/simulate-pay", "POST", { md5 });
}

/** Check if a QR has been paid (sandbox, or real with the configured Bakong token). */
export function khqrCheck(md5: string, real = false) {
  return call(`/check?md5=${md5}${real ? "&real=1" : ""}`, "GET");
}
