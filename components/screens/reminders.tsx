"use client";

import { useMemo, useState } from "react";
import { useApp } from "../app-context";
import { Iconify } from "../iconify";
import { ScreenHeader } from "../ui";
import { bell } from "@/lib/sound";

/**
 * Temple Bell Reminders — gentle devotional nudges through the day.
 *
 * There is no push backend yet, so everything here is local state: the screen
 * exists to let a devotee shape the rhythm of their day and hear the bell that
 * would ring. Times are chosen from a small set of sensible presets rather than
 * a full clock — a reminder wants a moment, not a stopwatch.
 */
type Reminder = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  time: string;
  on: boolean;
  /** Common moments to swap between — kept short so the choice stays a glance. */
  presets: string[];
};

const INITIAL: Reminder[] = [
  {
    id: "morning-aarti",
    title: "Morning Aarti",
    subtitle: "Begin the day at the deity's feet",
    icon: "solar:sunrise-bold-duotone",
    time: "6:00 AM",
    on: true,
    presets: ["5:30 AM", "6:00 AM", "6:30 AM", "7:00 AM"],
  },
  {
    id: "daily-wisdom",
    title: "Daily Wisdom",
    subtitle: "A verse and its meaning for today",
    icon: "solar:book-bold-duotone",
    time: "8:30 AM",
    on: true,
    presets: ["7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM"],
  },
  {
    id: "midday-meditation",
    title: "Midday Meditation",
    subtitle: "A quiet pause to gather the mind",
    icon: "solar:meditation-bold-duotone",
    time: "1:00 PM",
    on: false,
    presets: ["12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM"],
  },
  {
    id: "jap-reminder",
    title: "Jap Reminder",
    subtitle: "Turn the mala, take the name",
    icon: "game-icons:prayer-beads",
    time: "6:30 PM",
    on: true,
    presets: ["5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM"],
  },
  {
    id: "evening-aarti",
    title: "Evening Aarti",
    subtitle: "Close the day with a lit diya",
    icon: "solar:moon-stars-bold-duotone",
    time: "7:00 PM",
    on: true,
    presets: ["6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"],
  },
];

// A pill switch built from divs: saffron with the knob thrown right when on,
// grey with it resting left when off. The knob slides rather than snaps.
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-200"
      style={{ background: on ? "var(--bhagwa)" : "var(--line-strong)" }}
    >
      <span
        className="absolute top-1/2 h-[20px] w-[20px] -translate-y-1/2 rounded-full bg-white transition-all duration-200"
        style={{
          left: on ? 23 : 3,
          boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
        }}
      />
    </button>
  );
}

export function RemindersScreen() {
  const { back, haptic } = useApp();
  const [items, setItems] = useState<Reminder[]>(INITIAL);
  // Which row currently has its preset chips open. One at a time keeps it calm.
  const [editing, setEditing] = useState<string | null>(null);

  const onCount = useMemo(() => items.filter((r) => r.on).length, [items]);

  const toggle = (id: string) => {
    haptic(6);
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, on: !r.on } : r)));
  };

  const setTime = (id: string, time: string) => {
    haptic(4);
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, time } : r)));
    setEditing(null);
  };

  const preview = () => {
    haptic(10);
    bell(700, 1.4, 0.2);
  };

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Reminders" onBack={back} />

      <div className="flex-1 overflow-y-auto no-scrollbar screen-bottom">
        <div className="gutter pt-3 lg:mx-auto lg:max-w-xl">
          {/* intro — the promise of the screen, and the bell it stands for */}
          <div className="card-temple rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
                style={{ background: "rgba(206,185,118,0.20)", border: "1px solid var(--line-gold)" }}
              >
                <Iconify icon="solar:bell-bold-duotone" width={22} height={22} className="text-[var(--icon-ink)]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-display text-[16px] leading-tight text-ink">Temple Bell Reminders</div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                  Let a soft temple bell call you back to your devotion through the day — a nudge, never a nag.
                </p>
              </div>
            </div>

            <div className="mt-3.5 flex items-center justify-between gap-3">
              <span className="text-[12px] text-muted tnum">
                <span className="font-medium text-ink">{onCount}</span> of {items.length} reminders on
              </span>
              <button
                onClick={preview}
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-medium btn-saffron"
              >
                <Iconify icon="solar:bell-bing-bold-duotone" width={16} height={16} className="text-white" />
                Play temple bell
              </button>
            </div>
          </div>

          {/* the reminders — one open list on a single surface block */}
          <h3 className="section-title mb-1.5 mt-5">Through the day</h3>
          <div className="overflow-hidden rounded-2xl surface">
            {items.map((r, i) => {
              const open = editing === r.id;
              return (
                <div
                  key={r.id}
                  style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)" }}
                >
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                      style={{
                        background: r.on ? "rgba(242,107,15,0.10)" : "var(--surface-2)",
                        border: "1px solid var(--line-gold)",
                      }}
                    >
                      <Iconify
                        icon={r.icon}
                        width={22}
                        height={22}
                        className="text-[var(--icon-ink)]"
                        style={{ opacity: r.on ? 1 : 0.55 }}
                      />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-medium text-ink">{r.title}</div>
                      <div className="truncate text-[11.5px] text-muted">{r.subtitle}</div>
                    </div>

                    {/* time — tap to reveal preset chips below */}
                    <button
                      onClick={() => setEditing(open ? null : r.id)}
                      className="shrink-0 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium tnum text-ink transition-colors"
                      style={{
                        background: open ? "var(--surface-2)" : "transparent",
                        border: `1px solid ${open ? "var(--line-gold)" : "transparent"}`,
                      }}
                    >
                      {r.time}
                    </button>

                    <Toggle on={r.on} onToggle={() => toggle(r.id)} />
                  </div>

                  {open && (
                    <div className="flex flex-wrap gap-2 px-4 pb-3.5 pt-0.5">
                      {r.presets.map((p) => {
                        const active = p === r.time;
                        return (
                          <button
                            key={p}
                            onClick={() => setTime(r.id, p)}
                            className="rounded-lg px-3 py-1.5 text-[12px] font-medium tnum transition-colors"
                            style={{
                              background: active ? "var(--icon-ink)" : "transparent",
                              color: active ? "#fff" : "var(--ink)",
                              border: `1px solid ${active ? "transparent" : "var(--line-strong)"}`,
                            }}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-4 px-1 text-[11px] leading-relaxed text-[var(--muted-2)]">
            Reminders live on this device. Keep the app's sound on to hear the bell.
          </p>
        </div>
      </div>
    </div>
  );
}
