import { supabaseBrowser } from "./supabase";
import { Profile, UserState, EMPTY_STATE } from "./types";
import { ChatMsg } from "./chat";

export async function getUser() {
  const { data } = await supabaseBrowser().auth.getUser();
  return data.user;
}

export async function signInAnon() {
  const { data, error } = await supabaseBrowser().auth.signInAnonymously();
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  await supabaseBrowser().auth.signOut();
}

export async function getProfile(id: string): Promise<Profile | null> {
  const { data } = await supabaseBrowser().from("profiles").select("*").eq("id", id).maybeSingle();
  return (data as Profile) ?? null;
}

export async function saveProfile(id: string, fields: Partial<Profile>): Promise<Profile | null> {
  const { data } = await supabaseBrowser()
    .from("profiles")
    .upsert({ id, ...fields, updated_at: new Date().toISOString() })
    .select()
    .maybeSingle();
  return (data as Profile) ?? null;
}

export async function getState(id: string): Promise<UserState> {
  const { data } = await supabaseBrowser().from("user_state").select("*").eq("id", id).maybeSingle();
  if (!data) {
    await supabaseBrowser().from("user_state").upsert({ id }).select().maybeSingle();
    return { ...EMPTY_STATE };
  }
  return data as UserState;
}

export async function patchState(id: string, fields: Partial<UserState>) {
  await supabaseBrowser()
    .from("user_state")
    .upsert({ id, ...fields, updated_at: new Date().toISOString() });
}

export async function getMessages(uid: string, thread: string): Promise<ChatMsg[]> {
  const { data } = await supabaseBrowser()
    .from("chat_messages")
    .select("role, content")
    .eq("user_id", uid)
    .eq("thread", thread)
    .order("created_at", { ascending: true })
    .limit(100);
  return (data as ChatMsg[]) ?? [];
}

export async function addMessages(uid: string, thread: string, msgs: ChatMsg[]) {
  if (!msgs.length) return;
  await supabaseBrowser()
    .from("chat_messages")
    .insert(msgs.map((m) => ({ user_id: uid, thread, role: m.role, content: m.content })));
}

export async function saveBooking(
  uid: string,
  b: { kind: string; item: string; price: number; temple: string; sankalp_name: string; gotra: string; wish: string; booking_ref: string }
) {
  await supabaseBrowser().from("bookings").insert({ user_id: uid, ...b });
}
