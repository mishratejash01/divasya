// ============================================================================
//  DIVASYA — DevPunya partner client (server only)
//  The single place that talks to api.devpunya.com. The partner id is read
//  from the environment and attached here, so it never appears in a bundle.
//
//  Verified against their production API (2026-08-05):
//   · catalog paths are product/pooja and chadawa/getProductListing — the
//     "/partner/" paths in their PDF do not exist.
//   · every call returns { success, error, msg, results }; check success first.
//   · order creation takes NO payment on their side. We collect via Razorpay,
//     then set transaction_status=paid, which fires their WhatsApp confirmation.
//   · users are keyed by phone. login/user/create is create-or-login and is the
//     documented way to refresh an expired JWT: call it again, same phone.
//   · chadawa sankalp is read from the misspelled details.sankalp_deetails —
//     we send that AND the correctly spelt top-level field, per their doc.
// ============================================================================

const NOAUTH = "https://api.devpunya.com/noauth-api/v1";
const AUTH = "https://api.devpunya.com/api/v1";
const PARTNER_ID = process.env.DEVPUNYA_PARTNER_ID || "";
const COUNTRY = "IN"; // their team's instruction: caps

export function dpConfigured(): boolean {
  return Boolean(PARTNER_ID);
}

export class DevpunyaError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 502) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

type Envelope<T> = { success: boolean; error: unknown; msg: string | null; results: T };

/** One guarded call: partner id on, 15s cap, envelope checked. Never hangs. */
async function dp<T>(
  base: string,
  path: string,
  opts: { method?: string; token?: string; body?: unknown } = {}
): Promise<T> {
  if (!PARTNER_ID) throw new DevpunyaError("not_configured", "DevPunya partner id missing", 503);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  let r: Response;
  try {
    r = await fetch(`${base}${path}`, {
      method: opts.method ?? "GET",
      headers: {
        partner_id: PARTNER_ID,
        "Content-Type": "application/json",
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: ctrl.signal,
      cache: "no-store",
    });
  } catch (e) {
    throw new DevpunyaError("unreachable", `DevPunya unreachable: ${(e as Error).message}`);
  } finally {
    clearTimeout(timer);
  }

  let env: Envelope<T>;
  try {
    env = (await r.json()) as Envelope<T>;
  } catch {
    throw new DevpunyaError("bad_response", `DevPunya returned non-JSON (HTTP ${r.status}) for ${path}`);
  }
  if (r.status === 401 || r.status === 403) {
    throw new DevpunyaError("unauthorized", "DevPunya session rejected", 401);
  }
  if (!env.success) {
    const detail =
      typeof env.error === "string"
        ? env.error
        : ((env.error as Record<string, string>)?.error_message ??
           (env.error as Record<string, string>)?.error_code ??
           JSON.stringify(env.error));
    throw new DevpunyaError("api_error", `DevPunya: ${detail}`);
  }
  return env.results;
}

// ---------------------------------------------------------------- catalog

export type DpPackage = {
  id: number; name: string; image?: string | null; price: number;
  currency?: string; description?: string | null;
};
export type DpProduct = {
  id: number | string; name: string; description?: string | null;
  startingAt?: string | null; location?: string | null; mandir_name?: string | null;
  tithi?: string | null; rating?: number | null;
  default_image?: string | null; png_default_image?: string | null;
  images?: string[] | null; packages?: DpPackage[] | null; benefits?: unknown;
  // chadawa listings may carry offerings under one of these keys — shape kept
  // loose on purpose until their catalog is assigned and observable.
  offerings?: DpPackage[] | null;
};
export type DpAddon = {
  id: number; name: string; description?: string | null; image_url?: string | null;
  price: number; optional?: boolean; currency?: string;
};

export const listPujas = () =>
  dp<DpProduct[]>(NOAUTH, `/product/pooja?country_code=${COUNTRY}`);

export const listChadawa = () =>
  dp<DpProduct[]>(NOAUTH, `/chadawa/getProductListing?country_code=${COUNTRY}`);

export const poojaById = (id: number | string) =>
  dp<DpProduct>(NOAUTH, `/product/poojaById?pooja_id=${encodeURIComponent(id)}`);

export const poojaAddons = (poojaId: number | string, packageId: number | string) =>
  dp<DpAddon[]>(NOAUTH, `/pooja_addons?pooja_id=${encodeURIComponent(poojaId)}&package_id=${encodeURIComponent(packageId)}`);

// ---------------------------------------------------------------- user

export type DpUser = { dpUserId: string | null; token: string };

/** Create-or-login by phone. Also the documented token refresh. */
export async function loginUser(p: {
  phone: string; fullname: string; gotra?: string; email?: string;
}): Promise<DpUser> {
  const results = await dp<{ userDetails?: Record<string, unknown>; token?: string }>(
    NOAUTH, "/login/user/create",
    {
      method: "POST",
      body: {
        phone: p.phone,
        isdCode: "+91",
        fullname: p.fullname,
        countrycode: COUNTRY,
        platform: "web",
        ...(p.gotra ? { gotra: p.gotra } : {}),
        ...(p.email ? { email: p.email } : {}),
      },
    }
  );
  const token = results?.token;
  if (!token) throw new DevpunyaError("no_token", "DevPunya login returned no token");
  const u = results.userDetails ?? {};
  const dpUserId = (u["id"] ?? u["user_id"] ?? null) as string | null;
  return { dpUserId: dpUserId != null ? String(dpUserId) : null, token };
}

// ---------------------------------------------------------------- orders

export type Sankalp = { name: string; gotra: string };
export type DpOrderResult = {
  order_id: number | string;
  reference_id?: string;
  amount: number;
  currency?: string;
  status?: string;
  puja_name?: string;
  startingAt?: string;
};

export function createPujaOrder(token: string, p: {
  pujaId: number; packageId: number; addonIds: number[]; sankalp: Sankalp[];
  devoteeName?: string; wish?: string; city?: string; referenceId: string;
}): Promise<DpOrderResult> {
  return dp<DpOrderResult>(AUTH, "/pooja/partner/createPujaOrderWithoutPayment", {
    method: "POST",
    token,
    body: {
      puja_id: p.pujaId,
      package_id: p.packageId,
      add_ons: p.addonIds,
      sankalp_details: p.sankalp,
      reference_id: p.referenceId,
      ...(p.devoteeName ? { devotee_name: p.devoteeName } : {}),
      ...(p.wish ? { wish: p.wish } : {}),
      ...(p.city ? { city: p.city } : {}),
    },
  });
}

export function createChadawaOrder(token: string, p: {
  productId: number; packageId: number; offeringIds: number[]; sankalp: Sankalp[];
  devoteeName?: string; wish?: string; city?: string; referenceId: string;
}): Promise<DpOrderResult> {
  return dp<DpOrderResult>(AUTH, "/chadawa/partner/createChadawaOrderWithoutPayment", {
    method: "POST",
    token,
    body: {
      product_id: p.productId,
      package_id: p.packageId,
      offeringIds: p.offeringIds,
      sankalp_details: p.sankalp,
      details: { sankalp_deetails: p.sankalp },
      reference_id: p.referenceId,
      ...(p.devoteeName ? { devotee_name: p.devoteeName } : {}),
      ...(p.wish ? { wish: p.wish } : {}),
      ...(p.city ? { city: p.city } : {}),
    },
  });
}

/** After Razorpay settles: paid confirms (and fires their WhatsApp); failed records. */
export function updateOrderStatus(
  kind: "puja" | "chadhawa", token: string, dpOrderId: number | string,
  status: "paid" | "failed"
): Promise<unknown> {
  const path = kind === "puja" ? "/pooja/partner/updatePujaOrder" : "/chadawa/partner/updateChadawaOrder";
  return dp<unknown>(AUTH, path, {
    method: "POST",
    token,
    body: { id: Number(dpOrderId), transaction_status: status },
  });
}

export function getOrderById(
  kind: "puja" | "chadhawa", token: string, dpOrderId: number | string
): Promise<Record<string, unknown>> {
  const path =
    kind === "puja"
      ? `/pooja/getPoojaOrderById?pooja_order_id=${encodeURIComponent(dpOrderId)}`
      : `/chadawa/GetChadawaOrderByIdFromTable?order_id=${encodeURIComponent(dpOrderId)}`;
  return dp<Record<string, unknown>>(AUTH, path, { token });
}
