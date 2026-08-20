import { supabaseBrowser } from "./supabase";
import { Profile, UserState, EMPTY_STATE } from "./types";
import { ChatMsg } from "./chat";

/**
 * Run a Supabase read/write and fall back rather than throw.
 *
 * supabaseBrowser() throws synchronously when the client is unconfigured, so
 * `db.get…(…).then(…)` escaped the promise chain entirely and surfaced as an
 * uncaught error — a red dev overlay on a screen that was otherwise working,
 * and an unhandled rejection in production the first time the network blipped.
 * Persistence is best-effort here: reads degrade to a default and writes are
 * dropped, because losing a cached transcript should never take a screen down.
 */
async function safe<T>(run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch {
    return fallback;
  }
}

export async function getUser() {
  const { data } = await supabaseBrowser().auth.getUser();
  return data.user;
}

// Inside the Android shell, Capacitor injects window.Capacitor with the
// natively installed plugins. SocialLogin drives Google's on-device account
// sheet (Credential Manager) — no browser tab anywhere — and returns an ID
// token that Supabase verifies directly. On the web, nothing changes: the
// same full-page OAuth redirect as always.
type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  Plugins?: {
    SocialLogin?: {
      initialize: (o: object) => Promise<void>;
      login: (o: object) => Promise<{ result?: { idToken?: string } }>;
    };
  };
};

// The web OAuth client id — public by design (it rides in every Google login
// URL). The env var wins when present; the literal is the safety net so a
// build where the env failed to bake can never silently break native login.
const GOOGLE_WEB_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  "474770938673-kj851svo7je3flfcstb6p6kuh5bskfjv.apps.googleusercontent.com";

export async function signInGoogle() {
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  const social = cap?.isNativePlatform?.() ? cap.Plugins?.SocialLogin : undefined;

  if (cap?.isNativePlatform?.() && !social) {
    throw new Error("native shell has no SocialLogin plugin (rebuild the app)");
  }

  if (social) {
    await social.initialize({ google: { webClientId: GOOGLE_WEB_CLIENT_ID, mode: "online" } });
    const res = await social.login({ provider: "google", options: { scopes: ["email", "profile"] } });
    // plugin versions differ on nesting — accept both shapes
    const idToken =
      res?.result?.idToken ?? (res as { idToken?: string } | undefined)?.idToken;
    if (!idToken) throw new Error("Google returned no ID token.");
    const { error } = await supabaseBrowser().auth.signInWithIdToken({ provider: "google", token: idToken });
    if (error) throw error;
    return; // SIGNED_IN fires in-page; no redirect needed
  }

  const { error } = await supabaseBrowser().auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin, queryParams: { prompt: "select_account" } },
  });
  if (error) throw error;
}

/**
 * Phone sign-in, in two steps: request a code, then verify it. Supabase sends
 * the SMS through whichever provider is configured on the project — with none
 * set up, sendPhoneOtp throws and the screen says so rather than sitting on a
 * spinner waiting for a message that is never coming.
 *
 * `phone` must be E.164 (+919876543210). The screen prefixes +91.
 */
export async function sendPhoneOtp(phone: string) {
  const { error } = await supabaseBrowser().auth.signInWithOtp({ phone });
  if (error) throw error;
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const { error } = await supabaseBrowser().auth.verifyOtp({ phone, token, type: "sms" });
  if (error) throw error;
}

export async function signOut() {
  await supabaseBrowser().auth.signOut();
}

export async function getProfile(id: string): Promise<Profile | null> {
  return safe(async () => {
    const { data } = await supabaseBrowser().from("profiles").select("*").eq("id", id).maybeSingle();
    return (data as Profile) ?? null;
  }, null);
}

export async function saveProfile(id: string, fields: Partial<Profile>): Promise<Profile | null> {
  return safe(async () => {
    const { data } = await supabaseBrowser()
      .from("profiles")
      .upsert({ id, ...fields, updated_at: new Date().toISOString() })
      .select()
      .maybeSingle();
    return (data as Profile) ?? null;
  }, null);
}

export async function getState(id: string): Promise<UserState> {
  return safe(async () => {
    const { data } = await supabaseBrowser().from("user_state").select("*").eq("id", id).maybeSingle();
    if (!data) {
      await supabaseBrowser().from("user_state").upsert({ id }).select().maybeSingle();
      return { ...EMPTY_STATE };
    }
    return data as UserState;
  }, { ...EMPTY_STATE });
}

export async function patchState(id: string, fields: Partial<UserState>) {
  await safe(async () => {
    await supabaseBrowser()
      .from("user_state")
      .upsert({ id, ...fields, updated_at: new Date().toISOString() });
  }, undefined);
}

export async function getMessages(uid: string, thread: string): Promise<ChatMsg[]> {
  return safe(async () => {
    const { data } = await supabaseBrowser()
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", uid)
      .eq("thread", thread)
      .order("id", { ascending: true })
      .limit(100);
    return (data as ChatMsg[]) ?? [];
  }, []);
}

export async function addMessages(uid: string, thread: string, msgs: ChatMsg[]) {
  if (!msgs.length) return;
  await safe(async () => {
    await supabaseBrowser()
      .from("chat_messages")
      .insert(msgs.map((m) => ({ user_id: uid, thread, role: m.role, content: m.content })));
  }, undefined);
}

export async function saveBooking(
  uid: string,
  b: { kind: string; item: string; price: number; temple: string; sankalp_name: string; gotra: string; wish: string; booking_ref: string }
) {
  await safe(async () => {
    await supabaseBrowser().from("bookings").insert({ user_id: uid, ...b });
  }, undefined);
}
