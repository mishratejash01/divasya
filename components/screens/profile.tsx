"use client";

import { useState } from "react";
import { Check } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader, cx } from "../ui";
import { useCatalog, getDeities } from "@/lib/catalog";
import { DEITIES } from "@/lib/demo";
import { supabaseBrowser } from "@/lib/supabase";

/**
 * Birth details are not settings — they are the input to every chart, dasha and
 * muhurat the app computes. Getting them wrong once at onboarding used to be
 * permanent. Saving here recomputes the rashi and janma nakshatra from the
 * engine, exactly as onboarding does.
 */
// An outlined field on the white ground — the label sits small above the value,
// and the border warms to kumkum while you're typing in it.
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-xl border border-[var(--tile-line)] px-3 py-2.5 transition-colors focus-within:border-[var(--icon-ink)]">
      <span className="eyebrow block text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10px] leading-tight text-[var(--muted-2)]">{hint}</span>}
    </label>
  );
}

const input = "mt-1 w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-[var(--muted-2)]";

// Selectable chip, same shape and colour as the app's filter chips.
const chipCls = (on: boolean) =>
  cx("rounded-lg border px-3.5 py-1.5 text-[12px] font-medium transition-colors", on ? "border-transparent text-white" : "text-ink");
const chipStyle = (on: boolean) => ({
  background: on ? "var(--icon-ink)" : "transparent",
  borderColor: on ? "transparent" : "var(--tile-line)",
});

export function ProfileScreen() {
  const { back, haptic, profile, completeOnboarding, logout } = useApp();

  // Account deletion lives here, one level deep, per Play policy: it must be
  // reachable in the app, not paraded on the Account tab. Two taps: the first
  // arms for a few seconds, the second calls the server wipe.
  const [armDelete, setArmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteAccount = async () => {
    if (deleting) return;
    if (!armDelete) {
      haptic(8);
      setArmDelete(true);
      setTimeout(() => setArmDelete(false), 6000);
      return;
    }
    setDeleting(true);
    try {
      const { data: s } = await supabaseBrowser().auth.getSession();
      const token = s.session?.access_token;
      if (!token) throw new Error("no session");
      const r = await fetch("/api/account/delete", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) throw new Error("delete failed");
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith("divasya"))
          .forEach((k) => localStorage.removeItem(k));
      } catch { /* storage blocked: server data is gone regardless */ }
      await supabaseBrowser().auth.signOut().catch(() => {});
      await logout().catch(() => {});
    } catch {
      setDeleting(false);
      setArmDelete(false);
    }
  };
  const deities = useCatalog(getDeities, DEITIES);

  const [name, setName] = useState(profile?.name ?? "");
  const [dob, setDob] = useState(profile?.dob ?? "");
  const [tob, setTob] = useState(profile?.tob ?? "");
  const [birthplace, setBirthplace] = useState(profile?.birthplace ?? "");
  const [current, setCurrent] = useState(profile?.current_location ?? "");
  const [gender, setGender] = useState(profile?.gender ?? "");
  const [deityId, setDeityId] = useState(profile?.deity_id ?? "krishna");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const changed =
    name !== (profile?.name ?? "") || dob !== (profile?.dob ?? "") || tob !== (profile?.tob ?? "") ||
    birthplace !== (profile?.birthplace ?? "") || current !== (profile?.current_location ?? "") ||
    gender !== (profile?.gender ?? "") || deityId !== (profile?.deity_id ?? "krishna");

  async function save() {
    if (!changed || saving) return;
    haptic(10);
    setSaving(true);
    try {
      // Recomputes rashi + nakshatra from the birth details before writing.
      await completeOnboarding({
        name: name.trim() || null,
        dob: dob || null,
        tob: tob || null,
        birthplace: birthplace.trim() || null,
        current_location: current.trim() || null,
        gender: gender || null,
        deity_id: deityId,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar screen-bottom">
      <ScreenHeader title="Your details" onBack={back} />

      <div className="gutter pt-4">
        <h3 className="section-title mb-2.5 lg:text-[16px]">About you</h3>
        <div className="grid items-start gap-3 lg:grid-cols-2">
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="Your name" />
          </Field>
          <div>
            <span className="eyebrow mb-1.5 block text-muted">Gender</span>
            <div className="flex gap-2">
              {[["m", "Male"], ["f", "Female"], ["o", "Other"]].map(([v, l]) => (
                <button key={v} onClick={() => setGender(v)} className={chipCls(gender === v)} style={chipStyle(gender === v)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="gutter pt-5">
        <h3 className="section-title mb-2.5 lg:text-[16px]">Birth details</h3>
        <div className="grid items-start gap-3 lg:grid-cols-2">
          <Field label="Date of birth">
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={input} />
          </Field>
          <Field label="Time of birth" hint="The lagna moves a full sign every two hours, so the closer this is, the truer your chart.">
            <input type="time" value={tob} onChange={(e) => setTob(e.target.value)} className={input} />
          </Field>
          <Field label="Place of birth" hint="City is enough. It fixes the lagna and the timezone.">
            <input value={birthplace} onChange={(e) => setBirthplace(e.target.value)} className={input} placeholder="e.g. Varanasi, Uttar Pradesh" />
          </Field>
          <Field label="Where you live now">
            <input value={current} onChange={(e) => setCurrent(e.target.value)} className={input} placeholder="City" />
          </Field>
        </div>
      </div>

      <div className="gutter pt-5">
        <h3 className="section-title mb-2.5 lg:text-[16px]">Ishta devta</h3>
        <div className="flex flex-wrap gap-2">
          {deities.map((d) => (
            <button key={d.id} onClick={() => setDeityId(d.id)} className={chipCls(deityId === d.id)} style={chipStyle(deityId === d.id)}>
              {d.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="gutter pt-6 lg:max-w-sm">
        <button
          onClick={save}
          disabled={!changed || saving}
          className={cx("flex w-full items-center justify-center gap-1.5 rounded-2xl py-3.5 text-[13px] font-medium", changed ? "btn-saffron" : "btn-white")}
        >
          {saving ? "Saving…" : saved ? <><Check size={14} weight="bold" /> Saved</> : changed ? "Save changes" : "Nothing to save"}
        </button>
        {changed && (
          <div className="mt-2 text-center text-[10px] text-muted">
            Your chart, dasha and daily readings are recomputed when you save.
          </div>
        )}

        <button
          onClick={deleteAccount}
          className="mx-auto mt-8 block pb-2 text-center text-[11px] font-medium text-[#A83226]"
        >
          {deleting
            ? "Deleting your account…"
            : armDelete
              ? "Tap again to permanently delete your account and all data"
              : "Delete account"}
        </button>
      </div>
    </div>
  );
}
