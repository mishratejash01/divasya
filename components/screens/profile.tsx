"use client";

import { useState } from "react";
import { Check } from "@phosphor-icons/react";
import { useApp } from "../app-context";
import { ScreenHeader, cx } from "../ui";
import { useCatalog, getDeities } from "@/lib/catalog";
import { DEITIES } from "@/lib/demo";

/**
 * Birth details are not settings — they are the input to every chart, dasha and
 * muhurat the app computes. Getting them wrong once at onboarding used to be
 * permanent. Saving here recomputes the rashi and janma nakshatra from the
 * engine, exactly as onboarding does.
 */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-[6px] px-2.5 py-2" style={{ background: "var(--surface-2)" }}>
      <span className="eyebrow block text-muted">{label}</span>
      {children}
      {hint && <span className="mt-0.5 block text-[10px] leading-tight text-[var(--muted-2)]">{hint}</span>}
    </label>
  );
}

const input = "mt-0.5 w-full bg-transparent text-[12.5px] text-ink outline-none placeholder:text-[var(--muted-2)]";

export function ProfileScreen() {
  const { back, haptic, profile, completeOnboarding } = useApp();
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

      <div className="gutter pt-2">
        <section className="rounded-2xl surface p-2.5">
          <h3 className="section-title mb-1.5">About you</h3>
          <div className="grid gap-1.5">
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="Your name" />
            </Field>
            <Field label="Gender">
              <div className="mt-1 flex gap-1.5">
                {[["m", "Male"], ["f", "Female"], ["o", "Other"]].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setGender(v)}
                    className={cx("rounded-full px-3 py-1.5 text-[11px]", gender === v ? "btn-saffron" : "btn-white")}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </section>
      </div>

      <div className="gutter pt-1.5">
        <section className="rounded-2xl surface p-2.5">
          <h3 className="section-title mb-1.5">Birth details</h3>
          <div className="grid gap-1.5">
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
        </section>
      </div>

      <div className="gutter pt-1.5">
        <section className="rounded-2xl surface p-2.5">
          <h3 className="section-title mb-1.5">Ishta devta</h3>
          <div className="flex flex-wrap gap-1.5">
            {deities.map((d) => (
              <button
                key={d.id}
                onClick={() => setDeityId(d.id)}
                className={cx("rounded-full px-3 py-1.5 text-[11px]", deityId === d.id ? "btn-saffron" : "btn-white")}
              >
                {d.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="gutter pt-2.5">
        <button
          onClick={save}
          disabled={!changed || saving}
          className={cx("flex w-full items-center justify-center gap-1.5 rounded-2xl py-3 text-[12.5px]", changed ? "btn-saffron" : "btn-white")}
        >
          {saving ? "Saving…" : saved ? <><Check size={14} weight="bold" /> Saved</> : changed ? "Save changes" : "Nothing to save"}
        </button>
        {changed && (
          <div className="mt-2 text-center text-[10px] text-muted">
            Your chart, dasha and daily readings are recomputed when you save.
          </div>
        )}
      </div>
    </div>
  );
}
